/**
 * @file controllers/producto.controller.js
 * @description CONTROLLER DE EJEMPLO — plantilla de referencia para un CRUD nuevo.
 *
 * Este archivo muestra el CRUD más simple posible dentro de las convenciones
 * de este proyecto: SIN paginación, SIN filtros/búsqueda y SIN autenticación
 * (`authRequired`/`requireRole`) — todo eso se agrega después, sobre esta
 * misma base, si el ejercicio lo pide. Ver producto.routes.js para dónde se
 * agregarían esos middlewares.
 *
 * ¿Qué es un controller en este proyecto (patrón MVC)?
 *  Es la función que efectivamente atiende una request HTTP: lee lo que
 *  mandó el cliente (`req.body`, `req.params`, `req.query`), habla con el
 *  modelo (Sequelize) para leer/escribir en la base, y arma la respuesta
 *  (`res.json(...)`). NO define rutas (eso es `routes/`) ni columnas de la
 *  base (eso es `models/`).
 *
 * Convención de respuestas de este proyecto (repetida en TODOS los controllers):
 *  - Éxito:  res.status(200 o 201).json({ data: ..., message: 'texto claro' })
 *  - Error:  se arma `new Error('mensaje')`, se le pone `.status` (400/404/etc.)
 *            y se pasa a `next(error)` — el middleware global (errorHandler.js)
 *            se encarga de convertirlo en `{ error: 'mensaje' }` con ese status.
 *  - Nunca se usa try/catch con res.status(500) manual: cualquier error
 *    inesperado (ej. la base caída) también va a next(e), y errorHandler
 *    le pone 500 por defecto.
 */

const { Producto } = require('../models');

const productoCtrl = {};

// ─────────────────────────────────────────────────────────────────────────────
// CREATE — POST /api/productos
// ─────────────────────────────────────────────────────────────────────────────
productoCtrl.create = async (req, res, next) => {
  try {
    // req.body es lo que mandó el cliente en formato JSON (Express ya lo
    // parseó gracias a `express.json()`, configurado una sola vez en app.js).
    const { nombre, descripcion, precio, stock } = req.body;

    // Validación mínima manual. Sequelize también valida `allowNull: false`
    // al hacer `.create()`, pero chequear acá antes permite devolver un
    // mensaje de error más claro y específico.
    if (!nombre || precio === undefined) {
      const error = new Error('nombre y precio son obligatorios');
      error.status = 400; // 400 = Bad Request (el cliente mandó datos inválidos)
      return next(error);
    }

    // Producto.create(...) genera el INSERT y devuelve la fila ya creada
    // (incluido el id UUID que generó Sequelize automáticamente).
    const producto = await Producto.create({ nombre, descripcion, precio, stock });

    res.status(201).json({
      data: producto,
      message: 'Producto creado correctamente',
    });
  } catch (e) {
    // Cualquier error no previsto (ej. tipo de dato inválido) cae acá y se
    // delega al middleware global de errores.
    next(e);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// READ (todos) — GET /api/productos
// ─────────────────────────────────────────────────────────────────────────────
productoCtrl.getAll = async (req, res, next) => {
  try {
    // findAll trae TODAS las filas que cumplen el `where` — a propósito no
    // hay page/limit acá (ver canchasCtrl.getAll o reservaCtrl.getAll para
    // el mismo CRUD pero CON paginación, si hace falta copiar ese patrón).
    // where: { estado: true } es el filtro de soft delete: no trae los
    // productos "eliminados" (ver productoCtrl.delete más abajo).
    const productos = await Producto.findAll({
      where: { estado: true },
      order: [['createdAt', 'DESC']], // los más nuevos primero
    });

    res.status(200).json({
      data: productos,
      message: 'Productos obtenidos correctamente',
    });
  } catch (e) {
    next(e);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// READ (uno) — GET /api/productos/:id
// ─────────────────────────────────────────────────────────────────────────────
productoCtrl.getById = async (req, res, next) => {
  try {
    // req.params.id viene de la parte :id de la URL (definida en producto.routes.js)
    const { id } = req.params;

    const producto = await Producto.findOne({
      where: { id, estado: true },
    });

    // Si no se encontró (id inexistente, o existe pero fue "eliminado"),
    // se responde 404 en vez de null/undefined silencioso.
    if (!producto) {
      const error = new Error('Producto no encontrado');
      error.status = 404; // 404 = Not Found
      return next(error);
    }

    res.status(200).json({
      data: producto,
      message: 'Producto obtenido correctamente',
    });
  } catch (e) {
    next(e);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// UPDATE — PUT /api/productos/:id
// ─────────────────────────────────────────────────────────────────────────────
productoCtrl.update = async (req, res, next) => {
  try {
    const { id } = req.params;

    const producto = await Producto.findOne({ where: { id, estado: true } });

    if (!producto) {
      const error = new Error('Producto no encontrado');
      error.status = 404;
      return next(error);
    }

    // .update(req.body) actualiza SOLO las columnas que vengan en el body
    // (las que no se manden quedan como estaban). Para un ejemplo simple
    // esto alcanza; en un caso real conviene filtrar qué campos se aceptan
    // (ej. no dejar que el body pise `estado` o `id` desde acá).
    const { nombre, descripcion, precio, stock } = req.body;
    await producto.update({ nombre, descripcion, precio, stock });

    res.status(200).json({
      data: producto,
      message: 'Producto actualizado correctamente',
    });
  } catch (e) {
    next(e);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE (soft delete) — DELETE /api/productos/:id
// ─────────────────────────────────────────────────────────────────────────────
productoCtrl.delete = async (req, res, next) => {
  try {
    const { id } = req.params;

    const producto = await Producto.findOne({ where: { id, estado: true } });

    if (!producto) {
      const error = new Error('Producto no encontrado');
      error.status = 404;
      return next(error);
    }

    // No se borra la fila de la base (no se usa producto.destroy()). Se
    // marca estado=false, que es lo que excluye a este producto de
    // getAll/getById de ahora en más. Mismo patrón que Users y Canchas.
    await producto.update({ estado: false });

    res.status(200).json({
      data: null,
      message: 'Producto eliminado correctamente',
    });
  } catch (e) {
    next(e);
  }
};

module.exports = productoCtrl;
