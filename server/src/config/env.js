/**
 * @file config/env.js
 * @description Centraliza el acceso a las variables de entorno de la aplicación.
 *
 * En lugar de usar process.env directamente en cada archivo, se importa desde
 * aquí. Esto ofrece varias ventajas:
 *  - Un único lugar donde se definen los valores por defecto.
 *  - Facilita cambiar nombres de variables sin tocar múltiples archivos.
 *  - Permite agregar validaciones (ej: lanzar error si falta una variable crítica).
 *
 * Las variables se cargan en process.env mediante `require('dotenv').config()`
 * en el punto de entrada (index.js), antes de que este módulo sea requerido.
 */

module.exports = {
  /**
   * Puerto en el que el servidor HTTP escuchará las peticiones entrantes.
   * Si la variable de entorno PORT no está definida, usa 3000 por defecto.
   * @type {number}
   */
  PORT: process.env.PORT || 3000,

  /**
   * Entorno de ejecución de la aplicación.
   * Valores posibles: 'development', 'test', 'production'.
   * Algunos comportamientos (logs, errores detallados) cambian según este valor.
   * @type {string}
   */
  NODE_ENV: process.env.NODE_ENV || 'development',
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '1d',

  /**
   * Client ID de la app OAuth de Google (Google Cloud Console > Credentials).
   * Se usa para validar que el idToken que manda el frontend fue emitido para
   * ESTA app y no para otra (ver config/googleClient.js).
   * @type {string}
   */
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
};
