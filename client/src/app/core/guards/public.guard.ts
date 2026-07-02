import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../features/auth/services/auth.service';

/**
 * Guard inverso a authGuard: protege rutas que solo tienen sentido SIN sesión
 * (login, register). Si ya hay un token guardado, redirige a /dashboard en vez
 * de dejar ver el formulario de login/registro de nuevo.
 */
export const publicGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return router.createUrlTree(['/dashboard']);
  }

  return true;
};
