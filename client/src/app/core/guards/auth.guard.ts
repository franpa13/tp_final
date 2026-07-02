import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../features/auth/services/auth.service';

/**
 * Bloquea el acceso a rutas privadas si no hay un token guardado (sin importar
 * el rol). Es la base sobre la que se apilan los guards más específicos, como
 * roleGuard, que además exige un rol puntual.
 */
export const authGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    return true;
  }

  return router.createUrlTree(['/login']);
};
