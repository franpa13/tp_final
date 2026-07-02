import { Component, inject, Input } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { DialogShellComponent } from '../../../../shared/components/dialog-shell/dialog-shell.component';
import { PagoInterface } from '../../interfaces/pago-interface';

/** Modal de solo lectura con el detalle completo de un pago (abierto desde Pago). */
@Component({
  selector: 'app-detail-pago',
  imports: [],
  templateUrl: './detail-pago.html',
  styleUrl: './detail-pago.css',
})
export class DetailPago {
  private readonly dialogRef = inject(MatDialogRef<DialogShellComponent>);

  /** Pago a mostrar. Siempre viene definido: este componente no tiene modo creación. */
  @Input() pago?: PagoInterface;
}
