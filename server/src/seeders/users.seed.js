'use strict';
const crypto = require('crypto');
const bcrypt = require('bcryptjs'); // Opcional: cámbialo por 'bcrypt' si prefieres

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Generamos un hash real para que todos compartan la misma contraseña de prueba
    const hashedPassword = await bcrypt.hash('Password123!', 10);

    await queryInterface.bulkInsert('Users', [
      {
        id: crypto.randomUUID(),
        type: 'SUPERADMIN',
        name: 'Administrador Principal',
        email: 'superadmin@sistema.com',
        password: hashedPassword,
        estado: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: crypto.randomUUID(),
        type: 'ADMIN',
        name: 'Alejandro Mendoza',
        email: 'alejandro.m@sistema.com',
        password: hashedPassword,
        estado: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: crypto.randomUUID(),
        type: 'ADMIN',
        name: 'Beatriz Silva',
        email: 'beatriz.s@sistema.com',
        password: hashedPassword,
        estado: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: crypto.randomUUID(),
        type: 'ADMIN',
        name: 'Carlos Delgado',
        email: 'carlos.d@sistema.com',
        password: hashedPassword,
        estado: false, // Inactivo
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: crypto.randomUUID(),
        type: 'ADMIN',
        name: 'Diana Rivas',
        email: 'diana.r@sistema.com',
        password: hashedPassword,
        estado: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: crypto.randomUUID(),
        type: 'ADMIN',
        name: 'Eduardo Torres',
        email: 'eduardo.t@sistema.com',
        password: hashedPassword,
        estado: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: crypto.randomUUID(),
        type: 'ADMIN',
        name: 'Fernanda Castro',
        email: 'fernanda.c@sistema.com',
        password: hashedPassword,
        estado: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: crypto.randomUUID(),
        type: 'ADMIN',
        name: 'Gabriel Ortiz',
        email: 'gabriel.o@sistema.com',
        password: hashedPassword,
        estado: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: crypto.randomUUID(),
        type: 'ADMIN',
        name: 'Helena Peña',
        email: 'helena.p@sistema.com',
        password: hashedPassword,
        estado: false, // Inactivo
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: crypto.randomUUID(),
        type: 'ADMIN',
        name: 'Iván Morales',
        email: 'ivan.m@sistema.com',
        password: hashedPassword,
        estado: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: crypto.randomUUID(),
        type: 'ADMIN',
        name: 'Julia Vargas',
        email: 'julia.v@sistema.com',
        password: hashedPassword,
        estado: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: crypto.randomUUID(),
        type: 'ADMIN',
        name: 'Kevin Flores',
        email: 'kevin.f@sistema.com',
        password: hashedPassword,
        estado: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: crypto.randomUUID(),
        type: 'ADMIN',
        name: 'Laura Méndez',
        email: 'laura.m@sistema.com',
        password: hashedPassword,
        estado: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: crypto.randomUUID(),
        type: 'ADMIN',
        name: 'Manuel Ríos',
        email: 'manuel.r@sistema.com',
        password: hashedPassword,
        estado: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: crypto.randomUUID(),
        type: 'ADMIN',
        name: 'Natalia Herrera',
        email: 'natalia.h@sistema.com',
        password: hashedPassword,
        estado: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ], { ignoreDuplicates: true });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Users', null, {});
  }
};