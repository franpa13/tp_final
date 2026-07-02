const { Router } = require('express');
const router = Router();
const reservaCtrl = require('../controllers/reserva.controller');
const authRequired = require('../middlewares/authMiddleware');

/**
 * @openapi
 * /reservas:
 *   get:
 *     tags: [Reservas]
 *     summary: Listar reservas activas, no canceladas (paginado)
 *     description: >
 *       Admin/superadmin ven todas las reservas activas. Un usuario CLIENTE
 *       solo ve las suyas (incluidas las canceladas, como historial propio).
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: Reservas obtenidas correctamente
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
 *                         reservas:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Reserva'
 *                 message:
 *                   type: string
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *   post:
 *     tags: [Reservas]
 *     summary: Crear una reserva
 *     description: >
 *       Un admin/superadmin carga el turno para un cliente externo (nombreCliente/telefonoCliente
 *       en el body). Un usuario CLIENTE pide su propio turno: sus datos de contacto se completan
 *       automáticamente desde su perfil, ignorando cualquier nombreCliente/telefonoCliente enviado.
 *       En ambos casos se valida que la cancha no tenga otra reserva activa que se superponga
 *       con el horario pedido.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReservaCreateBody'
 *     responses:
 *       201:
 *         description: Reserva creada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     reserva:
 *                       $ref: '#/components/schemas/Reserva'
 *                 message:
 *                   type: string
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       409:
 *         description: La cancha ya tiene una reserva en ese horario
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get('/',      authRequired, reservaCtrl.getAll);
router.post('/',     authRequired, reservaCtrl.create);

/**
 * @openapi
 * /reservas/{id}:
 *   get:
 *     tags: [Reservas]
 *     summary: Obtener una reserva por id
 *     description: Un usuario CLIENTE solo puede obtener sus propias reservas.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Reserva obtenida correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     reserva:
 *                       $ref: '#/components/schemas/Reserva'
 *                 message:
 *                   type: string
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/:id',   authRequired, reservaCtrl.getById);

/**
 * @openapi
 * /reservas/{id}/estado:
 *   patch:
 *     tags: [Reservas]
 *     summary: Cambiar el estado de una reserva
 *     description: >
 *       Valores permitidos para estado: pendiente, confirmada, cancelada, finalizada.
 *       Admin/superadmin pueden ponerle cualquier estado a cualquier reserva. Un usuario
 *       CLIENTE solo puede cancelar (estado=cancelada) su propia reserva, y solo si todavía
 *       está pendiente o confirmada.
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
 *             $ref: '#/components/schemas/EstadoBody'
 *     responses:
 *       200:
 *         description: Reserva marcada con el nuevo estado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     reserva:
 *                       $ref: '#/components/schemas/Reserva'
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
 *       409:
 *         description: La reserva ya no se puede cancelar (CLIENTE intentando cancelar una ya cancelada/finalizada)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.patch('/:id/estado', authRequired, reservaCtrl.cambiarEstado);

module.exports = router;
