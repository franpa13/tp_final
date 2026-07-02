
const { Op } = require("sequelize");
const { Canchas } = require("../models");

const canchasCtrl = {}

// POST /api/canchas/create-cancha
// Crea una cancha nueva. Requiere rol ADMIN o SUPERADMIN (ver canchas.routes.js).
// Evita duplicados: no permite crear otra cancha activa con el mismo nombre + número.
canchasCtrl.create = async (req, res, next) => {

    try {
        const { type, nombreCancha, numberCancha, horaApertura, horaCierre, precio, disponible } = req.body;


        const cancha = await Canchas.findOne({
            where: { nombreCancha, numberCancha, estado: true },
        });


        if (cancha) {
            const error = new Error("Cancha registrada anteriormente");
            error.status = 401;
            return next(error);
        }

        await Canchas.create({
            type, nombreCancha, numberCancha, horaApertura, horaCierre, precio, disponible
        })

        res.status(200).json({
            data: {
                cancha: {
                    type, nombreCancha, numberCancha, horaApertura, horaCierre, precio, disponible
                },
            },
            message: "Cancha creada correctamente",
        });
    } catch (e) {
        // Cualquier error inesperado pasa al middleware global de errores.
        next(e);
    }

}

// GET /api/canchas
// Lista canchas activas, paginadas y con búsqueda opcional por nombre.
// Abierta a cualquier rol autenticado (un CLIENTE necesita ver esto para elegir dónde reservar).
canchasCtrl.getAll = async (req, res, next) => {
    try {
        const page  = Math.max(1, parseInt(req.query.page)  || 1);
        const limit = Math.max(1, parseInt(req.query.limit) || 10);
        const offset = (page - 1) * limit;
        const { nombreCancha } = req.query;

        const where = { estado: true };
        if (nombreCancha) {
            where.nombreCancha = { [Op.iLike]: `%${nombreCancha}%` };
        }

        const { count, rows: canchas } = await Canchas.findAndCountAll({
            where,
            limit,
            offset,
        });

        res.status(200).json({
            data: {
                canchas,
                total:      count,
                page,
                totalPages: Math.ceil(count / limit),
                limit,
            },
            message: 'Canchas traidas correctamente',
        });
    } catch (e) {
        next(e)
    }
}

// GET /api/canchas/:id
// Trae una cancha activa puntual por id. Abierta a cualquier rol autenticado.
canchasCtrl.getById = async (req, res, next) => {
    try {
        let canchaUniqe = await Canchas.findOne({
            where: {
                id: req.params.id,
                estado: true
            }
        })

        res.status(200).json({
            data: {
                cancha: canchaUniqe
            },
            message: "Cancha traida correctamente",
        });

    } catch (e) {
        next(e)
    }
}

// DELETE /api/canchas/:id
// Soft delete: marca estado=false en vez de borrar la fila. Requiere rol ADMIN o SUPERADMIN.
canchasCtrl.deleteCancha = async (req, res, next) => {
    try {
        const cancha = await Canchas.findOne({
            where: {
                id: req.params.id,
                estado: true
            }
        })
        if (!cancha) {
            const error = new Error("Cancha no encontrada");
            error.status = 401;
            return next(error);
        }

        await cancha.update({
            estado: false
        })
        res.status(200).json({
            data: null,
            message: "Cancha eliminada correctamente",
        });
    } catch (e) {
        next(e);
    }
}

// PUT /api/canchas/:id
// Actualiza cualquier subconjunto de campos de una cancha. Requiere rol ADMIN o SUPERADMIN.
canchasCtrl.updateCancha = async (req, res, next) => {
    try {
        const { id } = req.params
        const canchaToEdit = await Canchas.findOne({
            where: {
                id: id
            }
        })

        if (!canchaToEdit) {
            const error = new Error("Cancha no encontrada");
            error.status = 401;
            return next(error);
        }

        await canchaToEdit.update(req.body)

        res.status(200).json({
            data: {
                canchaActualizada: req.body
            },
            message: "Cancha actualizada correctamente",
        });
    } catch (e) {
        next(e)
    }
}

module.exports = canchasCtrl