'use strict';
const crypto = require('crypto');

/**
 * Seed de Canchas. No depende de otras tablas, pero corre después de Users
 * (prefijo 02-) para mantener el orden lógico del dominio. Los horarios y
 * las reservas (03- y 04-) buscan estas canchas por `nombreCancha`.
 *
 * @type {import('sequelize-cli').Migration}
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Canchas', [
      {
        id: crypto.randomUUID(),
        type: 'FUT-5',
        nombreCancha: 'Cancha Norte',
        numberCancha: 1,
        horaApertura: '08:00:00',
        horaCierre: '23:00:00',
        precio: 12000,
        disponible: true,
        estado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: crypto.randomUUID(),
        type: 'FUT-5',
        nombreCancha: 'Cancha Sur',
        numberCancha: 2,
        horaApertura: '08:00:00',
        horaCierre: '23:00:00',
        precio: 12500,
        disponible: true,
        estado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: crypto.randomUUID(),
        type: 'FUT-7',
        nombreCancha: 'Cancha Este',
        numberCancha: 3,
        horaApertura: '09:00:00',
        horaCierre: '22:00:00',
        precio: 18000,
        disponible: true,
        estado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: crypto.randomUUID(),
        type: 'FUT-7',
        nombreCancha: 'Cancha Oeste',
        numberCancha: 4,
        horaApertura: '09:00:00',
        horaCierre: '22:00:00',
        precio: 17500,
        disponible: true,
        estado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: crypto.randomUUID(),
        type: 'FUT-9',
        nombreCancha: 'Cancha Central',
        numberCancha: 5,
        horaApertura: '08:00:00',
        horaCierre: '23:00:00',
        precio: 25000,
        disponible: true,
        estado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: crypto.randomUUID(),
        type: 'FUT-9',
        nombreCancha: 'Cancha del Parque',
        numberCancha: 6,
        horaApertura: '07:00:00',
        horaCierre: '23:00:00',
        precio: 24000,
        disponible: true,
        estado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: crypto.randomUUID(),
        type: 'FUT-7',
        nombreCancha: 'Cancha Premium',
        numberCancha: 7,
        horaApertura: '10:00:00',
        horaCierre: '22:00:00',
        precio: 20000,
        disponible: true,
        estado: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        // Cancha dada de baja: sirve para probar que el listado (estado=true)
        // la excluye correctamente.
        id: crypto.randomUUID(),
        type: 'FUT-5',
        nombreCancha: 'Cancha Vieja',
        numberCancha: 8,
        horaApertura: '08:00:00',
        horaCierre: '20:00:00',
        precio: 10000,
        disponible: false,
        estado: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ], { ignoreDuplicates: true });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Canchas', null, {});
  },
};
