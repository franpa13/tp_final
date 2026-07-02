/**
 * @file routes/producto.routes.js
 * @description RUTAS DE EJEMPLO — plantilla de referencia para un CRUD nuevo.
 *
 * Une cada combinación (método HTTP + URL) con su función del controller.
 * Este archivo se monta en routes/index.js bajo el prefijo /productos, así
 * que las URLs reales quedan:
 *   GET    /api/productos
 *   GET    /api/productos/:id
 *   POST   /api/productos
 *   PUT    /api/productos/:id
 *   DELETE /api/productos/:id
 *
 * A propósito NO tiene `authRequired` ni `requireRole` en ninguna ruta, para
 * que quede clarísimo el CRUD "pelado". Si el ejercicio pide protegerlo,
 * se agrega así (mismo patrón que canchas.routes.js / user.routes.js):
 *
 *   const authRequired = require('../middlewares/authMiddleware');
 *   const requireRole = require('../middlewares/roleMiddleware');
 *
 *   router.post('/', authRequired, requireRole('ADMIN', 'SUPERADMIN'), productoCtrl.create);
 *   //              ↑ exige estar logueado   ↑ además exige ser ADMIN o SUPERADMIN
 */

const { Router } = require('express');
const router = Router();
const productoCtrl = require('../controllers/producto.controller');

/**
 * @openapi
 * /productos:
 *   get:
 *     tags: [Productos]
 *     summary: Listar todos los productos activos (sin paginado)
 *     responses:
 *       200:
 *         description: Productos obtenidos correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items: { $ref: '#/components/schemas/Producto' }
 *                 message: { type: string }
 *   post:
 *     tags: [Productos]
 *     summary: Crear un producto
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ProductoBody' }
 *     responses:
 *       201:
 *         description: Producto creado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data: { $ref: '#/components/schemas/Producto' }
 *                 message: { type: string }
 *       400:
 *         description: Faltan campos obligatorios
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */
router.get('/', productoCtrl.getAll);
router.post('/', productoCtrl.create);

/**
 * @openapi
 * /productos/{id}:
 *   get:
 *     tags: [Productos]
 *     summary: Obtener un producto por id
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Producto obtenido correctamente
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *   put:
 *     tags: [Productos]
 *     summary: Actualizar un producto
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ProductoBody' }
 *     responses:
 *       200:
 *         description: Producto actualizado correctamente
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *   delete:
 *     tags: [Productos]
 *     summary: Eliminar un producto (soft delete, marca estado=false)
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string, format: uuid }
 *     responses:
 *       200:
 *         description: Producto eliminado correctamente
 *       404:
 *         $ref: '#/components/responses/NotFound'
 */
router.get('/:id', productoCtrl.getById);
router.put('/:id', productoCtrl.update);
router.delete('/:id', productoCtrl.delete);

module.exports = router;
