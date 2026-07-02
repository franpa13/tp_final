const { Op } = require('sequelize');
const { Reserva, Canchas, User } = require('../models');

const reservaCtrl = {};

// GET /api/reservas
// Admin/superadmin ven todas las reservas activas (no canceladas).
// Un CLIENTE solo ve las suyas, incluyendo las canceladas (es su propio historial).
reservaCtrl.getAll = async (req, res, next) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 10);
    const offset = (page - 1) * limit;
    const { nombreCliente } = req.query;

    const where = {};
    if (req.user.type === 'CLIENTE') {
      where.clienteId = req.user.id;
    } else {
      where.estado = { [Op.ne]: 'cancelada' };
    }
    if (nombreCliente) {
      where.nombreCliente = { [Op.iLike]: `%${nombreCliente}%` };
    }

    const { count, rows: reservas } = await Reserva.findAndCountAll({
      where,
      include: [
        { model: Canchas, as: 'cancha', attributes: ['id', 'nombreCancha', 'type', 'precio'] },
        { model: User,    as: 'admin',  attributes: ['id', 'name'] },
      ],
      order: [['fecha', 'ASC'], ['horaInicio', 'ASC']],
      limit,
      offset,
      distinct: true,
    });

    res.status(200).json({
      data: {
        reservas,
        total:      count,
        page,
        totalPages: Math.ceil(count / limit),
        limit,
      },
      message: 'Reservas obtenidas correctamente',
    });
  } catch (e) {
    next(e);
  }
};

// GET /api/reservas/:id
reservaCtrl.getById = async (req, res, next) => {
  try {
    const reserva = await Reserva.findOne({
      where: { id: req.params.id },
      include: [
        { model: Canchas, as: 'cancha' },
        { model: User, as: 'admin', attributes: ['id', 'name'] },
      ],
    });

    if (!reserva) {
      const error = new Error('Reserva no encontrada');
      error.status = 404;
      return next(error);
    }

    if (req.user.type === 'CLIENTE' && reserva.clienteId !== req.user.id) {
      const error = new Error('No tenés permisos para ver esta reserva');
      error.status = 403;
      return next(error);
    }

    res.status(200).json({ data: { reserva }, message: 'Reserva obtenida correctamente' });
  } catch (e) {
    next(e);
  }
};

// POST /api/reservas
// Un admin carga una reserva con los datos de un cliente externo (sin cuenta).
// Un CLIENTE pide una reserva para sí mismo: sus datos de contacto salen de su
// propio perfil, nunca del body, para que no pueda reservar "como" otra persona.
// En ambos casos se valida que la cancha no tenga otro turno activo que se
// superponga con el rango horario pedido.
reservaCtrl.create = async (req, res, next) => {
  try {
    const { canchaId, fecha, horaInicio, horaFin } = req.body;

    // creadoPor viene del token JWT — identifica quién está operando (admin o cliente)
    const creadoPor = req.user.id;

    let clienteId = null;
    let nombreCliente = req.body.nombreCliente;
    let telefonoCliente = req.body.telefonoCliente;

    if (req.user.type === 'CLIENTE') {
      const cliente = await User.findByPk(req.user.id);
      if (!cliente) {
        const error = new Error('Usuario no encontrado');
        error.status = 404;
        return next(error);
      }
      clienteId = cliente.id;
      nombreCliente = cliente.name;
      telefonoCliente = cliente.telefono;
    }

    // Validación de disponibilidad: regla central del negocio.
    // Hay conflicto si existe una reserva activa cuyo rango se superpone con el pedido.
    // Superposición: el existente empieza antes de que el nuevo termine
    //                Y termina después de que el nuevo empieza.
    const conflicto = await Reserva.findOne({
      where: {
        canchaId,
        fecha,
        estado: { [Op.in]: ['pendiente', 'confirmada'] },
        horaInicio: { [Op.lt]: horaFin },
        horaFin:    { [Op.gt]: horaInicio },
      },
    });

    if (conflicto) {
      const error = new Error('La cancha ya tiene una reserva en ese horario');
      error.status = 409;
      return next(error);
    }

    const reserva = await Reserva.create({
      canchaId,
      creadoPor,
      clienteId,
      nombreCliente,
      telefonoCliente,
      fecha,
      horaInicio,
      horaFin,
    });

    res.status(201).json({ data: { reserva }, message: 'Reserva creada correctamente' });
  } catch (e) {
    next(e);
  }
};

// PATCH /api/reservas/:id/estado
// Admin/superadmin pueden cambiar el turno a cualquier estado (confirmar, cancelar, finalizar).
// Un CLIENTE solo puede cancelar SU PROPIA reserva, y solo si todavía está pendiente/confirmada
// (no tiene sentido "cancelar" algo que ya se canceló o ya finalizó).
reservaCtrl.cambiarEstado = async (req, res, next) => {
  try {
    const { estado } = req.body;
    const estadosValidos = ['pendiente', 'confirmada', 'cancelada', 'finalizada'];

    if (!estadosValidos.includes(estado)) {
      const error = new Error(`Estado inválido. Valores permitidos: ${estadosValidos.join(', ')}`);
      error.status = 400;
      return next(error);
    }

    const reserva = await Reserva.findByPk(req.params.id);

    if (!reserva) {
      const error = new Error('Reserva no encontrada');
      error.status = 404;
      return next(error);
    }

    if (req.user.type === 'CLIENTE') {
      if (reserva.clienteId !== req.user.id) {
        const error = new Error('No tenés permisos para modificar esta reserva');
        error.status = 403;
        return next(error);
      }
      if (estado !== 'cancelada') {
        const error = new Error('Como cliente solo podés cancelar una reserva');
        error.status = 403;
        return next(error);
      }
      if (!['pendiente', 'confirmada'].includes(reserva.estado)) {
        const error = new Error('Esta reserva ya no se puede cancelar');
        error.status = 409;
        return next(error);
      }
    }

    await reserva.update({ estado });

    res.status(200).json({ data: { reserva }, message: `Reserva marcada como ${estado}` });
  } catch (e) {
    next(e);
  }
};

module.exports = reservaCtrl;
