const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * Pago registra el movimiento económico asociado a una reserva.
 * Relación: Reserva hasOne Pago (una reserva tiene un único pago)
 *           Pago belongsTo Reserva (cada pago pertenece a una reserva)
 */
const Pago = sequelize.define('Pago', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },

  // FK hacia Reserva — UNIQUE porque una reserva solo puede tener un pago
  reservaId: {
    type: DataTypes.UUID,
    allowNull: false,
    unique: true,
  },

  monto: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
  },

  metodoPago: {
    type: DataTypes.ENUM('efectivo', 'transferencia', 'tarjeta', 'mercadopago'),
    allowNull: false,
  },

  // ID del pago en MercadoPago (solo cuando metodoPago = 'mercadopago')
  mpPaymentId: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  estado: {
    type: DataTypes.ENUM('pendiente', 'pagado', 'reembolsado'),
    allowNull: false,
    defaultValue: 'pendiente',
  },
}, {
  tableName: 'Pagos',
  timestamps: true,
});

module.exports = Pago;
