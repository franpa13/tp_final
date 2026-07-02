const { Router } = require('express');
const router = Router();
const horarioCtrl = require('../controllers/horario.controller');
const authRequired = require('../middlewares/authMiddleware');
const requireRole = require('../middlewares/roleMiddleware');

/**
 * @openapi
 * /horarios:
 *   get:
 *     tags: [Horarios]
 *     summary: Listar horarios de una cancha (paginado)
 *     parameters:
 *       - in: query
 *         name: canchaId
 *         required: true
 *         schema: { type: string, format: uuid }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: Horarios obtenidos correctamente
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
 *                         horarios:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Horario'
 *                 message:
 *                   type: string
 *       400:
 *         description: El parámetro canchaId es requerido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *   post:
 *     tags: [Horarios]
 *     summary: Crear o actualizar el horario de un día (upsert)
 *     description: Si ya existe un horario para esa cancha y día, lo actualiza; si no, lo crea. Requiere rol ADMIN o SUPERADMIN.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/HorarioUpsertBody'
 *     responses:
 *       200:
 *         description: Horario actualizado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     horario:
 *                       $ref: '#/components/schemas/Horario'
 *                 message:
 *                   type: string
 *       201:
 *         description: Horario creado correctamente
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get('/',      authRequired, horarioCtrl.getByCanchaId);
router.post('/',     authRequired, requireRole('ADMIN', 'SUPERADMIN'), horarioCtrl.upsert);

/**
 * @openapi
 * /horarios/{id}:
 *   delete:
 *     tags: [Horarios]
 *     summary: Desactivar un horario (soft delete, marca activo=false)
 *     description: Requiere rol ADMIN o SUPERADMIN.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Horario desactivado correctamente
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.delete('/:id', authRequired, requireRole('ADMIN', 'SUPERADMIN'), horarioCtrl.delete);

module.exports = router;
