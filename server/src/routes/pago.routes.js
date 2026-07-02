const { Router } = require('express');
const router = Router();
const pagoCtrl = require('../controllers/pago.controller');
const authRequired = require('../middlewares/authMiddleware');
const requireRole = require('../middlewares/roleMiddleware');

// Todas las rutas de pagos (salvo el webhook de MercadoPago, que lo llama MP
// directamente sin sesión de usuario) requieren rol ADMIN o SUPERADMIN.
// Un CLIENTE puede pedir reservas pero no gestiona pagos.
const soloStaff = requireRole('ADMIN', 'SUPERADMIN');

/**
 * @openapi
 * /pagos:
 *   get:
 *     tags: [Pagos]
 *     summary: Listar todos los pagos (paginado)
 *     description: Incluye la reserva asociada, con su cancha y el admin que la creó.
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: Pagos obtenidos correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   allOf:
 *                     - $ref: '#/components/schemas/Pagination'
 *                     - type: object
 *                       properties:
 *                         pagos:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Pago'
 *                 message:
 *                   type: string
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *   post:
 *     tags: [Pagos]
 *     summary: Registrar un pago manual de una reserva
 *     description: Pago manual (efectivo, transferencia o tarjeta). Al registrarlo, la reserva pasa a estado confirmada.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PagoCreateBody'
 *     responses:
 *       201:
 *         description: Pago registrado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     pago:
 *                       $ref: '#/components/schemas/Pago'
 *                 message:
 *                   type: string
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         description: Reserva no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Esta reserva ya tiene un pago registrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/',      authRequired, soloStaff, pagoCtrl.getAll);

/**
 * @openapi
 * /pagos/{id}:
 *   get:
 *     tags: [Pagos]
 *     summary: Obtener un pago por id
 *     parameters: 
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Pago obtenido correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     pago:
 *                       $ref: '#/components/schemas/Pago'
 *                 message:
 *                   type: string
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/:id',   authRequired, soloStaff, pagoCtrl.getById);
router.post('/',     authRequired, soloStaff, pagoCtrl.create);

/**
 * @openapi
 * /pagos/{id}/estado:
 *   patch:
 *     tags: [Pagos]
 *     summary: Cambiar el estado de un pago
 *     description: Valores permitidos para estado pendiente, pagado, reembolsado.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PagoEstadoBody'
 *     responses:
 *       200:
 *         description: Pago marcado con el nuevo estado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     pago:
 *                       $ref: '#/components/schemas/Pago'
 *                 message:
 *                   type: string
 *       400:
 *         description: Estado inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.patch('/:id/estado', authRequired, soloStaff, pagoCtrl.cambiarEstado);

/**
 * @openapi
 * /pagos/mp/preferencia:
 *   post:
 *     tags: [Pagos]
 *     summary: Crear una preferencia de pago en MercadoPago (Checkout Pro)
 *     description: >
 *       Crea una preferencia de pago para la reserva indicada y devuelve la URL de checkout
 *       (init_point) a la que el frontend debe redirigir al cliente para completar el pago.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PreferenciaBody'
 *     responses:
 *       200:
 *         description: Preferencia de pago creada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PreferenciaResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         description: Reserva no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Esta reserva ya tiene un pago registrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/mp/preferencia', authRequired, soloStaff, pagoCtrl.crearPreferencia);

/**
 * @openapi
 * /pagos/mp/webhook:
 *   post:
 *     tags: [Pagos]
 *     summary: Webhook de notificaciones de MercadoPago (IPN)
 *     description: >
 *       Endpoint público (sin token) que MercadoPago llama directamente cuando cambia el estado
 *       de un pago. Si el pago fue aprobado, registra el Pago en la base y confirma la Reserva
 *       asociada (mediante external_reference). Siempre responde 200 para evitar reintentos
 *       de MercadoPago, incluso si el procesamiento interno falla.
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MpWebhookBody'
 *     responses:
 *       200:
 *         description: Notificación recibida (siempre se responde 200, independientemente del resultado interno)
 */
router.post('/mp/webhook',     pagoCtrl.webhook);

module.exports = router;
