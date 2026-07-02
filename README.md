# Sistema de alquiler de canchas

Aplicación web para gestionar el alquiler de canchas deportivas. Permite a un administrador gestionar canchas, horarios, usuarios, reservas y pagos (incluyendo pagos online con MercadoPago) desde un panel administrativo.

Trabajo Final Integrador — Programación y Servicios Web, Facultad de Ingeniería, Universidad Nacional de Jujuy.

Este repositorio está dividido en dos aplicaciones:

- `client/`: frontend Angular (standalone components + Angular Material + Tailwind CSS).
- `server/`: backend Node.js con Express, Sequelize y PostgreSQL.

> ⚠️ La consigna del TFI pide **dos repositorios Git independientes** (`proyfrontendgrupoXX` y `proybackendgrupoXX`). Este repo hoy contiene ambos en uno solo — falta separarlos antes de la entrega final. Ver [Checklist de la consigna](#checklist-de-la-consigna-del-tfi).

## Dominio del sistema

- **Usuario**: persona con cuenta en el sistema. Roles (`User.type`): `SUPERADMIN` (control total, incluida gestión de usuarios), `ADMIN` (gestiona canchas/horarios/reservas/pagos, sin acceso a usuarios) y `CLIENTE` (pide y cancela sus propias reservas, navega canchas en solo lectura).
- **Cancha**: espacio deportivo alquilable (`FUT-5`, `FUT-7`, `FUT-9`), con precio, horario de apertura/cierre y disponibilidad.
- **Horario**: disponibilidad operativa de una cancha por día de la semana.
- **Reserva**: turno para una cancha en una fecha y horario específicos. La carga un ADMIN/SUPERADMIN para un cliente externo sin cuenta (`nombreCliente`/`telefonoCliente` como texto libre), o la pide directamente un usuario `CLIENTE` para sí mismo (`clienteId` apunta a ese usuario; sus datos de contacto salen de su perfil). Estados: `pendiente`, `confirmada`, `cancelada`, `finalizada`.
- **Pago**: registro económico asociado a una reserva. Métodos: `efectivo`, `transferencia`, `tarjeta`, `mercadopago`. Estados: `pendiente`, `pagado`, `reembolsado`. Gestionado únicamente por ADMIN/SUPERADMIN.

Regla de negocio central: una cancha no puede tener dos reservas activas (`pendiente`/`confirmada`) que se superpongan en fecha y horario (validado en `reservaCtrl.create`).

## Stack técnico real

Backend (`server/`):

- Node.js + Express 5
- Sequelize 6 + PostgreSQL (`pg`, `pg-hstore`)
- JWT (`jsonwebtoken`) + `bcryptjs` para autenticación
- `google-auth-library` para validar el login con Google
- `mercadopago` SDK (Checkout Pro + webhook)
- `swagger-jsdoc` + `swagger-ui-express` para documentación OpenAPI
- `cors`, `dotenv`, `nodemon`

Frontend (`client/`):

- Angular 21 (standalone components, sin NgModules)
- Angular Material 21 (tema M3, paleta verde — ver `client/src/material-theme.scss`)
- Tailwind CSS 4 para utilidades de layout
- `ng2-charts` + `Chart.js` para los gráficos de estadísticas del dashboard (Angular Material no tiene componentes de gráficos)
- RxJS (Observables en todos los servicios HTTP)
- Vitest para unit tests

> Nota: la consigna original pide "uso extensivo de Bootstrap 5". Este proyecto usa Angular Material + Tailwind en su lugar. Ver checklist.

## Estructura real del backend (MVC)

```txt
server/src/
  routes/         auth, user, canchas, horario, reserva, pago (+ index.js que las monta bajo /api)
  controllers/    un controller por recurso, lógica de negocio incluida (no hay capa services/ separada)
  models/         User, Canchas, Horario, Reserva, Pago (Sequelize) + index.js con las relaciones
  middlewares/     authMiddleware.js (valida JWT), errorHandler.js (errores → JSON)
  config/         database.js, env.js, sequelize.config.js, mercadopago.js, swagger.js
  seeders/        users.seed.js
```

Relaciones: `User` 1:N `Reserva` (como `creadoPor`) · `Canchas` 1:N `Reserva` · `Canchas` 1:N `Horario` · `Reserva` 1:1 `Pago`.

Todas las respuestas exitosas siguen el formato `{ data, message }`; los errores pasan por `next(error)` con `error.status` y el `errorHandler` responde `{ error: "..." }`.

## Estructura real del frontend

No se usa Clean Architecture (domain/application/infrastructure) — la organización real es por *feature*, más simple:

```txt
client/src/app/
  core/
    guards/        auth.guard.ts (bloquea sin sesión), public.guard.ts (bloquea con sesión en login/register),
                   role.guard.ts (bloquea rutas según User.type; usado en /usuarios, /reservas, /pagos, /mis-reservas)
  layout/           shell con sidebar/toolbar para las rutas privadas
  features/
    auth/           login, register (siempre crea CLIENTE), auth.service.ts (guarda el JWT)
    dashboard/      tarjetas de navegación (filtradas por rol) + gráficos de estadísticas para ADMIN/SUPERADMIN
    usuarios/       CRUD + búsqueda (nombreUsuario) + paginación — solo SUPERADMIN
    canchas/        CRUD (ADMIN/SUPERADMIN) + lectura para cualquier rol (CLIENTE navega, sin botones de gestión)
    horarios/       gestión de horarios por cancha (existe pero no está enrutada en app.routes.ts)
    reservas/       panel de administración: todas las reservas, cambio de estado, modal de pago — solo ADMIN/SUPERADMIN
    mis-reservas/   vista de un CLIENTE: solo sus propias reservas, pedir nueva y cancelar
    pago/           listado de pagos + filtro por estado + registro manual/MercadoPago — solo ADMIN/SUPERADMIN
  shared/
    components/     confirm-dialog, dialog-shell (modal genérico reutilizable)
    services/       toast.service.ts
    utils/          form.utils.ts
```

Cada `*.service.ts` es el único punto de contacto con `HttpClient`; los componentes no arman URLs ni llaman `fetch` directamente.

## Endpoints principales

Documentación completa e interactiva en **`/api-docs`** (Swagger UI) una vez levantado el backend; JSON crudo en `/api-docs.json` (importable en Postman).

```txt
POST   /api/auth/login
POST   /api/auth/google            login/registro con Google (idToken de Google Identity Services)

GET    /api/users/all-users        ?page&limit&nombreUsuario     [SUPERADMIN]
GET    /api/users/user/:id                                       [SUPERADMIN]
POST   /api/users/create-user      público, siempre crea type=CLIENTE por defecto (nunca SUPERADMIN)
PUT    /api/users/:id                                             [SUPERADMIN]
DELETE /api/users/:id                                              [SUPERADMIN]

GET    /api/canchas                ?page&limit&nombreCancha      [cualquier rol autenticado]
GET    /api/canchas/:id                                           [cualquier rol autenticado]
POST   /api/canchas/create-cancha                                  [ADMIN, SUPERADMIN]
PUT    /api/canchas/:id                                            [ADMIN, SUPERADMIN]
DELETE /api/canchas/:id                                            [ADMIN, SUPERADMIN]

GET    /api/horarios               ?canchaId&page&limit          [cualquier rol autenticado]
POST   /api/horarios               (upsert por canchaId + diaSemana) [ADMIN, SUPERADMIN]
DELETE /api/horarios/:id                                           [ADMIN, SUPERADMIN]

GET    /api/reservas               ?page&limit&nombreCliente     [propias si CLIENTE; todas si ADMIN/SUPERADMIN]
GET    /api/reservas/:id                                          [ídem, con chequeo de dueño para CLIENTE]
POST   /api/reservas                                               [cualquier rol; CLIENTE reserva para sí mismo]
PATCH  /api/reservas/:id/estado    [ADMIN/SUPERADMIN: cualquier estado; CLIENTE: solo cancelar la propia]

GET    /api/pagos                  ?page&limit&estado             [ADMIN, SUPERADMIN]
GET    /api/pagos/:id                                              [ADMIN, SUPERADMIN]
POST   /api/pagos                                                  [ADMIN, SUPERADMIN]
PATCH  /api/pagos/:id/estado                                       [ADMIN, SUPERADMIN]
POST   /api/pagos/mp/preferencia   crea preferencia MercadoPago, devuelve init_point [ADMIN, SUPERADMIN]
POST   /api/pagos/mp/webhook       notificación IPN de MercadoPago (sin auth)

GET    /api/estadisticas/reservas-por-estado                       [ADMIN, SUPERADMIN]
GET    /api/estadisticas/ingresos-por-mes       últimos 12 meses    [ADMIN, SUPERADMIN]
GET    /api/estadisticas/canchas-mas-reservadas top 5               [ADMIN, SUPERADMIN]
GET    /api/estadisticas/metodos-pago                              [ADMIN, SUPERADMIN]
```

Todas las rutas salvo login, el registro público y el webhook de MercadoPago requieren `Authorization: Bearer <token>`. Los roles entre corchetes se aplican con `requireRole()` (`server/src/middlewares/roleMiddleware.js`) o con chequeos de pertenencia dentro del controller (caso de `reservaCtrl`).

## Seguridad implementada

- **JWT**: se genera en `auth.controller.js` (`jwt.sign`) y se valida en `authMiddleware.js` en cada request protegida.
- **bcrypt**: hash de contraseñas al crear usuarios, `bcrypt.compare` en el login.
- **CORS** restringido al origen del frontend (`http://localhost:4200` en dev).
- **Soft delete**: usuarios y canchas se desactivan (`estado: false`) en vez de borrarse.
- **Control de acceso por roles**: `requireRole()` (`server/src/middlewares/roleMiddleware.js`) restringe gestión de usuarios a SUPERADMIN, y mutaciones de canchas/horarios/pagos a ADMIN/SUPERADMIN. Además, `reservaCtrl` aplica reglas de pertenencia para CLIENTE (solo ve/cancela sus propias reservas). En el frontend, `role.guard.ts` bloquea las rutas equivalentes y el menú/dashboard ocultan lo que cada rol no puede usar.
- **Login social con Google**: ver sección dedicada más abajo.
- ⚠️ **Pendiente**: sin 2FA, sin rate limiting, sin Helmet, sin tabla de auditoría/historial de accesos.

## Integración con MercadoPago

Flujo completo (Checkout Pro + webhook) documentado directamente en el código: ver el bloque de comentarios en [`server/src/controllers/pago.controller.js`](server/src/controllers/pago.controller.js) antes de `pagoCtrl.crearPreferencia`.

Variables de entorno necesarias: `MP_ACCESS_TOKEN`, `FRONTEND_URL`, `BACKEND_URL` (ver `.env.example`). En localhost el webhook no se dispara porque MercadoPago no acepta `notification_url` apuntando a localhost — hay que exponer el backend (ngrok o similar) o probarlo en un ambiente desplegado.

## Login/registro con Google

"Sign in with Google" vía **Google Identity Services** (la librería moderna, sin flujo de redirect):

1. El frontend carga el script `https://accounts.google.com/gsi/client` (`client/src/index.html`) y `GoogleSigninButtonComponent` (`client/src/app/shared/components/google-signin-button/`) renderiza el botón oficial, usando `environment.googleClientId`.
2. Al clickear, Google devuelve un `idToken` (JWT firmado por Google) directo al navegador — no pasa por nuestro backend en este paso.
3. El frontend manda ese `idToken` a `POST /api/auth/google`. El backend lo valida contra los servidores de Google con `google-auth-library` (`server/src/config/googleClient.js`), nunca confía en el payload sin verificar.
4. Si no existe un usuario con ese email, se crea como `CLIENTE` (mismo default que el registro manual) con una password aleatoria que nadie conoce — esa cuenta solo se puede usar iniciando sesión con Google.
5. El backend emite el mismo JWT propio que usa `/auth/login`, así el resto de la app (guards, `requireRole`, etc.) no distingue cómo entró el usuario.

El mismo botón se usa en `/login` y `/register`: en ambos casos termina en el mismo endpoint, que decide solo si crear la cuenta o reutilizarla.

**Configuración necesaria (paso manual, no lo puede hacer el asistente):**

1. Crear un proyecto en [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials → Create Credentials → OAuth Client ID → tipo "Web application".
2. Agregar `http://localhost:4200` en "Authorized JavaScript origins" (y el dominio real cuando se despliegue).
3. Copiar el Client ID generado:
   - Backend: pegarlo en `server/.env` como `GOOGLE_CLIENT_ID`.
   - Frontend: pegarlo en `client/src/environments/environment.ts` como `googleClientId`.

Sin ese Client ID configurado en ambos lados, el botón no se muestra (frontend) y el endpoint rechaza cualquier token (backend).

## Ejecución local

Servidor:

```bash
cd server
npm install
cp .env.example .env   # completar credenciales reales
npm run dev
```

Cliente:

```bash
cd client
npm install
npm start
```

URLs:

- API: `http://localhost:3000/api`
- Documentación Swagger: `http://localhost:3000/api-docs`
- Cliente: `http://localhost:4200`

Variables de entorno del servidor (`server/.env`):

```env
DB_NAME=tp_final
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432
PORT=3000
JWT_SECRET=una_clave_larga_y_segura
JWT_EXPIRES_IN=1d
MP_ACCESS_TOKEN=xxxxxx
FRONTEND_URL=http://localhost:4200
BACKEND_URL=http://localhost:3000
GOOGLE_CLIENT_ID=xxxxxx.apps.googleusercontent.com
```

## Checklist de la consigna del TFI

Estado real relevado contra el enunciado (`TRABAJO FINAL INTEGRADOR 2026.pdf`). Usar esta tabla para priorizar el trabajo restante — se actualiza a medida que se cierran puntos.

| Requisito | Estado | Detalle |
|---|---|---|
| Arquitectura MVC backend | ✅ Listo | routes/controllers/models/middlewares/config separados |
| CRUD completo + métodos HTTP | ✅ Listo | GET/POST/PUT/DELETE/PATCH en las 5 entidades |
| Angular (componentes, routing, servicios, forms reactivos) | ✅ Listo | Standalone components, guards, `ReactiveFormsModule` |
| Bootstrap 5 | ❌ Falta | Se usa Angular Material + Tailwind en su lugar |
| Pipes personalizados / validadores custom | ❌ Falta | Solo `Validators` de stock, sin `@Pipe` propios |
| PWA | ⬜ Opcional | No implementado |
| Servicios de terceros (mínimo 4) | 🟡 Parcial | MercadoPago + Google Identity Services (2 de 4) |
| Documentación de endpoints (Swagger) | ✅ Listo | `/api-docs`, OpenAPI 3.0.3 |
| JWT + bcrypt | ✅ Listo | — |
| Control de acceso por roles | ✅ Listo | 3 roles (SUPERADMIN/ADMIN/CLIENTE), aplicado con `requireRole()` + guards de ruta en frontend |
| 2FA | ❌ Falta | — |
| Login social / OAuth | ✅ Listo | "Sign in with Google" (`POST /auth/google`, `google-auth-library` + Google Identity Services) |
| Prevención XSS/CSRF/inyecciones | 🟡 Parcial | Sequelize parametriza queries; sin Helmet/CSRF/sanitización explícita |
| Auditoría de acciones / historial de accesos | 🟡 Parcial | Solo `creadoPor` en `Reserva` |
| Base de datos relacional + Sequelize | ✅ Listo | PostgreSQL, 5 modelos, relaciones, seeders |
| Validaciones en el servidor | 🟡 Parcial | Validación manual por controller, sin librería centralizada |
| Dashboard con gráficos (barra/torta/línea) | ✅ Listo | `ng2-charts` + `Chart.js`: torta (reservas por estado, métodos de pago), línea (ingresos por mes) y barras (canchas más reservadas), datos de `/api/estadisticas/*` |
| Listado con filtros/búsqueda/paginación | ✅ Listo | Implementado en usuarios/canchas/reservas/pagos |
| Exportación PDF | ❌ Falta | — |
| Exportación Excel | ❌ Falta | — |
| Dos repos Git independientes | ❌ Falta | Hoy es un monorepo (`client/` + `server/` juntos) |
| Documentación técnica formal (diagramas, capturas, funcionalidades por rol) | ❌ Falta | Solo este README |

## Reglas para cualquier IA o colaborador

1. Este sistema es para alquiler de canchas deportivas — no crear funcionalidades fuera del dominio sin justificarlo.
2. No mezclar responsabilidades entre cliente y servidor; no poner lógica de negocio en las rutas del backend ni consultas HTTP directas en componentes Angular (siempre pasar por el `*.service.ts` del feature).
3. El frontend **no** usa Clean Architecture ni carpetas `domain/application/infrastructure` — seguir el patrón por feature ya existente (`features/<recurso>/{*.component.ts, services/, interfaces/, components/}`).
4. No crear nombres genéricos (`item`, `product`, `data`) si el concepto real es `cancha`, `reserva`, `usuario`, `horario` o `pago`.
5. Toda reserva debe validar disponibilidad antes de confirmarse (ver `reservaCtrl.create`).
6. Toda respuesta del backend es JSON, con el formato `{ data, message }` en éxito y `{ error }` en fallo (vía `errorHandler`).
7. Las nuevas rutas del backend se montan bajo `/api` (en `server/src/routes/index.js`) y deben documentarse con comentarios `@openapi` para que aparezcan en Swagger.
8. Antes de dar por resueltas las brechas de seguridad/servicios de terceros, revisar la tabla de [Checklist de la consigna](#checklist-de-la-consigna-del-tfi) — es la fuente de verdad de qué falta para la entrega.
