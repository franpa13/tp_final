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
import { DialogShellComponent } from '../../../../shared/components/dialog-shell/dialog-shell.component';
import { ToastService } from '../../../../shared/services/toast.service';
import { Reserva } from '../../interfaces/reserva.model';
import { MetodoPago } from '../../../pago/interfaces/pago-interface';
import { PagoService } from '../../../pago/services/pago-service';
import { finalize } from 'rxjs';

/**
 * Modal de pago de una reserva pendiente, con dos caminos:
 *  - pagarConMP(): crea una preferencia de MercadoPago y redirige al checkout
 *    (ver el flujo completo documentado en pago.controller.js).
 *  - registrarManual(): registra un pago manual (efectivo/transferencia/tarjeta)
 *    sin salir de la app.
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
  templateUrl: './reserva-pago-modal.component.html',
})
export class ReservaPagoModalComponent implements OnInit {
  @Input() reserva!: Reserva;

  private readonly pagosService = inject(PagoService);
  readonly dialogRef = inject(MatDialogRef<DialogShellComponent>);
  private readonly toast = inject(ToastService);

  readonly cargandoMP = signal(false);

  readonly metodos: { value: MetodoPago; label: string }[] = [
    { value: 'efectivo',      label: 'Efectivo' },
    { value: 'transferencia', label: 'Transferencia' },
    { value: 'tarjeta',       label: 'Tarjeta' },
  ];

  readonly form = new FormGroup({
    metodoPago: new FormControl<MetodoPago>('efectivo', { nonNullable: true, validators: [Validators.required] }),
    monto:      new FormControl<number | null>(null, { validators: [Validators.required, Validators.min(0.01)] }),
  });

  ngOnInit(): void {
    if (this.reserva?.cancha?.precio) {
      this.form.get('monto')!.setValue(Number(this.reserva.cancha.precio));
    }
  }

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

  registrarManual(): void {
    if (this.form.invalid) return;

    const { metodoPago, monto } = this.form.getRawValue();

    this.pagosService.createPago({ reservaId: this.reserva.id, monto: monto!, metodoPago }).subscribe({
      next: () => this.dialogRef.close(true),
      error: (err) => {
        this.toast.error(err?.error?.error ?? 'No se pudo registrar el pago.');
      },
    });
  }
}
