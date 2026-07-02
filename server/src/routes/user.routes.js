const { Router } = require("express")
const router = Router()
const userCtrl = require("../controllers/user.controller")
const authRequired = require("../middlewares/authMiddleware")
const requireRole = require("../middlewares/roleMiddleware")

/**
 * @openapi
 * /users/create-user:
 *   post:
 *     tags: [Users]
 *     summary: Registrar un nuevo usuario (nace con rol CLIENTE)
 *     description: >
 *       Ruta pública (no requiere token). Siempre crea el usuario como CLIENTE;
 *       un SUPERADMIN puede cambiarle el rol después desde el panel (PUT /users/{id}).
 *       SUPERADMIN nunca se puede auto-asignar por esta vía.
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserCreateBody'
 *     responses:
 *       201:
 *         description: Usuario creado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *                 message:
 *                   type: string
 *                   example: Usuario creado correctamente
 *       409:
 *         description: Email registrado anteriormente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/create-user", userCtrl.createUser)

/**
 * @openapi
 * /users/all-users:
 *   get:
 *     tags: [Users]
 *     summary: Listar usuarios activos (paginado)
 *     description: Requiere rol SUPERADMIN.
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *         description: Número de página (1-based)
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *         description: Registros por página
 *     responses:
 *       200:
 *         description: Usuarios obtenidos correctamente
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
 *                         users:
 *                           type: array
 *                           items:
 *                             $ref: '#/components/schemas/User'
 *                 message:
 *                   type: string
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get("/all-users", authRequired, requireRole("SUPERADMIN"), userCtrl.getUsers)

/**
 * @openapi
 * /users/user/{id}:
 *   get:
 *     tags: [Users]
 *     summary: Obtener un usuario por id
 *     description: Requiere rol SUPERADMIN.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Usuario obtenido correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *                 message:
 *                   type: string
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get("/user/:id", authRequired, userCtrl.getById)

/**
 * @openapi
 * /users/{id}:
 *   put:
 *     tags: [Users]
 *     summary: Actualizar nombre/tipo de un usuario
 *     description: Requiere rol SUPERADMIN (permite cambiar el campo `type`, por lo que no puede quedar abierto a cualquier ADMIN).
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
 *             $ref: '#/components/schemas/UserUpdateBody'
 *     responses:
 *       200:
 *         description: Usuario actualizado correctamente
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *   delete:
 *     tags: [Users]
 *     summary: Desactivar un usuario (soft delete)
 *     description: Requiere rol SUPERADMIN.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Usuario desactivado correctamente
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.put("/:id", authRequired, requireRole("SUPERADMIN"), userCtrl.updateUser)
router.delete("/:id", authRequired, requireRole("SUPERADMIN"), userCtrl.deleteUser)
module.exports = router
