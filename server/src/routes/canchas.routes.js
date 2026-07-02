const { Router } = require("express")
const router = Router()
const canchasCtrl = require("../controllers/canchas.controller")
const authRequired = require("../middlewares/authMiddleware")
const requireRole = require("../middlewares/roleMiddleware")

/**
 * @openapi
 * /canchas:
 *   get:
 *     tags: [Canchas]
 *     summary: Listar canchas activas (paginado)
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200:
 *         description: Canchas traidas correctamente
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
 *                         canchas:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/Cancha'
 *                 message:
 *                   type: string
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 */
router.get("/", authRequired, canchasCtrl.getAll)

/**
 * @openapi
 * /canchas/create-cancha:
 *   post:
 *     tags: [Canchas]
 *     summary: Crear una cancha
 *     description: Requiere rol ADMIN o SUPERADMIN.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CanchaCreateBody'
 *     responses:
 *       200:
 *         description: Cancha creada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     cancha:
 *                       $ref: '#/components/schemas/CanchaCreateBody'
 *                 message:
 *                   type: string
 *       401:
 *         description: Cancha registrada anteriormente / token inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/create-cancha", authRequired, requireRole("ADMIN", "SUPERADMIN"), canchasCtrl.create)

/**
 * @openapi
 * /canchas/{id}:
 *   get:
 *     tags: [Canchas]
 *     summary: Obtener una cancha por id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Cancha traida correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     cancha:
 *                       $ref: '#/components/schemas/Cancha'
 *                 message:
 *                   type: string
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *   delete:
 *     tags: [Canchas]
 *     summary: Eliminar una cancha (soft delete, marca estado=false)
 *     description: Requiere rol ADMIN o SUPERADMIN.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Cancha eliminada correctamente
 *       401:
 *         description: Cancha no encontrada / token inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *   put:
 *     tags: [Canchas]
 *     summary: Actualizar una cancha
 *     description: Requiere rol ADMIN o SUPERADMIN.
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
 *             $ref: '#/components/schemas/CanchaUpdateBody'
 *     responses:
 *       200:
 *         description: Cancha actualizada correctamente
 *       401:
 *         description: Cancha no encontrada / token inválido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get("/:id", authRequired, canchasCtrl.getById)
router.delete("/:id", authRequired, requireRole("ADMIN", "SUPERADMIN"), canchasCtrl.deleteCancha)
router.put("/:id", authRequired, requireRole("ADMIN", "SUPERADMIN"), canchasCtrl.updateCancha)
module.exports = router
