import { Routes } from '@angular/router';
import { LoginComponent } from './features/auth/login/login.component';
import { CanchasComponent } from './features/canchas/canchas.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';


import { ReservasComponent } from './features/reservas/reservas.component';
import { MisReservasComponent } from './features/mis-reservas/mis-reservas.component';
import { UsuariosComponent } from './features/usuarios/usuarios.component';
import { MainLayoutComponent } from './layout/layout';
import { Register } from './features/auth/register/register';
import { authGuard } from './core/guards/auth.guard';
import { publicGuard } from './core/guards/public.guard';
import { roleGuard } from './core/guards/role.guard';
import { Pago } from './features/pago/pago';
import { Profile } from './features/profile/profile';
import { ProductosComponent } from './features/productos/productos.component';

// Angular recorre este array de arriba a abajo y usa la PRIMERA ruta que coincida con la URL.
// Por eso el orden importa: las rutas mas especificas van primero, el wildcard '**' siempre al final.
export const routes: Routes = [
    {
        // path: '' coincide con la URL raiz, es decir http://localhost:4200/
        // pathMatch: 'full' significa que la URL completa debe ser exactamente '' (vacio).
        // Sin 'full', path: '' coincidiria con CUALQUIER ruta porque toda URL empieza con ''.
        path: '',
        pathMatch: 'full',
        redirectTo: 'login', // si la URL es exactamente '/', manda al login
    },
    {
        // Ruta publica: solo accesible si NO hay sesion iniciada.
        // publicGuard redirige a /dashboard si ya hay token en localStorage.
        path: 'login',
        component: LoginComponent,
        canActivate: [publicGuard],
    },
    {
        // Igual que login: publica, bloqueada si ya estas autenticado.
        path: 'register',
        component: Register,
        canActivate: [publicGuard],
    },
    {
        // Ruta padre que envuelve todas las pantallas privadas.
        // path: '' no consume nada de la URL, solo monta el MainLayoutComponent (sidebar + toolbar).
        // authGuard bloquea el acceso si no hay token; redirige a /login.
        path: '',
        component: MainLayoutComponent,
        canActivate: [authGuard],
        children: [
            {
                // Dentro del layout, si la URL no tiene nada despues del '/', redirige a /dashboard.
                // pathMatch: 'full' es obligatorio aqui tambien por la misma razon que arriba.
                path: '',
                pathMatch: 'full',
                redirectTo: 'dashboard',
            },
            {
                // Cada ruta hija le dice al router que componente renderizar dentro del <router-outlet>
                // que tiene el MainLayoutComponent en su template.
                path: 'dashboard',
                component: DashboardComponent,
            },
            {
                // Solo SUPERADMIN administra usuarios.
                path: 'usuarios',
                component: UsuariosComponent,
                canActivate: [roleGuard(['SUPERADMIN'])],
            },
            {
                // Canchas es de lectura libre para cualquier rol logueado (un CLIENTE
                // necesita poder navegarlas para elegir dónde reservar); el propio
                // componente oculta las acciones de gestión si no es ADMIN/SUPERADMIN.
                path: 'canchas',
                component: CanchasComponent,
            },
            {
                // Panel de reservas de administración: ve y gestiona TODAS las reservas.
                // Un CLIENTE usa /mis-reservas en su lugar.
                path: 'reservas',
                component: ReservasComponent,
                canActivate: [roleGuard(['ADMIN', 'SUPERADMIN'])],
            },
            {
                path: 'mis-reservas',
                component: MisReservasComponent,
                canActivate: [roleGuard(['CLIENTE'])],
            },
            {
                path: 'pagos',
                component: Pago,
                canActivate: [roleGuard(['ADMIN', 'SUPERADMIN'])],
            },

               {
                path: 'profile',
                component: Profile,
                canActivate: [roleGuard(['ADMIN', 'SUPERADMIN' , "CLIENTE"])],
            },
            {
                // Ejemplo de CRUD simple (ver producto.routes.js en el backend):
                // sin restricción de rol, cualquier usuario logueado puede entrar.
                path: 'productos',
                component: ProductosComponent,
            },
        ],
    },
    // // Páginas de resultado de MercadoPago — sin auth, MP redirige aquí tras el pago
    // { path: 'pago/success', component: PagoResultadoComponent },
    // { path: 'pago/failure', component: PagoResultadoComponent },
    // { path: 'pago/pending', component: PagoResultadoComponent },
    {
        // Wildcard: captura cualquier URL que no haya coincidido con ninguna ruta anterior.
        // Ejemplo: http://localhost:4200/algo-que-no-existe → redirige a login.
        path: '**',
        redirectTo: 'login',
    },
];
