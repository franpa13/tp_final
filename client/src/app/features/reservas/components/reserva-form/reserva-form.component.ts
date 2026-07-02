/**
 * Formulario para crear una nueva reserva.
 *
 * Modo admin (default): además de cancha/fecha/horario, pide los datos del
 * cliente externo (sin cuenta en el sistema).
 * Modo cliente (@Input modoCliente=true): un usuario CLIENTE reservando para
 * sí mismo. Se ocultan nombre/teléfono porque el backend los completa con su
 * propio perfil e ignora cualquier valor que se le mande.
 * En ambos casos el backend valida que no haya conflicto de horario.
 */
import { Component, Input, OnInit, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { signal } from '@angular/core';
import { DialogShellComponent } from '../../../../shared/components/dialog-shell/dialog-shell.component';
import { ToastService } from '../../../../shared/services/toast.service';
import { Cancha } from '../../../canchas/interfaces/cancha.model';
import { CanchasService } from '../../../canchas/services/canchas.service';
import { ReservasService } from '../../services/reservas.service';

@Component({
  selector: 'app-reserva-form',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule],
  templateUrl: './reserva-form.component.html',
})
export class ReservaFormComponent implements OnInit {
  private readonly reservasService = inject(ReservasService);
  private readonly canchasService = inject(CanchasService);
  readonly dialogRef = inject(MatDialogRef<DialogShellComponent>);
  private readonly toast = inject(ToastService);

  /** true cuando lo abre un usuario CLIENTE reservando para sí mismo. */
  @Input() modoCliente = false;

  readonly canchas = signal<Cancha[]>([]);

  readonly form = new FormGroup({
    canchaId: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    nombreCliente: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    telefonoCliente: new FormControl('', { nonNullable: true }),
    fecha: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    horaInicio: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    horaFin: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
  });

  ngOnInit(): void {
    this.canchasService.getCanchas().subscribe((r) => this.canchas.set(r.data.canchas));

    if (this.modoCliente) {
      // El backend ignora estos campos para un CLIENTE (usa su propio perfil),
      // así que dejan de ser obligatorios en el form.
      this.form.controls.nombreCliente.clearValidators();
      this.form.controls.nombreCliente.updateValueAndValidity();
    }
  }

  submit(): void {
    if (this.form.invalid) return;

    const { nombreCliente, telefonoCliente, ...resto } = this.form.getRawValue();
    const body = {
      ...resto,
      ...(this.modoCliente ? {} : { nombreCliente, telefonoCliente }),
      horaInicio: `${resto.horaInicio}:00`,
      horaFin: `${resto.horaFin}:00`,
    };

    this.reservasService.createReserva(body).subscribe({
      next: () => this.dialogRef.close(true),
      error: (err) => {
        this.toast.error(err?.error?.error ?? 'Ocurrió un error al crear la reserva.');
        this.dialogRef.close(false);
      },
    });
  }
}
