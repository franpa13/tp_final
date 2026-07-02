const { Op } = require("sequelize");
const db = require("../models");
const { User } = db
const bcrypt = require("bcryptjs")
const userCtrl = {}

// Roles que se pueden auto-asignar desde el registro público.
// SUPERADMIN nunca se crea por esta vía (solo por seed o por otro SUPERADMIN).
const TIPOS_REGISTRO_PUBLICO = ["ADMIN", "CLIENTE"];

// POST /api/users/create-user
// Ruta pública (sin token). Registra un usuario nuevo, siempre como CLIENTE por
// defecto salvo que el body pida explícitamente ADMIN (nunca SUPERADMIN por acá).
// Un SUPERADMIN cambia el rol de una cuenta ya creada vía PUT /users/:id.
userCtrl.createUser = async (req, res, next) => {
    try {
        const { name, email, password, telefono, type } = req.body;

        if (type && !TIPOS_REGISTRO_PUBLICO.includes(type)) {
            const error = new Error(`Tipo de usuario inválido. Valores permitidos: ${TIPOS_REGISTRO_PUBLICO.join(', ')}`);
            error.status = 400;
            return next(error);
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const bodyRequest = {
            name,
            email,
            telefono,
            password: hashedPassword,
            estado: true,
            type: type || "CLIENTE",
        };
        const userDuplicate = await User.findOne({
            where: {
                email: req.body.email,
            },
        })
        // 409 email o data duplicada
        if (userDuplicate) {
            const error = new Error("Email registrado anteriormente");
            error.status = 409;
            return next(error);
        }


        const user = await User.create(bodyRequest);
        res.status(201).json({
            data: user,
            message: "Usuario creado correctamente"
        })
    } catch (e) {
        next(e)
    }
}

// GET /api/users/all-users
// Lista usuarios activos, paginados y con búsqueda opcional por nombre. Requiere rol SUPERADMIN.
userCtrl.getUsers = async (req, res, next) => {
    try {
        const page  = Math.max(1, parseInt(req.query.page)  || 1);
        const limit = Math.max(1, parseInt(req.query.limit) || 10);
        const offset = (page - 1) * limit;
        const { nombreUsuario } = req.query;

        const where = { estado: true };
        if (nombreUsuario) {
            where.name = { [Op.iLike]: `%${nombreUsuario}%` };
        }

        const { count, rows: users } = await User.findAndCountAll({
            where,
            attributes: { exclude: ['password'] },
            limit,
            offset,
        });

        res.status(200).json({
            data: {
                users,
                total:      count,
                page,
                totalPages: Math.ceil(count / limit),
                limit,
            },
            message: 'Usuarios obtenidos correctamente',
        });
    } catch (e) {
        next(e);
    }
};

// GET /api/users/user/:id
// Trae un usuario activo puntual por id (sin password). Requiere rol SUPERADMIN.
userCtrl.getById = async (req, res, next) => {
    try {
        const id = req.params.id
        const user = await User.findOne({
            where: {
                id,
                estado: true
            },
            attributes: {
                exclude: ["password"]
            }
        })

        if (!user) {
            const error = new Error("Usuario no encontrado");
            error.status = 404;
            return next(error);
        }

        res.status(200).json({
            data: user,
            message: "Usuario obtenido correctamente",
        });


    } catch (e) {
        next(e)
    }
}
// PUT /api/users/:id
// Actualiza nombre y/o rol (type) de un usuario existente. Requiere rol SUPERADMIN,
// porque permite cambiar el type y no puede quedar abierto a que un ADMIN se autopromueva.
userCtrl.updateUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, type } = req.body;

        const user = await User.findOne({ where: { id, estado: true } });
        if (!user) {
            const error = new Error('Usuario no encontrado');
            error.status = 404;
            return next(error);
        }

        await user.update({ name, type });

        res.status(200).json({
            data: { id: user.id, name: user.name, type: user.type },
            message: 'Usuario actualizado correctamente',
        });
    } catch (e) {
        next(e);
    }
};

// DELETE /api/users/:id
// Soft delete: marca estado=false en vez de borrar la fila. Requiere rol SUPERADMIN.
userCtrl.deleteUser = async (req, res, next) => {
    try {
        const { id } = req.params;

        const user = await User.findOne({ where: { id, estado: true } });
        if (!user) {
            const error = new Error('Usuario no encontrado');
            error.status = 404;
            return next(error);
        }

        await user.update({ estado: false });

        res.status(200).json({ data: null, message: 'Usuario desactivado correctamente' });
    } catch (e) {
        next(e);
    }
};

module.exports = userCtrl
