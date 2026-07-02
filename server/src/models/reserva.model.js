const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * Reserva representa un turno para una cancha, en una fecha y horario.
 * Puede originarse de dos formas:
 *   - Un admin la carga manualmente para un cliente externo sin cuenta
 *     (nombreCliente/telefonoCliente como texto libre, clienteId null).
 *   - Un usuario tipo CLIENTE la pide para sí mismo desde su cuenta
 *     (clienteId apunta a ese User; nombreCliente/telefonoCliente se
 *     completan automáticamente con sus datos de perfil).
 *
 * Relaciones:
 *   - Canchas hasMany Reserva  (una cancha tiene muchas reservas)
 *   - Reserva belongsTo Canchas
 *   - User hasMany Reserva     (el admin que creó la reserva — auditoría, campo: creadoPor)
 *   - Reserva belongsTo User   (as: 'admin', campo: creadoPor)
 *   - User hasMany Reserva     (el cliente dueño de la reserva, si existe, campo: clienteId)
 *   - Reserva belongsTo User   (as: 'cliente', campo: clienteId)
 */
const Reserva = sequelize.define('Reserva', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },

  // FK hacia Canchas — qué cancha se reservó
  canchaId: {
    type: DataTypes.UUID,
    allowNull: false,
  },

  // FK hacia User — qué administrador o cliente cargó la reserva (auditoría interna)
  creadoPor: {
    type: DataTypes.UUID,
    allowNull: false,
  },

  // FK hacia User — cliente dueño de la reserva, solo si la pidió un usuario tipo CLIENTE.
  // Null cuando la carga un admin para un cliente externo sin cuenta.
  clienteId: {
    type: DataTypes.UUID,
    allowNull: true,
  },

  // Datos del cliente (texto libre si lo cargó un admin, o copiados del perfil si es un CLIENTE)
  nombreCliente: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  telefonoCliente: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  fecha: {
    type: DataTypes.DATEONLY, // solo fecha: "2025-07-01", sin hora
    allowNull: false,
  },

  horaInicio: {
    type: DataTypes.TIME,
    allowNull: false,
  },

  horaFin: {
    type: DataTypes.TIME,
    allowNull: false,
  },

  estado: {
    type: DataTypes.ENUM('pendiente', 'confirmada', 'cancelada', 'finalizada'),
    allowNull: false,
    defaultValue: 'pendiente',
  },
}, {
  tableName: 'Reservas',
  timestamps: true,
});

module.exports = Reserva;
