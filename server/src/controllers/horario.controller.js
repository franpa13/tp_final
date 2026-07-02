const { Horario, Canchas } = require('../models');

const horarioCtrl = {};

// GET /api/horarios?canchaId=xxx
// Trae los horarios de una cancha específica.
// `req.query` accede a los parámetros de la URL: /horarios?canchaId=abc
horarioCtrl.getByCanchaId = async (req, res, next) => {
  try {
    const { canchaId } = req.query;

    if (!canchaId) {
      const error = new Error('El parámetro canchaId es requerido');
      error.status = 400;
      return next(error);
    }

    const page  = Math.max(1, parseInt(req.query.page)  || 1);
    const limit = Math.max(1, parseInt(req.query.limit) || 10);
    const offset = (page - 1) * limit;

    const { count, rows: horarios } = await Horario.findAndCountAll({
      where: { canchaId, activo: true },
      include: [{ model: Canchas, as: 'cancha', attributes: ['id', 'nombreCancha'] }],
      order: [['diaSemana', 'ASC']],
      limit,
      offset,
    });

    res.status(200).json({
      data: {
        horarios,
        total:      count,
        page,
        totalPages: Math.ceil(count / limit),
        limit,
      },
      message: 'Horarios obtenidos correctamente',
    });
  } catch (e) {
    next(e);
  }
};

// POST /api/horarios
// Crea o reemplaza el horario de un día para una cancha.
// Si ya existe un horario para ese día y cancha, lo actualiza (upsert).
// `upsert` = INSERT si no existe, UPDATE si ya existe.
horarioCtrl.upsert = async (req, res, next) => {
  try {
    const { canchaId, diaSemana, horaApertura, horaCierre, activo } = req.body;

    // findOrCreate busca un registro con la condición `where`. Si no lo encuentra,
    // lo crea con los valores de `defaults` + `where`.
    // Devuelve [instancia, fueCreado]
    const [horario, creado] = await Horario.findOrCreate({
      where: { canchaId, diaSemana },
      defaults: { horaApertura, horaCierre, activo: activo ?? true },
    });

    // Si ya existía, actualizamos los valores
    if (!creado) {
      await horario.update({ horaApertura, horaCierre, activo: activo ?? horario.activo });
    }

    const mensaje = creado ? 'Horario creado correctamente' : 'Horario actualizado correctamente';
    res.status(creado ? 201 : 200).json({ data: { horario }, message: mensaje });
  } catch (e) {
    next(e);
  }
};

// DELETE /api/horarios/:id
// Soft delete: marca el horario como inactivo en lugar de borrarlo.
horarioCtrl.delete = async (req, res, next) => {
  try {
    const horario = await Horario.findByPk(req.params.id);

    if (!horario) {
      const error = new Error('Horario no encontrado');
      error.status = 404;
      return next(error);
    }

    await horario.update({ activo: false });

    res.status(200).json({ data: null, message: 'Horario desactivado correctamente' });
  } catch (e) {
    next(e);
  }
};

module.exports = horarioCtrl;
