/**
 * @file config/database.js
 * @description Configuración y creación de la instancia de Sequelize.
 *
 * Sequelize es un ORM (Object-Relational Mapper) para Node.js que permite
 * interactuar con bases de datos relacionales usando objetos JavaScript en lugar
 * de escribir SQL crudo.
 *
 * Las credenciales se leen desde variables de entorno (process.env) para no
 * hardcodear datos sensibles en el código fuente. Estas variables se definen
 * en el archivo .env (no se sube al repositorio, ver .env.example).
 *
 * Variables de entorno requeridas (definir en .env):
 *  - DB_NAME     : Nombre de la base de datos PostgreSQL
 *  - DB_USER     : Usuario de PostgreSQL
 *  - DB_PASSWORD : Contraseña del usuario
 *  - DB_HOST     : Host donde corre PostgreSQL (por defecto: localhost)
 *  - DB_PORT     : Puerto de PostgreSQL (por defecto: 5432)
 */

const { Sequelize } = require('sequelize');

/**
 * Instancia principal de Sequelize conectada a PostgreSQL.
 *
 * @type {Sequelize}
 */
const sequelize = new Sequelize(
  process.env.DB_NAME,     // Nombre de la base de datos
  process.env.DB_USER,     // Usuario con permisos sobre esa base
  process.env.DB_PASSWORD, // Contraseña del usuario
  {
    host: process.env.DB_HOST || 'localhost', // Dirección del servidor de BD
    port: process.env.DB_PORT || 5432,        // Puerto estándar de PostgreSQL
    dialect: 'postgres',                       // Le indica a Sequelize que use PostgreSQL

    // Desactiva el log de las consultas SQL en consola.
    // En desarrollo puede setearse a `console.log` para depurar las queries generadas.
    logging: false,
  }
);

module.exports = sequelize;
