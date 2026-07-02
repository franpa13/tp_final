'use strict';
const crypto = require('crypto');

/**
 * Seed de Reservas. Depende de Canchas y Users (prefijo 04-). Igual que
 * 03-horarios, busca los ids por SELECT porque se generaron al azar en sus
 * seeds respectivos.
 *
 * Combina los dos orígenes posibles de una reserva (ver reserva.model.js):
 *  - Cargada por un ADMIN para un cliente externo sin cuenta
 *    (clienteId null, nombreCliente/telefonoCliente en texto libre).
 *  - Pedida por un usuario CLIENTE para sí mismo
 *    (clienteId = su propio id, creadoPor = el mismo id).
 *
 * Los estados están mezclados a propósito (pendiente/confirmada/cancelada/
 * finalizada) para que el gráfico "reservas por estado" del dashboard tenga
 * datos variados desde el primer arranque.
 *
 * @type {import('sequelize-cli').Migration}
 */
module.exports = {
  async up(queryInterface, Sequelize) {
    const canchas = await queryInterface.sequelize.query(
      'SELECT id, "nombreCancha" FROM "Canchas" WHERE estado = true ORDER BY "numberCancha" ASC',
      { type: Sequelize.QueryTypes.SELECT },
    );
    const admins = await queryInterface.sequelize.query(
      "SELECT id, name FROM \"Users\" WHERE type = 'ADMIN' AND estado = true ORDER BY email ASC",
      { type: Sequelize.QueryTypes.SELECT },
    );
    const clientes = await queryInterface.sequelize.query(
      "SELECT id, name, telefono FROM \"Users\" WHERE type = 'CLIENTE' AND estado = true ORDER BY email ASC",
      { type: Sequelize.QueryTypes.SELECT },
    );

    // Acceso con módulo por si en algún momento hay menos filas de las que
    // este seed espera (evita reventar con "undefined.id" en ese caso).
    const cancha = (i) => canchas[i % canchas.length];
    const admin = (i) => admins[i % admins.length];
    const cliente = (i) => clientes[i % clientes.length];

    const reservas = [
      // ── Cargadas por un admin para un cliente externo (sin cuenta) ────────
      {
        canchaId: cancha(0).id, creadoPor: admin(0).id, clienteId: null,
        nombreCliente: 'Rodrigo Paz', telefonoCliente: '+54 388 600-2001',
        fecha: '2026-06-10', horaInicio: '18:00:00', horaFin: '19:00:00', estado: 'finalizada',
      },
      {
        canchaId: cancha(1).id, creadoPor: admin(1).id, clienteId: null,
        nombreCliente: 'Lucía Ferreyra', telefonoCliente: '+54 388 600-2002',
        fecha: '2026-06-15', horaInicio: '20:00:00', horaFin: '21:00:00', estado: 'finalizada',
      },
      {
        canchaId: cancha(2).id, creadoPor: admin(0).id, clienteId: null,
        nombreCliente: 'Grupo Los Amigos', telefonoCliente: '+54 388 600-2003',
        fecha: '2026-06-20', horaInicio: '19:00:00', horaFin: '20:30:00', estado: 'finalizada',
      },
      {
        canchaId: cancha(3).id, creadoPor: admin(2).id, clienteId: null,
        nombreCliente: 'Equipo Halcones', telefonoCliente: '+54 388 600-2004',
        fecha: '2026-06-25', horaInicio: '21:00:00', horaFin: '22:00:00', estado: 'cancelada',
      },
      {
        canchaId: cancha(4).id, creadoPor: admin(1).id, clienteId: null,
        nombreCliente: 'Cumpleaños Franco', telefonoCliente: '+54 388 600-2005',
        fecha: '2026-07-05', horaInicio: '17:00:00', horaFin: '19:00:00', estado: 'confirmada',
      },
      {
        canchaId: cancha(0).id, creadoPor: admin(2).id, clienteId: null,
        nombreCliente: 'Torneo Barrial', telefonoCliente: '+54 388 600-2006',
        fecha: '2026-07-08', horaInicio: '18:00:00', horaFin: '19:00:00', estado: 'pendiente',
      },
      {
        canchaId: cancha(5).id, creadoPor: admin(0).id, clienteId: null,
        nombreCliente: 'Empresa TechSol', telefonoCliente: '+54 388 600-2007',
        fecha: '2026-07-12', horaInicio: '20:00:00', horaFin: '21:30:00', estado: 'confirmada',
      },
      {
        canchaId: cancha(6).id, creadoPor: admin(1).id, clienteId: null,
        nombreCliente: 'Los Tigres FC', telefonoCliente: '+54 388 600-2008',
        fecha: '2026-07-15', horaInicio: '19:00:00', horaFin: '20:00:00', estado: 'pendiente',
      },

      // ── Pedidas por un usuario CLIENTE para sí mismo ───────────────────────
      {
        canchaId: cancha(1).id, creadoPor: cliente(0).id, clienteId: cliente(0).id,
        nombreCliente: cliente(0).name, telefonoCliente: cliente(0).telefono,
        fecha: '2026-06-18', horaInicio: '19:00:00', horaFin: '20:00:00', estado: 'finalizada',
      },
      {
        canchaId: cancha(2).id, creadoPor: cliente(0).id, clienteId: cliente(0).id,
        nombreCliente: cliente(0).name, telefonoCliente: cliente(0).telefono,
        fecha: '2026-07-10', horaInicio: '18:00:00', horaFin: '19:00:00', estado: 'confirmada',
      },
      {
        canchaId: cancha(0).id, creadoPor: cliente(1).id, clienteId: cliente(1).id,
        nombreCliente: cliente(1).name, telefonoCliente: cliente(1).telefono,
        fecha: '2026-06-22', horaInicio: '20:00:00', horaFin: '21:00:00', estado: 'finalizada',
      },
      {
        canchaId: cancha(4).id, creadoPor: cliente(1).id, clienteId: cliente(1).id,
        nombreCliente: cliente(1).name, telefonoCliente: cliente(1).telefono,
        fecha: '2026-07-18', horaInicio: '17:00:00', horaFin: '18:30:00', estado: 'pendiente',
      },
      {
        canchaId: cancha(3).id, creadoPor: cliente(2).id, clienteId: cliente(2).id,
        nombreCliente: cliente(2).name, telefonoCliente: cliente(2).telefono,
        fecha: '2026-06-28', horaInicio: '21:00:00', horaFin: '22:00:00', estado: 'cancelada',
      },
      {
        canchaId: cancha(6).id, creadoPor: cliente(2).id, clienteId: cliente(2).id,
        nombreCliente: cliente(2).name, telefonoCliente: cliente(2).telefono,
        fecha: '2026-07-20', horaInicio: '20:00:00', horaFin: '21:00:00', estado: 'confirmada',
      },
      {
        canchaId: cancha(5).id, creadoPor: cliente(3).id, clienteId: cliente(3).id,
        nombreCliente: cliente(3).name, telefonoCliente: cliente(3).telefono,
        fecha: '2026-07-03', horaInicio: '19:00:00', horaFin: '20:00:00', estado: 'confirmada',
      },
      {
        canchaId: cancha(1).id, creadoPor: cliente(4).id, clienteId: cliente(4).id,
        nombreCliente: cliente(4).name, telefonoCliente: cliente(4).telefono,
        fecha: '2026-07-22', horaInicio: '18:00:00', horaFin: '19:00:00', estado: 'pendiente',
      },
    ].map((r) => ({
      id: crypto.randomUUID(),
      ...r,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    await queryInterface.bulkInsert('Reservas', reservas, { ignoreDuplicates: true });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Reservas', null, {});
  },
};
