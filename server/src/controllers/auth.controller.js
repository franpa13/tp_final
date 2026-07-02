const crypto = require("crypto");
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken");
const { JWT_SECRET, JWT_EXPIRES_IN, GOOGLE_CLIENT_ID } = require("../config/env");
const googleClient = require("../config/googleClient");
const { User } = require("../models");

const authCtrl = {}

// Arma el JWT y el shape de respuesta que comparten login() y google():
// mismo token, mismos datos públicos del usuario (nunca la password).
function responderConSesion(res, user, message) {
  const token = jwt.sign(
    {
      id: user.id,
      type: user.type,
      email: user.email,
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );

  res.status(200).json({
    data: {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        type: user.type,
      },
    },
    message,
  });
}

// POST /api/auth/login
// Login de usuarios: valida credenciales y devuelve un JWT si son correctas.
authCtrl.login = async (req, res, next) => {

  try {
    const { email, password } = req.body;

    // Busca solo usuarios activos para evitar login de cuentas deshabilitadas.
    const user = await User.findOne({
      where: { email, estado: true },
    });

    // No se especifica si fallo el email o la password por seguridad.
    if (!user) {
      const error = new Error("Credenciales inválidas");
      error.status = 401;
      return next(error);
    }

    // Compara la password recibida contra la password hasheada guardada.
    const passwordOk = await bcrypt.compare(password, user.password);

    if (!passwordOk) {
      const error = new Error("Credenciales inválidas");
      error.status = 401;
      return next(error);
    }

    responderConSesion(res, user, "Login correcto");
  } catch (e) {
    // Cualquier error inesperado pasa al middleware global de errores.
    next(e);
  }

}

// POST /api/auth/google
// Login/registro con "Sign in with Google". El frontend usa Google Identity
// Services para obtener un idToken firmado por Google y lo manda acá.
//
// Flujo:
//  1. Verificamos el idToken contra los servidores de Google (firma, expiración
//     y que la audiencia sea nuestro GOOGLE_CLIENT_ID) — nunca confiamos en el
//     payload sin verificar, podría estar falsificado.
//  2. Buscamos un usuario existente por el email que viene en el token.
//  3. Si no existe, lo creamos como CLIENTE (mismo default que el registro
//     público) con una password aleatoria que nadie conoce: esa cuenta queda
//     utilizable solo iniciando sesión con Google, nunca con email/password.
//  4. Emitimos nuestro propio JWT igual que en login(), para que el resto de
//     la app (guards, requireRole, etc.) no tenga que saber que el usuario
//     entró por Google.
authCtrl.google = async (req, res, next) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      const error = new Error("idToken requerido");
      error.status = 400;
      return next(error);
    }

    let payload;
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken,
        audience: GOOGLE_CLIENT_ID,
      });
      payload = ticket.getPayload();
    } catch (e) {
      const error = new Error("Token de Google inválido o expirado");
      error.status = 401;
      return next(error);
    }

    if (!payload?.email_verified) {
      const error = new Error("El email de la cuenta de Google no está verificado");
      error.status = 401;
      return next(error);
    }

    let user = await User.findOne({ where: { email: payload.email } });

    if (user && !user.estado) {
      const error = new Error("Usuario desactivado");
      error.status = 401;
      return next(error);
    }

    let esNuevo = false;
    if (!user) {
      esNuevo = true;
      // Password aleatoria de 32 bytes, hasheada igual que cualquier otra:
      // nunca se le muestra a nadie, solo existe para satisfacer la columna NOT NULL.
      const passwordAleatoria = crypto.randomBytes(32).toString("hex");
      const hashedPassword = await bcrypt.hash(passwordAleatoria, 10);

      user = await User.create({
        name: payload.name || payload.email,
        email: payload.email,
        password: hashedPassword,
        type: "CLIENTE",
        estado: true,
      });
    }

    responderConSesion(res, user, esNuevo ? "Cuenta creada con Google" : "Login con Google correcto");
  } catch (e) {
    next(e);
  }
};

module.exports = authCtrl