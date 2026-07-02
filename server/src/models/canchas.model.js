const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Canchas = sequelize.define("Canchas", {
    // Tipo de cancha segun la cantidad de jugadores
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    type: {
        type: DataTypes.ENUM("FUT-5", "FUT-7", "FUT-9"),
        allowNull: false,
    },
    nombreCancha: {
        type: DataTypes.STRING,
        allowNull: false
    },
    // Numero identificador de la cancha dentro del establecimiento
    numberCancha: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },

    // Hora de apertura de la cancha en formato HH:MM:SS, ej: '08:00:00'
    // Define desde cuando se pueden hacer reservas en esta cancha
    horaApertura: {
        type: DataTypes.TIME,
        allowNull: false,
    },

    // Hora de cierre de la cancha en formato HH:MM:SS, ej: '23:00:00'
    // Define hasta cuando se pueden hacer reservas en esta cancha
    horaCierre: {
        type: DataTypes.TIME,
        allowNull: false,
    },

    // Precio por turno de la cancha en pesos
    precio: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
    },

    // Indica si la cancha esta activa y disponible para reservas.
    // false puede significar que esta en mantenimiento o dada de baja.
    disponible: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
    estado: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
}, {
    tableName: "Canchas",
    timestamps: true,
});

module.exports = Canchas;
