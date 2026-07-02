import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../features/auth/services/auth.service';
import { UserRole } from '../../features/usuarios/models/user.model';

/**
 * Bloquea el acceso a una ruta si el rol del usuario logueado no está en `rolesPermitidos`.
 * Debe usarse junto con authGuard (asume que ya hay sesión iniciada).
 */
export function roleGuard(rolesPermitidos: UserRole[]): CanActivateFn {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const usuario = authService.getUser();
    if (usuario && rolesPermitidos.includes(usuario.type)) {
      return true;
    }

    return router.createUrlTree(['/dashboard']);
  };
}
