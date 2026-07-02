const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

/**
 * Horario representa la disponibilidad operativa de una cancha en un día específico.
 * Es diferente a horaApertura/horaCierre en Canchas, que son el rango general.
 * Horario permite excepciones: "el martes la cancha abre más tarde", "este día está cerrada".
 *
 * Relación: Canchas hasMany Horario (una cancha tiene muchos horarios diarios)
 */
const Horario = sequelize.define('Horario', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },

  // FK hacia Canchas
  canchaId: {
    type: DataTypes.UUID,
    allowNull: false,
  },

  // 0=domingo, 1=lunes, ..., 6=sábado
  diaSemana: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { min: 0, max: 6 },
  },

  horaApertura: {
    type: DataTypes.TIME,
    allowNull: false,
  },

  horaCierre: {
    type: DataTypes.TIME,
    allowNull: false,
  },

  // false = ese día la cancha no opera (feriado, mantenimiento, etc.)
  activo: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
}, {
  tableName: 'Horarios',
  timestamps: true,
});

module.exports = Horario;
