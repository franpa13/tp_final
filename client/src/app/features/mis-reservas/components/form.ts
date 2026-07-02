import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';

import { finalize } from 'rxjs';
import { Reserva } from '../../reservas/interfaces/reserva.model';
import { PagoService } from '../../pago/services/pago-service';
import { DialogShellComponent } from '../../../shared/components/dialog-shell/dialog-shell.component';
import { ToastService } from '../../../shared/services/toast.service';
import { MetodoPago } from '../../pago/interfaces/pago-interface';

/**
 * Modal de pago de una reserva pendiente, con dos caminos:
 *  - pagarConMP(): crea una preferencia de MercadoPago y redirige al checkout
 *    (ver el flujo completo documentado en pago.controller.js).

 * Ambos, al confirmar, dejan la reserva en estado "confirmada" (lo hace el backend).
 */
@Component({
  selector: 'app-reserva-pago-modal',
  standalone: true,
  imports: [
    ReactiveFormsModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatButtonModule, MatIconModule,
    MatDividerModule, MatProgressSpinnerModule,
  ],
  templateUrl: './form-component.html',
})
export class ReservaPagoModalComponent {
  @Input() reserva!: Reserva;

  private readonly pagosService = inject(PagoService);
  readonly dialogRef = inject(MatDialogRef<DialogShellComponent>);
  private readonly toast = inject(ToastService);

  readonly cargandoMP = signal(false);
  



  pagarConMP(): void {
    this.cargandoMP.set(true);
    this.pagosService.crearPreferencia(this.reserva.id).pipe(
      finalize(() => this.cargandoMP.set(false)),
    ).subscribe({
      next: ({ data }) => window.location.href = data.init_point,
      error: (err) => {
        this.toast.error(err?.error?.message ?? 'No se pudo iniciar el pago con MercadoPago.');
      },
    });
  }

}
