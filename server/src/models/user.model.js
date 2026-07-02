const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const User = sequelize.define("User", {
    // UUID generado automaticamente por Sequelize al crear el registro.
    // DataTypes.UUIDV4 produce un id como: 'f47ac10b-58cc-4372-a567-0e02b2c3d479'
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },

    type: {
        type: DataTypes.ENUM("ADMIN", "SUPERADMIN", "CLIENTE"),
        allowNull: false,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    telefono: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    estado: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
    },
}, {
    tableName: "Users",
    timestamps: true,
});

module.exports = User;
