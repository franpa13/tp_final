'use strict';
const crypto = require('crypto');

/**
 * Seed de Horarios. Depende de Canchas (prefijo 03-, corre después de 02-).
 * Como los ids de las canchas se generan al azar en su propio seed, acá los
 * volvemos a buscar por SELECT en vez de hardcodearlos — es el patrón que
 * van a repetir 04-reservas y 05-pagos para sus propias dependencias.
 *
 * Genera un Horario por cada día de la semana (0=domingo … 6=sábado) para
 * cada cancha activa, reusando el horaApertura/horaCierre general de esa
 * cancha, salvo los domingos que quedan cerrados (activo: false).
 *
 * @type {import('sequelize-cli').Migration}
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    const canchas = await queryInterface.sequelize.query(
      'SELECT id, "horaApertura", "horaCierre" FROM "Canchas" WHERE estado = true',
      { type: Sequelize.QueryTypes.SELECT },
    );

    const horarios = [];
    for (const cancha of canchas) {
      for (let diaSemana = 0; diaSemana <= 6; diaSemana++) {
        horarios.push({
          id: crypto.randomUUID(),
          canchaId: cancha.id,
          diaSemana,
          horaApertura: cancha.horaApertura,
          horaCierre: cancha.horaCierre,
          activo: diaSemana !== 0, // domingo (0) cerrado
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }
    }

    await queryInterface.bulkInsert('Horarios', horarios, { ignoreDuplicates: true });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Horarios', null, {});
  },
};
