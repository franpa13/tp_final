const { Router } = require("express");
const authCtrl = require("../controllers/auth.controller");

const router = Router();

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login de administrador
 *     description: Valida email y password contra usuarios activos y devuelve un JWT.
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginBody'
 *     responses:
 *       200:
 *         description: Login correcto
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       401:
 *         description: Credenciales inválidas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
// Ruta publica: recibe email/password y devuelve un JWT si son correctos.
router.post("/login", authCtrl.login);

/**
 * @openapi
 * /auth/google:
 *   post:
 *     tags: [Auth]
 *     summary: Login/registro con Google (Sign in with Google)
 *     description: >
 *       Recibe el idToken que devuelve Google Identity Services en el frontend,
 *       lo valida contra los servidores de Google y devuelve un JWT propio con
 *       el mismo formato que /auth/login. Si no existe un usuario con ese email,
 *       lo crea como CLIENTE.
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GoogleLoginBody'
 *     responses:
 *       200:
 *         description: Login o registro con Google correcto
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       400:
 *         description: idToken faltante
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Token de Google inválido/expirado, email no verificado, o usuario desactivado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
// Ruta publica: recibe el idToken de Google Identity Services.
router.post("/google", authCtrl.google);

module.exports = router;
