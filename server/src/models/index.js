const sequelize = require('../config/database');
const User    = require('./user.model');
const Canchas = require('./canchas.model');
const Reserva = require('./reserva.model');
const Horario = require('./horario.model');
const Pago    = require('./pago.model');

// ─── RELACIONES ───────────────────────────────────────────────────────────────
//
// Sequelize necesita que las asociaciones se definan DESPUÉS de importar todos
// los modelos para evitar referencias circulares.
//
// Cada relación se declara en ambas direcciones:
//   hasMany / hasOne  → se declara en el modelo PADRE
//   belongsTo         → se declara en el modelo HIJO (el que tiene la FK)
//
// El campo `foreignKey` le dice a Sequelize qué columna usar como clave foránea
// en la tabla hija. Si no lo ponés, Sequelize inventa un nombre automático.
// ─────────────────────────────────────────────────────────────────────────────

// ── User → Reserva (uno a muchos, auditoría) ─────────────────────────────────
// Un administrador (o el propio cliente) puede cargar MUCHAS reservas.
// `creadoPor` registra quién ingresó el turno.
User.hasMany(Reserva, { foreignKey: 'creadoPor', as: 'reservasCreadas' });
Reserva.belongsTo(User, { foreignKey: 'creadoPor', as: 'admin' });

// ── User → Reserva (uno a muchos, dueño de la reserva) ───────────────────────
// Cuando la reserva la pide un usuario tipo CLIENTE, `clienteId` lo identifica.
// Queda null si la cargó un admin para un cliente externo sin cuenta.
User.hasMany(Reserva, { foreignKey: 'clienteId', as: 'reservasComoCliente' });
Reserva.belongsTo(User, { foreignKey: 'clienteId', as: 'cliente' });

// ── Canchas → Reserva (uno a muchos) ─────────────────────────────────────────
// Una cancha puede tener MUCHAS reservas a lo largo del tiempo.
// La tabla Reservas tiene una columna `canchaId` que apunta a Canchas.id
Canchas.hasMany(Reserva, { foreignKey: 'canchaId', as: 'reservas' });
// Cada reserva PERTENECE a una cancha.
Reserva.belongsTo(Canchas, { foreignKey: 'canchaId', as: 'cancha' });

// ── Canchas → Horario (uno a muchos) ─────────────────────────────────────────
// Una cancha tiene MUCHOS horarios (uno por día de la semana).
// La tabla Horarios tiene una columna `canchaId` que apunta a Canchas.id
Canchas.hasMany(Horario, { foreignKey: 'canchaId', as: 'horarios' });
// Cada horario PERTENECE a una cancha.
Horario.belongsTo(Canchas, { foreignKey: 'canchaId', as: 'cancha' });

// ── Reserva → Pago (uno a uno) ────────────────────────────────────────────────
// Una reserva tiene como máximo UN pago (la columna `reservaId` en Pagos es UNIQUE).
// hasOne va en el PADRE (Reserva), la FK vive en el HIJO (Pago).
Reserva.hasOne(Pago, { foreignKey: 'reservaId', as: 'pago' });
// Cada pago PERTENECE a una reserva.
Pago.belongsTo(Reserva, { foreignKey: 'reservaId', as: 'reserva' });

// ─────────────────────────────────────────────────────────────────────────────
// Resumen del esquema relacional:
//
//   Users ──< Reservas >── Canchas
//                 │
//                 └── Pagos   (1 a 1)
//
//   Canchas ──< Horarios      (1 a muchos, uno por día)
// ─────────────────────────────────────────────────────────────────────────────

const db = {
  sequelize,
  User,
  Canchas,
  Reserva,
  Horario,
  Pago,
};

module.exports = db;
