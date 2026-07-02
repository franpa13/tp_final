const { Pago, Reserva, User, Canchas } = require('../models');
const { Preference, Payment } = require('mercadopago');
const mpClient = require('../config/mercadopago');

const pagoCtrl = {};

// GET /api/pagos
// Lista todos los pagos con la reserva y sus relaciones anidadas.
// Ejemplo de include anidado: Pago → Reserva → Cancha y Usuario
pagoCtrl.getAll = async (req, res, next) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 10);
    const offset = (page - 1) * limit;
    const { estado } = req.query;

    const where = {};
    if (estado) {
      where.estado = estado;
    }

    const { count, rows: pagos } = await Pago.findAndCountAll({
      where,
      include: [{
        model: Reserva,
        as: 'reserva',
        include: [
          { model: Canchas, as: 'cancha', attributes: ['id', 'nombreCancha', 'type'] },
          { model: User,    as: 'admin',  attributes: ['id', 'name', 'email'] },
        ],
      }],
      limit,
      offset,
      distinct: true,
    });

    res.status(200).json({
      data: {
        pagos,
        total:      count,
        page,
        totalPages: Math.ceil(count / limit),
        limit,
      },
      message: 'Pagos obtenidos correctamente',
    });
  } catch (e) {
    next(e);
  }
};

// GET /api/pagos/:id
pagoCtrl.getById = async (req, res, next) => {
  try {
    const pago = await Pago.findByPk(req.params.id, {
      include: [{ model: Reserva, as: 'reserva' }],
    });

    if (!pago) {
      const error = new Error('Pago no encontrado');
      error.status = 404;
      return next(error);
    }

    res.status(200).json({ data: { pago }, message: 'Pago obtenido correctamente' });
  } catch (e) {
    next(e);
  }
};

// POST /api/pagos
// Registra el pago de una reserva.
// Valida que la reserva exista y que no tenga ya un pago registrado.
pagoCtrl.create = async (req, res, next) => {
  try {
    const { reservaId, monto, metodoPago } = req.body;

    const reserva = await Reserva.findByPk(reservaId);
    if (!reserva) {
      const error = new Error('Reserva no encontrada');
      error.status = 404;
      return next(error);
    }

    // Como reservaId es UNIQUE en la tabla Pagos, findOne es suficiente para detectar duplicado
    const pagoExistente = await Pago.findOne({ where: { reservaId } });
    if (pagoExistente) {
      const error = new Error('Esta reserva ya tiene un pago registrado');
      error.status = 409;
      return next(error);
    }

    const pago = await Pago.create({ reservaId, monto, metodoPago, estado: 'pagado' });

    // Al registrar el pago, la reserva pasa a confirmada automáticamente
    await reserva.update({ estado: 'confirmada' });

    res.status(201).json({ data: { pago }, message: 'Pago registrado correctamente' });
  } catch (e) {
    next(e);
  }
};

// PUT /api/pagos/:id/estado
// Cambia el estado de un pago (ej: a 'reembolsado').
pagoCtrl.cambiarEstado = async (req, res, next) => {
  try {
    const { estado } = req.body;
    const estadosValidos = ['pendiente', 'pagado', 'reembolsado'];

    if (!estadosValidos.includes(estado)) {
      const error = new Error(`Estado inválido. Valores permitidos: ${estadosValidos.join(', ')}`);
      error.status = 400;
      return next(error);
    }

    const pago = await Pago.findByPk(req.params.id);
    if (!pago) {
      const error = new Error('Pago no encontrado');
      error.status = 404;
      return next(error);
    }

    await pago.update({ estado });

    res.status(200).json({ data: { pago }, message: `Pago marcado como ${estado}` });
  } catch (e) {
    next(e);
  }
};

// ============================================================================
// INTEGRACIÓN CON MERCADOPAGO (Checkout Pro)
// ============================================================================
//
// Flujo completo, de punta a punta:
//
// 1. El frontend llama a POST /api/pagos/mp/preferencia con el reservaId.
//    `crearPreferencia` arma un ítem con los datos de la cancha/reserva y crea
//    una "Preference" en MercadoPago. MP devuelve un `init_point`: la URL del
//    checkout hospedado por MP donde el cliente va a ingresar sus datos de pago.
//
// 2. El frontend redirige al navegador a ese `init_point`
//    (`window.location.href = init_point`). A partir de acá el pago ocurre
//    100% en la infraestructura de MercadoPago; este backend no participa.
//
// 3. Cuando el cliente termina el checkout, MP lo redirige de vuelta a una de
//    las `back_urls` (success/failure/pending) configuradas en la preferencia.
//    Esas URLs son solo para la experiencia visual del usuario — MP también
//    puede tardar en confirmar el pago, así que la redirección NO es la fuente
//    de verdad de si el pago se acreditó.
//
// 4. En paralelo (server-to-server, sin pasar por el navegador del cliente),
//    MP llama de forma asíncrona a `notification_url` (nuestro webhook,
//    `POST /api/pagos/mp/webhook`) cada vez que el estado de un pago cambia.
//    Esta es la ÚNICA fuente confiable para saber si el pago se aprobó:
//    `webhook` reconsulta el pago contra la API de MP (`payment.get`) en vez
//    de confiar en el body que mandó la notificación, valida que esté
//    `approved`, y recién ahí crea el registro de `Pago` y confirma la
//    `Reserva` (mismo efecto que un pago manual vía `pagoCtrl.create`).
//
// Detalles importantes de la implementación:
// - `external_reference` viaja en la preferencia con el `reservaId`, y es lo
//   que permite al webhook (paso 4) saber a qué reserva de nuestro sistema
//   corresponde el pago aprobado en MP.
// - `notification_url` sólo se manda si `BACKEND_URL` no es localhost, porque
//   MercadoPago rechaza configurar webhooks apuntando a localhost. En
//   desarrollo local, el webhook nunca se dispara — para probar el flujo
//   completo hay que exponer el backend con algo tipo ngrok o probar en un
//   ambiente desplegado.
// - Tanto `crearPreferencia` como `webhook` verifican que no exista ya un
//   `Pago` para esa reserva (`reservaId` es UNIQUE), evitando duplicados si
//   MP reintenta la notificación o el usuario repite el checkout.
// - El webhook siempre responde 200, incluso si el procesamiento interno
//   falla (ver catch): si le devolviéramos un error, MP reintentaría la
//   notificación indefinidamente.

// POST /api/pagos/mp/preferencia
// Paso 1 del flujo: crea la preferencia y devuelve el init_point (URL de checkout).
pagoCtrl.crearPreferencia = async (req, res, next) => {
  try {
    const { reservaId } = req.body;

    const reserva = await Reserva.findByPk(reservaId, {
      include: [{ model: Canchas, as: 'cancha' }],
    });

    if (!reserva) {
      const error = new Error('Reserva no encontrada');
      error.status = 404;
      return next(error);
    }

    const pagoExistente = await Pago.findOne({ where: { reservaId } });
    if (pagoExistente) {
      const error = new Error('Esta reserva ya tiene un pago registrado');
      error.status = 409;
      return next(error);
    }

    const backendUrl = process.env.BACKEND_URL || '';
    const isLocalhost = backendUrl.includes('localhost') || backendUrl.includes('127.0.0.1');

    const preference = new Preference(mpClient);
    const result = await preference.create({
      body: {
        items: [{
          title: `Cancha ${reserva.cancha.nombreCancha} - ${reserva.fecha}`,
          quantity: 1,
          unit_price: parseFloat(reserva.cancha.precio),
          currency_id: 'ARS',
        }],
        back_urls: {
          success: `${process.env.FRONTEND_URL}/pago/success`,
          failure: `${process.env.FRONTEND_URL}/pago/failure`,
          pending: `${process.env.FRONTEND_URL}/pago/pending`,
        },
        auto_return: 'approved',
        // MP rechaza URLs de localhost — solo se envía en producción con URL pública
        ...(!isLocalhost && { notification_url: `${backendUrl}/api/pagos/mp/webhook` }),
        external_reference: reservaId,
      },
    });

    const checkoutUrl = result.init_point;

    res.status(200).json({
      data: { init_point: checkoutUrl },
      message: 'Preferencia de pago creada',
    });
  } catch (e) {
    next(e);
  }
};

// POST /api/pagos/mp/webhook
// Paso 4 del flujo (ver bloque de comentarios arriba de `crearPreferencia`):
// MercadoPago llama a este endpoint server-to-server cuando cambia el estado
// de un pago. Sin authRequired porque lo llama MP, no un usuario logueado.
pagoCtrl.webhook = async (req, res) => {
  try {
    const { type, data } = req.body;

    if (type !== 'payment' || !data?.id) {
      return res.sendStatus(200);
    }

    const payment = new Payment(mpClient);
    const mpPago = await payment.get({ id: data.id });

    if (mpPago.status !== 'approved') {
      return res.sendStatus(200);
    }

    const reservaId = mpPago.external_reference;

    const pagoExistente = await Pago.findOne({ where: { reservaId } });
    if (pagoExistente) {
      return res.sendStatus(200);
    }

    const reserva = await Reserva.findByPk(reservaId);
    if (!reserva) {
      return res.sendStatus(200);
    }

    await Pago.create({
      reservaId,
      monto: mpPago.transaction_amount,
      metodoPago: 'mercadopago',
      mpPaymentId: String(mpPago.id),
      estado: 'pagado',
    });

    await reserva.update({ estado: 'confirmada' });

    res.sendStatus(200);
  } catch (e) {
    console.error('Webhook MP error:', e.message);
    res.sendStatus(200);
  }
};

module.exports = pagoCtrl;
