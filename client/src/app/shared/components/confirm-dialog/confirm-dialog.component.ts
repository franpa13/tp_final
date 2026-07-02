import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
}

/**
 * Modal de confirmación genérico ("¿estás seguro?") reutilizado en toda la app
 * antes de acciones destructivas (desactivar usuario/cancha, cancelar reserva).
 * Se abre con `dialog.open(ConfirmDialogComponent, { data: {...} })` y el
 * `afterClosed()` del caller recibe `true`/`false` según el botón elegido.
 */
@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
  templateUrl: './confirm-dialog.component.html',
})
export class ConfirmDialogComponent {
  // MAT_DIALOG_DATA inyecta automaticamente el objeto que le pasas al abrir el dialog
  readonly data = inject<ConfirmDialogData>(MAT_DIALOG_DATA);
  readonly dialogRef = inject(MatDialogRef<ConfirmDialogComponent>);

  confirm(): void {
    this.dialogRef.close(true);
  }

  cancel(): void {
    this.dialogRef.close(false);
  }
}
