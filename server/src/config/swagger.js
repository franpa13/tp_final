/**
 * @file swagger.js
 * @description Configuración central de la documentación OpenAPI/Swagger de la API.
 *
 * swagger-jsdoc lee los bloques de comentarios `@openapi` ubicados en los
 * archivos de rutas (apis: abajo) y los combina con la definición base de
 * acá (info, servers, schemas, securitySchemes) para generar el documento
 * OpenAPI completo. swagger-ui-express expone ese documento como una UI
 * interactiva en /api-docs.
 */

const swaggerJsdoc = require('swagger-jsdoc');
const { PORT } = require('./env');

const definition = {
  openapi: '3.0.3',
  info: {
    title: 'API Reserva de Canchas',
    version: '1.0.0',
    description:
      'API REST para la gestión de un sistema de reserva de canchas: usuarios administradores, ' +
      'canchas, horarios, reservas y pagos (incluye integración con MercadoPago Checkout Pro).\n\n' +
      'Autenticación: la mayoría de los endpoints requieren un JWT obtenido en `POST /api/auth/login`, ' +
      'enviado como header `Authorization: Bearer <token>`.',
  },
  servers: [
    { url: `http://localhost:${PORT || 3000}/api`, description: 'Servidor local' },
  ],
  tags: [
    { name: 'Auth', description: 'Autenticación de administradores' },
    { name: 'Users', description: 'Gestión de usuarios administradores' },
    { name: 'Canchas', description: 'Gestión de canchas' },
    { name: 'Horarios', description: 'Gestión de horarios operativos por cancha y día' },
    { name: 'Reservas', description: 'Gestión de turnos reservados por clientes' },
    { name: 'Pagos', description: 'Pagos de reservas, incluida integración con MercadoPago. Todos los endpoints (salvo el webhook) requieren rol ADMIN o SUPERADMIN.' },
    { name: 'Estadísticas', description: 'Datos agregados para los gráficos del dashboard. Requiere rol ADMIN o SUPERADMIN.' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Token JWT obtenido en POST /api/auth/login.',
      },
    },
    schemas: {
      ErrorResponse: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Mensaje de error' },
        },
      },
      ValidationErrorResponse: {
        type: 'object',
        properties: {
          error: { type: 'string', example: 'Datos inválidos' },
          details: {
            type: 'array',
            items: { type: 'string' },
            example: ['email must be unique'],
          },
        },
      },

      User: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          type: { type: 'string', enum: ['ADMIN', 'SUPERADMIN', 'CLIENTE'] },
          name: { type: 'string', example: 'Juan Pérez' },
          email: { type: 'string', format: 'email', example: 'juan@example.com' },
          telefono: { type: 'string', nullable: true, example: '+54 9 11 1234-5678' },
          estado: { type: 'boolean', description: 'false = usuario desactivado', example: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      UserCreateBody: {
        type: 'object',
        required: ['name', 'email', 'password'],
        properties: {
          name: { type: 'string', example: 'Juan Pérez' },
          email: { type: 'string', format: 'email', example: 'juan@example.com' },
          password: { type: 'string', format: 'password', example: 'secreto123' },
          telefono: { type: 'string', example: '+54 9 11 1234-5678' },
          type: {
            type: 'string',
            enum: ['ADMIN', 'CLIENTE'],
            default: 'CLIENTE',
            description: 'Se omite en el registro público (siempre nace CLIENTE). Solo se usa para casos internos; SUPERADMIN nunca se puede crear por esta vía. Para cambiar el rol de un usuario ya creado, usar PUT /users/{id}.',
          },
        },
      },
      UserUpdateBody: {
        type: 'object',
        properties: {
          name: { type: 'string', example: 'Juan Pérez' },
          type: { type: 'string', enum: ['ADMIN', 'SUPERADMIN', 'CLIENTE'] },
        },
      },

      Cancha: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          type: { type: 'string', enum: ['FUT-5', 'FUT-7', 'FUT-9'] },
          nombreCancha: { type: 'string', example: 'Cancha Central' },
          numberCancha: { type: 'integer', example: 1 },
          horaApertura: { type: 'string', example: '08:00:00' },
          horaCierre: { type: 'string', example: '23:00:00' },
          precio: { type: 'string', example: '15000.00', description: 'Decimal serializado como string' },
          disponible: { type: 'boolean', example: true },
          estado: { type: 'boolean', description: 'false = cancha dada de baja (soft delete)', example: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      CanchaCreateBody: {
        type: 'object',
        required: ['type', 'nombreCancha', 'numberCancha', 'horaApertura', 'horaCierre', 'precio'],
        properties: {
          type: { type: 'string', enum: ['FUT-5', 'FUT-7', 'FUT-9'] },
          nombreCancha: { type: 'string', example: 'Cancha Central' },
          numberCancha: { type: 'integer', example: 1 },
          horaApertura: { type: 'string', example: '08:00:00' },
          horaCierre: { type: 'string', example: '23:00:00' },
          precio: { type: 'number', example: 15000 },
          disponible: { type: 'boolean', example: true },
        },
      },
      CanchaUpdateBody: {
        type: 'object',
        description: 'Cualquier subconjunto de campos de la cancha a actualizar.',
        properties: {
          type: { type: 'string', enum: ['FUT-5', 'FUT-7', 'FUT-9'] },
          nombreCancha: { type: 'string' },
          numberCancha: { type: 'integer' },
          horaApertura: { type: 'string' },
          horaCierre: { type: 'string' },
          precio: { type: 'number' },
          disponible: { type: 'boolean' },
        },
      },

      Horario: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          canchaId: { type: 'string', format: 'uuid' },
          diaSemana: { type: 'integer', minimum: 0, maximum: 6, description: '0=domingo … 6=sábado', example: 1 },
          horaApertura: { type: 'string', example: '08:00:00' },
          horaCierre: { type: 'string', example: '23:00:00' },
          activo: { type: 'boolean', description: 'false = la cancha no opera ese día', example: true },
          cancha: { '$ref': '#/components/schemas/Cancha' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      HorarioUpsertBody: {
        type: 'object',
        required: ['canchaId', 'diaSemana', 'horaApertura', 'horaCierre'],
        properties: {
          canchaId: { type: 'string', format: 'uuid' },
          diaSemana: { type: 'integer', minimum: 0, maximum: 6, example: 1 },
          horaApertura: { type: 'string', example: '08:00:00' },
          horaCierre: { type: 'string', example: '23:00:00' },
          activo: { type: 'boolean', example: true },
        },
      },

      Reserva: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          canchaId: { type: 'string', format: 'uuid' },
          creadoPor: { type: 'string', format: 'uuid', description: 'Id de quién cargó la reserva (admin o el propio cliente)' },
          clienteId: { type: 'string', format: 'uuid', nullable: true, description: 'Id del usuario CLIENTE dueño de la reserva; null si la cargó un admin para un cliente externo sin cuenta' },
          nombreCliente: { type: 'string', example: 'Carlos Gómez' },
          telefonoCliente: { type: 'string', nullable: true, example: '+54 9 11 1234-5678' },
          fecha: { type: 'string', format: 'date', example: '2026-07-01' },
          horaInicio: { type: 'string', example: '18:00:00' },
          horaFin: { type: 'string', example: '19:00:00' },
          estado: { type: 'string', enum: ['pendiente', 'confirmada', 'cancelada', 'finalizada'] },
          cancha: { '$ref': '#/components/schemas/Cancha' },
          admin: {
            type: 'object',
            description: 'Quién cargó la reserva (solo id y name)',
            properties: {
              id: { type: 'string', format: 'uuid' },
              name: { type: 'string' },
            },
          },
          cliente: {
            type: 'object',
            description: 'Usuario CLIENTE dueño de la reserva, si la pidió desde su cuenta',
            nullable: true,
            properties: {
              id: { type: 'string', format: 'uuid' },
              name: { type: 'string' },
            },
          },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      ReservaCreateBody: {
        type: 'object',
        required: ['canchaId', 'fecha', 'horaInicio', 'horaFin'],
        description: 'nombreCliente/telefonoCliente son obligatorios cuando la carga un admin; se ignoran (se completan con el perfil) si el que reserva es un CLIENTE.',
        properties: {
          canchaId: { type: 'string', format: 'uuid' },
          nombreCliente: { type: 'string', example: 'Carlos Gómez' },
          telefonoCliente: { type: 'string', example: '+54 9 11 1234-5678' },
          fecha: { type: 'string', format: 'date', example: '2026-07-01' },
          horaInicio: { type: 'string', example: '18:00:00' },
          horaFin: { type: 'string', example: '19:00:00' },
        },
      },
      EstadoBody: {
        type: 'object',
        required: ['estado'],
        properties: {
          estado: { type: 'string', example: 'confirmada' },
        },
      },

      Pago: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          reservaId: { type: 'string', format: 'uuid' },
          monto: { type: 'string', example: '15000.00', description: 'Decimal serializado como string' },
          metodoPago: { type: 'string', enum: ['efectivo', 'transferencia', 'tarjeta', 'mercadopago'] },
          mpPaymentId: { type: 'string', nullable: true, description: 'Id del pago en MercadoPago (solo si metodoPago = mercadopago)' },
          estado: { type: 'string', enum: ['pendiente', 'pagado', 'reembolsado'] },
          reserva: { '$ref': '#/components/schemas/Reserva' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Pagination: {
        type: 'object',
        properties: {
          total:      { type: 'integer', example: 42, description: 'Total de registros que coinciden con el filtro' },
          page:       { type: 'integer', example: 1,  description: 'Página actual' },
          totalPages: { type: 'integer', example: 5,  description: 'Total de páginas' },
          limit:      { type: 'integer', example: 10, description: 'Registros por página' },
        },
      },

      PagoCreateBody: {
        type: 'object',
        required: ['reservaId', 'monto', 'metodoPago'],
        properties: {
          reservaId: { type: 'string', format: 'uuid' },
          monto: { type: 'number', example: 15000 },
          metodoPago: { type: 'string', enum: ['efectivo', 'transferencia', 'tarjeta'] },
        },
      },
      PagoEstadoBody: {
        type: 'object',
        required: ['estado'],
        properties: {
          estado: { type: 'string', enum: ['pendiente', 'pagado', 'reembolsado'] },
        },
      },
      PreferenciaBody: {
        type: 'object',
        required: ['reservaId'],
        properties: {
          reservaId: { type: 'string', format: 'uuid' },
        },
      },
      PreferenciaResponse: {
        type: 'object',
        properties: {
          data: {
            type: 'object',
            properties: {
              init_point: { type: 'string', format: 'uri', description: 'URL de checkout de MercadoPago a la que redirigir al cliente' },
            },
          },
          message: { type: 'string', example: 'Preferencia de pago creada' },
        },
      },
      MpWebhookBody: {
        type: 'object',
        description: 'Body que envía MercadoPago al notificar un cambio de estado de pago (IPN/webhook).',
        properties: {
          type: { type: 'string', example: 'payment' },
          data: {
            type: 'object',
            properties: { id: { type: 'string', example: '123456789' } },
          },
        },
      },

      LoginBody: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email', example: 'admin@example.com' },
          password: { type: 'string', format: 'password', example: 'secreto123' },
        },
      },
      GoogleLoginBody: {
        type: 'object',
        required: ['idToken'],
        properties: {
          idToken: {
            type: 'string',
            description: 'JWT firmado por Google, obtenido en el frontend con Google Identity Services (credential del callback de google.accounts.id).',
          },
        },
      },
      LoginResponse: {
        type: 'object',
        properties: {
          data: {
            type: 'object',
            properties: {
              token: { type: 'string', description: 'JWT a usar como Bearer token' },
              user: {
                type: 'object',
                properties: {
                  id: { type: 'string', format: 'uuid' },
                  name: { type: 'string' },
                  email: { type: 'string', format: 'email' },
                  type: { type: 'string', enum: ['ADMIN', 'SUPERADMIN', 'CLIENTE'] },
                },
              },
            },
          },
          message: { type: 'string', example: 'Login correcto' },
        },
      },
    },
    responses: {
      Unauthorized: {
        description: 'Token ausente, inválido o expirado',
        content: {
          'application/json': { schema: { '$ref': '#/components/schemas/ErrorResponse' } },
        },
      },
      Forbidden: {
        description: 'El usuario autenticado no tiene el rol requerido para esta acción',
        content: {
          'application/json': { schema: { '$ref': '#/components/schemas/ErrorResponse' } },
        },
      },
      NotFound: {
        description: 'Recurso no encontrado',
        content: {
          'application/json': { schema: { '$ref': '#/components/schemas/ErrorResponse' } },
        },
      },
    },
  },
  security: [{ bearerAuth: [] }],
};

const path = require('path');

const options = {
  definition,
  // Lee las anotaciones @openapi de todos los archivos de rutas.
  // glob (usado internamente por swagger-jsdoc) requiere forward slashes,
  // por eso se normaliza el separador de path en Windows.
  apis: [
    path.resolve(__dirname, '../routes/*.js').split(path.sep).join('/'),
  ],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
