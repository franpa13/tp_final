/**
 * @file models/producto.model.js
 * @description MODELO DE EJEMPLO — plantilla de referencia para crear un modelo nuevo.
 *
 * Este archivo es intencionalmente simple (sin relaciones con otras tablas,
 * sin lógica extra) para que sirva de "receta" copiable cuando en el examen
 * pidan algo como "creá un modelo Producto/Cliente/Empleado/etc. con su CRUD".
 *
 * Pasos para clonar este patrón con otro nombre (ej. "Cliente"):
 *  1. Copiar este archivo como `cliente.model.js` y cambiar:
 *     - `sequelize.define('Producto', {...})`  →  `sequelize.define('Cliente', {...})`
 *     - los campos de adentro por los que necesite la nueva entidad
 *     - `tableName: 'Productos'`  →  `tableName: 'Clientes'`
 *  2. Registrarlo en `models/index.js` (importarlo y agregarlo al `module.exports`).
 *     Si el modelo nuevo se relaciona con otro existente (ej. un Cliente que
 *     tiene muchas Reservas), ahí es donde se declaran esas asociaciones
 *     (`hasMany`/`belongsTo`) — ver los ejemplos ya presentes en ese archivo.
 *  3. Crear `controllers/cliente.controller.js` (ver producto.controller.js).
 *  4. Crear `routes/cliente.routes.js` (ver producto.routes.js) y montarlo en
 *     `routes/index.js` con `router.use('/clientes', require('./cliente.routes'))`.
 *
 * Sequelize (¿qué es `sequelize.define(...)`?):
 *  Es la forma de declarar una tabla y sus columnas usando JavaScript en vez
 *  de SQL. Cada propiedad del objeto es una columna; `type` define el tipo de
 *  dato de esa columna (equivalente a los tipos de una tabla SQL real).
 */

const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Producto = sequelize.define('Producto', {
  // Clave primaria UUID (mismo patrón que todos los demás modelos del proyecto,
  // en vez de un id numérico autoincremental). DataTypes.UUIDV4 le dice a
  // Sequelize que genere un UUID nuevo automáticamente al crear cada fila.
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },

  // STRING = VARCHAR. allowNull: false significa que la base de datos va a
  // rechazar (con un error de validación) cualquier intento de crear un
  // Producto sin nombre.
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  // Campo opcional: allowNull: true (o directamente no ponerlo, ese es el
  // valor por defecto) permite que la columna quede en null.
  descripcion: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  // DECIMAL(10, 2) = hasta 10 dígitos en total, 2 después de la coma.
  // Se usa DECIMAL en vez de FLOAT para plata: evita errores de redondeo
  // binario típicos de los números de punto flotante.
  precio: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },

  // INTEGER simple, con un valor por defecto si no se manda ninguno.
  stock: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },

  // Soft delete: en vez de borrar la fila con DELETE, se marca estado=false.
  // Así el histórico no se pierde (por ejemplo, si un Producto ya fue usado
  // en una venta pasada, borrarlo de verdad rompería esa referencia).
  // Mismo patrón que usan Users y Canchas en este proyecto.
  estado: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
}, {
  // Nombre real de la tabla en Postgres. Sin esto, Sequelize pluralizaría
  // el nombre del modelo automáticamente (a veces de forma rara), así que
  // en este proyecto se fija siempre a mano.
  tableName: 'Productos',

  // timestamps: true agrega automáticamente las columnas createdAt/updatedAt
  // y las mantiene actualizadas solo sin que el código las toque.
  timestamps: true,
});

module.exports = Producto;
