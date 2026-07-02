import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import { AuthService } from '../features/auth/services/auth.service';
import { MatCardTitle } from '@angular/material/card';


/**
 * Shell de las pantallas privadas: sidebar + toolbar + breadcrumb, con
 * <router-outlet> adentro para las rutas hijas (ver app.routes.ts). El menú
 * lateral se arma en `menuItems` filtrando por rol, igual que las tarjetas
 * del dashboard.
 */
@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatSidenavModule,
    MatToolbarModule,
    MatCardTitle
],
  templateUrl: './layout.component.html',

})
export class MainLayoutComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly breakpointObserver = inject(BreakpointObserver);
  toProfileLink  ="/profile"
  // true cuando el ancho de pantalla es menor a 960px (tablet/mobile)
  readonly isMobile = toSignal(
    this.breakpointObserver
      .observe([Breakpoints.XSmall, Breakpoints.Small])
      .pipe(map((state) => state.matches)),
    { initialValue: false },
  );

  // controla si el sidenav está abierto en mobile
  readonly sidenavOpen = signal(false);

  // menuItems debe estar ANTES de rutaActual porque el pipe lo referencia
  // en el momento de inicialización de la clase.
  // Cada item se filtra según el rol del usuario logueado (mismas restricciones
  // que se aplican del lado del backend y en los guards de ruta).
  private readonly rolUsuario = this.authService.getUser()?.type;

  readonly menuItems = [
    { label: 'Inicio', path: '/dashboard', icon: 'dashboard', roles: null },
    { label: 'Usuarios', path: '/usuarios', icon: 'group', roles: ['SUPERADMIN'] },
    { label: 'Canchas', path: '/canchas', icon: 'sports_soccer', roles: null },
    { label: 'Reservas', path: '/reservas', icon: 'event_available', roles: ['ADMIN', 'SUPERADMIN'] },
    { label: 'Mis reservas', path: '/mis-reservas', icon: 'event_available', roles: ['CLIENTE'] },
    { label: 'Pagos', path: '/pagos', icon: 'payments', roles: ['ADMIN', 'SUPERADMIN'] },
  
  ].filter((item) => !item.roles || item.roles.includes(this.rolUsuario!));

  // Breadcrumb derivado de la URL actual.
  // Siempre empieza con "Inicio" y agrega la sección activa si no es /dashboard.
  // startWith(null) dispara el map con la URL inicial al cargar la página.
  readonly breadcrumb = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      startWith(null),
      map(() => {
        const url = this.router.url;
        const seccion = this.menuItems.find((item) => url.startsWith(item.path));
        if (!seccion || seccion.path === '/dashboard') {
          return [{ label: 'Inicio', path: '/dashboard' }];
        }
        return [
          { label: 'Inicio', path: '/dashboard' },
          { label: seccion.label, path: seccion.path },
        ];
      }),
    ),
    { initialValue: [{ label: 'Inicio', path: '/dashboard' }] },
  );

  toggleSidenav(): void {
    this.sidenavOpen.update((open) => !open);
  }

  // En mobile, al navegar se cierra el sidenav automáticamente
  onNavClick(): void {
    if (this.isMobile()) {
      this.sidenavOpen.set(false);
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }
}
