/**
 * @file index.js
 * @description Punto de entrada principal del servidor.
 *
 * Responsabilidades:
 *  1. Cargar las variables de entorno desde el archivo .env (debe ejecutarse
 *     antes de cualquier otro require que las consuma).
 *  2. Verificar la conexión con la base de datos PostgreSQL a través de Sequelize.
 *  3. Sincronizar los modelos con la base de datos (crea las tablas si no existen).
 *  4. Iniciar el servidor HTTP en el puerto configurado.
 *
 * Flujo de arranque:
 *  .env → sequelize.authenticate() → sequelize.sync() → app.listen()
 */

// Carga las variables definidas en el archivo .env al objeto process.env.
// Debe ser la primera línea para que el resto de módulos las encuentren disponibles.
require('dotenv').config();

// Importa la aplicación Express ya configurada con middlewares y rutas
const app = require('./src/app');

// Importa la instancia de Sequelize (ORM) para gestionar la conexión a PostgreSQL
const { sequelize } = require('./src/models');

// Importa el puerto desde la configuración centralizada de variables de entorno
const { PORT } = require('./src/config/env');

/**
 * Función auto-invocada asíncrona (IIFE) que permite usar await en el nivel superior.
 * Se utiliza este patrón porque Node.js no soporta await fuera de módulos ES en versiones antiguas.
 */
(async () => {
  // Verifica que la conexión a la base de datos sea exitosa.
  // Lanza una excepción si las credenciales o el host son incorrectos.
  await sequelize.authenticate();
  console.log('Conexión con la base de datos establecida correctamente.');

  // Sincroniza los modelos de Sequelize con la base de datos.
  // Con { force: false } (por defecto) no destruye datos existentes;
  // solo crea las tablas que aún no existen.

  await sequelize.sync({  alter: true });
  console.log('Modelos sincronizados con la base de datos.');

  // Inicia el servidor HTTP y lo pone a escuchar en el puerto configurado.
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
  });
})();
