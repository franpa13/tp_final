const { Router } = require('express');
const router = Router();
const estadisticasCtrl = require('../controllers/estadisticas.controller');
const authRequired = require('../middlewares/authMiddleware');
const requireRole = require('../middlewares/roleMiddleware');

// Las estadísticas exponen datos de negocio (ingresos, ocupación) — mismo
// criterio de acceso que /pagos: solo ADMIN o SUPERADMIN.
const soloStaff = requireRole('ADMIN', 'SUPERADMIN');

/**
 * @openapi
 * /estadisticas/reservas-por-estado:
 *   get:
 *     tags: [Estadísticas]
 *     summary: Cantidad de reservas agrupadas por estado
 *     description: Requiere rol ADMIN o SUPERADMIN. Pensado para un gráfico de torta.
 *     responses:
 *       200:
 *         description: Estadística obtenida correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       estado: { type: string, example: pendiente }
 *                       total: { type: integer, example: 12 }
 *                 message: { type: string }
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get('/reservas-por-estado', authRequired, soloStaff, estadisticasCtrl.reservasPorEstado);

/**
 * @openapi
 * /estadisticas/ingresos-por-mes:
 *   get:
 *     tags: [Estadísticas]
 *     summary: Ingresos (pagos con estado pagado) sumados por mes, últimos 12 meses
 *     description: Requiere rol ADMIN o SUPERADMIN. Pensado para un gráfico de línea.
 *     responses:
 *       200:
 *         description: Estadística obtenida correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       mes: { type: string, example: '2026-06' }
 *                       total: { type: number, example: 145000 }
 *                 message: { type: string }
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get('/ingresos-por-mes', authRequired, soloStaff, estadisticasCtrl.ingresosPorMes);

/**
 * @openapi
 * /estadisticas/canchas-mas-reservadas:
 *   get:
 *     tags: [Estadísticas]
 *     summary: Top 5 canchas con más reservas activas (no canceladas)
 *     description: Requiere rol ADMIN o SUPERADMIN. Pensado para un gráfico de barras.
 *     responses:
 *       200:
 *         description: Estadística obtenida correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       canchaId: { type: string, format: uuid }
 *                       nombreCancha: { type: string, example: 'Cancha Central' }
 *                       total: { type: integer, example: 34 }
 *                 message: { type: string }
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get('/canchas-mas-reservadas', authRequired, soloStaff, estadisticasCtrl.canchasMasReservadas);

/**
 * @openapi
 * /estadisticas/metodos-pago:
 *   get:
 *     tags: [Estadísticas]
 *     summary: Cantidad de pagos agrupados por método de pago
 *     description: Requiere rol ADMIN o SUPERADMIN. Pensado para un gráfico de torta.
 *     responses:
 *       200:
 *         description: Estadística obtenida correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       metodoPago: { type: string, example: mercadopago }
 *                       total: { type: integer, example: 8 }
 *                 message: { type: string }
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 */
router.get('/metodos-pago', authRequired, soloStaff, estadisticasCtrl.metodosPago);

module.exports = router;
