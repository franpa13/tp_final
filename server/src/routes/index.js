/**
 * @file routes/index.js
 * @description Enrutador raíz de la API. Agrupa y monta todas las rutas de la aplicación.
 *
 * ¿Qué son las rutas en MVC?
 *  Las rutas son el puente entre una petición HTTP (método + URL) y el
 *  controlador que debe procesarla. No contienen lógica de negocio: su única
 *  responsabilidad es delegar al controlador correcto.
 *
 * Estructura esperada al agregar recursos:
 *  Cada "recurso" (entidad del dominio, ej: usuarios, productos) tiene su
 *  propio archivo de rutas. Este archivo los importa y los monta bajo su
 *  prefijo correspondiente.
 *
 * Este enrutador es montado en app.js bajo el prefijo '/api', por lo que
 * todas las rutas aquí definidas serán accesibles como '/api/<recurso>'.
 *
 * Ejemplo al agregar rutas de usuarios:
 *  router.use('/users', require('./user.routes'));
 *  → GET    /api/users        (listar todos)
 *  → POST   /api/users        (crear uno)
 *  → GET    /api/users/:id    (obtener por ID)
 *  → PUT    /api/users/:id    (actualizar)
 *  → DELETE /api/users/:id    (eliminar)
 */

const { Router } = require('express');

/**
 * Instancia del enrutador de Express.
 * Funciona como un mini-servidor que agrupa rutas relacionadas.
 * @type {import('express').Router}
 */
const router = Router();

// ── Registro de sub-enrutadores ───────────────────────────────────────────────
// Descomentar y agregar rutas a medida que se creen nuevos recursos.
router.use('/users',    require('./user.routes'));
router.use('/auth',     require('./auth.routes'));
router.use('/canchas',  require('./canchas.routes'));
router.use('/reservas', require('./reserva.routes'));
router.use('/horarios', require('./horario.routes'));
router.use('/pagos',    require('./pago.routes'));
router.use('/estadisticas', require('./estadisticas.routes'));
// Productos: CRUD de EJEMPLO (ver producto.routes.js), plantilla para clonar
// cuando haya que armar un modelo nuevo desde cero.
router.use('/productos', require('./producto.routes'));

module.exports = router;
