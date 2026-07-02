import { Injectable, inject } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

/** Wrapper fino sobre MatSnackBar para mostrar mensajes cortos de éxito/error en toda la app. */
@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly snackBar = inject(MatSnackBar);

  success(message: string): void {
    this.snackBar.open(message, 'Cerrar', { duration: 3000 });
  }

  /** Igual que success() pero con más duración y la clase `toast-error` para estilo distinto. */
  error(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 5000,
      panelClass: ['toast-error'],
    });
  }
}
