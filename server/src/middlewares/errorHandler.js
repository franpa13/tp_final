/**
 * @file middlewares/errorHandler.js
 * @description Middleware global de manejo de errores para Express.
 *
 * ¿Qué es un middleware en Express?
 *  Un middleware es una función que se ejecuta durante el ciclo de vida de una
 *  petición HTTP, entre que llega al servidor y se envía la respuesta.
 *  Tiene acceso a los objetos req (request), res (response) y next (función
 *  que pasa el control al siguiente middleware).
 *
 * ¿Por qué un manejador de errores centralizado?
 *  Sin este middleware, cualquier error no capturado haría que Express devuelva
 *  una respuesta HTML genérica con el stack trace completo, lo cual:
 *   - Expone información sensible de la aplicación al cliente.
 *   - No sigue el formato JSON que espera el frontend.
 *
 *  Este middleware intercepta todos los errores lanzados con next(err) desde
 *  cualquier controlador y devuelve una respuesta JSON uniforme.
 *
 * ¿Cómo usarlo desde un controlador?
 *  try {
 *    // lógica...
 *  } catch (err) {
 *    next(err); // Pasa el error a este middleware
 *  }
 *
 *  También se puede personalizar el status HTTP del error:
 *  const error = new Error('Recurso no encontrado');
 *  error.status = 404;
 *  next(error);
 *
 * IMPORTANTE: Express identifica un middleware como manejador de errores
 * únicamente cuando tiene exactamente 4 parámetros (err, req, res, next).
 * Si se omite alguno, Express no lo tratará como tal.
 */

/**
 * Middleware de manejo de errores.
 *
 * @param {Error}                     err  - Objeto de error capturado (puede tener propiedad `status`).
 * @param {import('express').Request}  req  - Objeto de la petición HTTP (no se usa aquí, pero es requerido por Express).
 * @param {import('express').Response} res  - Objeto de la respuesta HTTP.
 * @param {import('express').NextFunction} next - Función para pasar al siguiente middleware (requerida por la firma).
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err.name === "SequelizeValidationError") {
    return res.status(400).json({
      error: "Datos inválidos",
      details: err.errors.map((item) => item.message),
    });
  }

  const status = err.status || 500;

  res.status(status).json({
    error: err.message || "Internal server error",
  });
}

module.exports = errorHandler;
