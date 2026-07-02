/**
 * Formulario reutilizable para crear y editar canchas.
 *
 * Modo creación: se monta sin @Input. El submit llama a createCancha.
 * Modo edición:  se recibe una Cancha por @Input. ngOnInit pre-carga
 *                los valores con patchValue y el submit llama a updateCancha.
 *
 * Este componente siempre vive dentro de un DialogShellComponent.
 * Cierra el dialog con close(true) si la operación fue exitosa,
 * o close(false) si falló, para que el padre pueda recargar la tabla.
 *
 * Nota sobre el tiempo: el input HTML type="time" devuelve "HH:MM"
 * pero Postgres TIME espera "HH:MM:SS". La conversión se hace en submit().
 */
import { Component, Input, OnInit, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FormGroupOf } from '../../../../shared/utils/form.utils';
import { DialogShellComponent } from '../../../../shared/components/dialog-shell/dialog-shell.component';
import { ToastService } from '../../../../shared/services/toast.service';
import { BodyCreateCancha, Cancha } from '../../interfaces/cancha.model';
import { CanchasService } from '../../services/canchas.service';

@Component({
  selector: 'app-cancha-form',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule],
  templateUrl: './cancha-form.component.html',
})
export class CanchaFormComponent implements OnInit {
  private readonly canchasService = inject(CanchasService);
  private readonly dialogRef = inject(MatDialogRef<DialogShellComponent>);
  private readonly toast = inject(ToastService);

  /** Cancha a editar. Si viene undefined, el form opera en modo creación. */
  @Input() cancha?: Cancha;

  readonly tiposCancha = ['FUT-5', 'FUT-7', 'FUT-9'] as const;

  readonly form = new FormGroup<FormGroupOf<BodyCreateCancha>>({
    type: new FormControl<'FUT-5' | 'FUT-7' | 'FUT-9'>('FUT-5', { nonNullable: true, validators: [Validators.required] }),
    nombreCancha: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    numberCancha: new FormControl(0, { nonNullable: true, validators: [Validators.required] }),
    horaApertura: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    horaCierre: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    precio: new FormControl(0, { nonNullable: true, validators: [Validators.required, Validators.min(1)] }),
  });

  ngOnInit(): void {
    if (!this.cancha) return;

    // Modo edición: pre-carga el form con los datos existentes.
    // horaApertura/horaCierre vienen como "HH:MM:SS" del backend,
    // el input type="time" necesita "HH:MM", por eso el slice(0, 5).
    this.form.patchValue({
      type: this.cancha.type,
      nombreCancha: this.cancha.nombreCancha,
      numberCancha: this.cancha.numberCancha,
      horaApertura: this.cancha.horaApertura.slice(0, 5),
      horaCierre: this.cancha.horaCierre.slice(0, 5),
      precio: this.cancha.precio,
    });
  }

  get modoEdicion(): boolean {
    return !!this.cancha;
  }

  submit(): void {
    if (this.form.invalid) return;

    const value = this.form.getRawValue();
    const body: BodyCreateCancha = {
      ...value,
      // Convierte "HH:MM" → "HH:MM:SS" para que Postgres lo acepte como TIME
      horaApertura: `${value.horaApertura}:00`,
      horaCierre: `${value.horaCierre}:00`,
    };

    const request$ = this.modoEdicion
      ? this.canchasService.updateCancha(this.cancha!.id, body)
      : this.canchasService.createCancha(body);

    request$.subscribe({
      next: () => this.dialogRef.close(true),
      error: (err) => {
        this.toast.error(err?.error?.error ?? 'Ocurrió un error al guardar la cancha.');
        this.dialogRef.close(false);
      },
    });
  }
}
