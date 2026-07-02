/**
 * @file app.js
 * @description Configuración central de la aplicación Express.
 *
 * Este archivo crea y configura la instancia de Express pero NO inicia el servidor.
 * La separación entre configuración (app.js) e inicio (index.js) es una buena práctica
 * porque facilita los tests: se puede importar `app` sin levantar el puerto.
 *
 * Orden de los middlewares (el orden en Express es importante):
 *  1. cors()         → Permite peticiones desde otros orígenes (ej: el frontend en React)
 *  2. express.json() → Parsea el body de las peticiones con Content-Type: application/json
 *  3. /api routes    → Enruta las peticiones a los controladores correspondientes
 *  4. errorHandler   → Captura errores lanzados en cualquier punto anterior
 */

const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');

// Importa el enrutador principal que agrupa todas las rutas de la API
const routes = require('./routes');

// Documento OpenAPI generado a partir de los comentarios @openapi en src/routes/*.js
const swaggerSpec = require('./config/swagger');

// Importa el middleware global de manejo de errores
const errorHandler = require('./middlewares/errorHandler');

// Crea la instancia de la aplicación Express
const app = express();

// ── Middlewares globales ──────────────────────────────────────────────────────

/**
 * Habilita CORS (Cross-Origin Resource Sharing).
 * Permite que el frontend (que corre en un origen diferente, ej: localhost:5173)
 * pueda realizar peticiones HTTP a este servidor sin que el navegador las bloquee.
 */
app.use(cors({origin:"http://localhost:4200"}));

/**
 * Parsea automáticamente el cuerpo (body) de las peticiones entrantes en formato JSON.
 * Sin este middleware, req.body sería undefined en los controladores.
 */
app.use(express.json());

// ── Documentación ──────────────────────────────────────────────────────────────

/**
 * Expone la documentación interactiva de la API (Swagger UI) en /api-docs.
 * El JSON crudo del documento OpenAPI queda disponible en /api-docs.json
 * (útil para importarlo en Postman/Insomnia).
 */
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get('/api-docs.json', (req, res) => res.json(swaggerSpec));

// ── Rutas ─────────────────────────────────────────────────────────────────────

/**
 * Monta todas las rutas de la API bajo el prefijo /api.
 * Ejemplo: una ruta definida como '/users' será accesible como '/api/users'.
 * Centralizar el prefijo aquí evita repetirlo en cada archivo de rutas.
 */
app.use('/api', routes);

// ── Manejo de errores ─────────────────────────────────────────────────────────

/**
 * Middleware de manejo de errores. Debe registrarse DESPUÉS de todas las rutas
 * porque Express lo identifica como error handler por tener 4 parámetros (err, req, res, next).
 * Captura cualquier error que haya sido pasado con next(err) en los controladores.
 */
app.use(errorHandler);

module.exports = app;
