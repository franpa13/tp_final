'use strict';
const crypto = require('crypto');

/**
 * Seed de Pagos. Depende de Reservas (prefijo 05-, el último). Solo genera
 * un pago para reservas en estado 'confirmada' o 'finalizada' — igual que en
 * la app real, donde registrar un pago es lo que deja la reserva confirmada
 * (ver pagoCtrl.create). El monto sale del precio actual de la cancha.
 *
 * `createdAt` se fija en la fecha de la reserva (no "ahora") para que el
 * gráfico de "ingresos por mes" del dashboard muestre varios meses con datos
 * en vez de que todo caiga en el mes en que se corrió el seed.
 *
 * @type {import('sequelize-cli').Migration}
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    const reservas = await queryInterface.sequelize.query(
      `SELECT r.id AS "reservaId", r.fecha, c.precio
       FROM "Reservas" r
       JOIN "Canchas" c ON c.id = r."canchaId"
       WHERE r.estado IN ('confirmada', 'finalizada')
       ORDER BY r.fecha ASC`,
      { type: Sequelize.QueryTypes.SELECT },
    );

    const metodos = ['efectivo', 'transferencia', 'tarjeta', 'mercadopago'];

    const pagos = reservas.map((reserva, index) => {
      const metodoPago = metodos[index % metodos.length];
      const esUltimo = index === reservas.length - 1;
      const fechaPago = new Date(reserva.fecha);

      return {
        id: crypto.randomUUID(),
        reservaId: reserva.reservaId,
        monto: reserva.precio,
        metodoPago,
        // El id de MercadoPago solo existe cuando el método de pago fue mercadopago.
        mpPaymentId: metodoPago === 'mercadopago' ? String(1000000000 + index) : null,
        // Un solo pago de ejemplo queda reembolsado, el resto pagado.
        estado: esUltimo ? 'reembolsado' : 'pagado',
        createdAt: fechaPago,
        updatedAt: fechaPago,
      };
    });

    await queryInterface.bulkInsert('Pagos', pagos, { ignoreDuplicates: true });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Pagos', null, {});
  },
};
