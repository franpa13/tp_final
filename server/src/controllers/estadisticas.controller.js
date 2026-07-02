const { Op, fn, col, literal } = require('sequelize');
const { Reserva, Pago, Canchas } = require('../models');

const estadisticasCtrl = {};

// GET /api/estadisticas/reservas-por-estado
// Cantidad de reservas agrupadas por estado (pendiente/confirmada/cancelada/finalizada).
// Alimenta el gráfico de torta del dashboard.
estadisticasCtrl.reservasPorEstado = async (req, res, next) => {
  try {
    const rows = await Reserva.findAll({
      attributes: ['estado', [fn('COUNT', col('id')), 'total']],
      group: ['estado'],
      raw: true,
    });

    res.status(200).json({
      data: rows.map((r) => ({ estado: r.estado, total: Number(r.total) })),
      message: 'Estadística de reservas por estado obtenida correctamente',
    });
  } catch (e) {
    next(e);
  }
};

// GET /api/estadisticas/ingresos-por-mes
// Suma de pagos con estado 'pagado' agrupados por mes (YYYY-MM), últimos 12 meses.
// Alimenta el gráfico de línea del dashboard.
estadisticasCtrl.ingresosPorMes = async (req, res, next) => {
  try {
    const mesColumna = fn('to_char', col('createdAt'), 'YYYY-MM');

    const rows = await Pago.findAll({
      attributes: [
        [mesColumna, 'mes'],
        [fn('SUM', col('monto')), 'total'],
      ],
      where: {
        estado: 'pagado',
        createdAt: { [Op.gte]: literal("NOW() - INTERVAL '12 months'") },
      },
      // Se agrupa/ordena por la misma expresión (no por el alias 'mes') para
      // que la consulta no dependa de que el dialecto soporte GROUP BY alias.
      group: [mesColumna],
      order: [[mesColumna, 'ASC']],
      raw: true,
    });

    res.status(200).json({
      data: rows.map((r) => ({ mes: r.mes, total: Number(r.total) })),
      message: 'Estadística de ingresos por mes obtenida correctamente',
    });
  } catch (e) {
    next(e);
  }
};

// GET /api/estadisticas/canchas-mas-reservadas
// Top 5 canchas con más reservas activas (no canceladas).
// Alimenta el gráfico de barras del dashboard.
estadisticasCtrl.canchasMasReservadas = async (req, res, next) => {
  try {
    const counts = await Reserva.findAll({
      attributes: ['canchaId', [fn('COUNT', col('id')), 'total']],
      where: { estado: { [Op.ne]: 'cancelada' } },
      group: ['canchaId'],
      order: [[fn('COUNT', col('id')), 'DESC']],
      limit: 5,
      raw: true,
    });

    // Se resuelven los nombres en una segunda consulta simple, en vez de un
    // JOIN + GROUP BY combinado (más frágil de escribir bien con Sequelize).
    const canchaIds = counts.map((c) => c.canchaId);
    const canchas = await Canchas.findAll({
      where: { id: canchaIds },
      attributes: ['id', 'nombreCancha'],
      raw: true,
    });
    const nombrePorId = Object.fromEntries(canchas.map((c) => [c.id, c.nombreCancha]));

    res.status(200).json({
      data: counts.map((c) => ({
        canchaId: c.canchaId,
        nombreCancha: nombrePorId[c.canchaId] ?? 'Cancha eliminada',
        total: Number(c.total),
      })),
      message: 'Estadística de canchas más reservadas obtenida correctamente',
    });
  } catch (e) {
    next(e);
  }
};

// GET /api/estadisticas/metodos-pago
// Cantidad de pagos agrupados por método de pago (efectivo/transferencia/tarjeta/mercadopago).
// Alimenta el segundo gráfico de torta del dashboard.
estadisticasCtrl.metodosPago = async (req, res, next) => {
  try {
    const rows = await Pago.findAll({
      attributes: ['metodoPago', [fn('COUNT', col('id')), 'total']],
      group: ['metodoPago'],
      raw: true,
    });

    res.status(200).json({
      data: rows.map((r) => ({ metodoPago: r.metodoPago, total: Number(r.total) })),
      message: 'Estadística de métodos de pago obtenida correctamente',
    });
  } catch (e) {
    next(e);
  }
};

module.exports = estadisticasCtrl;
