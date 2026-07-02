/**
 * Formulario de upsert para el horario de un día específico de una cancha.
 *
 * El backend usa findOrCreate: si ya existe un horario para ese día y cancha lo actualiza,
 * si no existe lo crea. Por eso no hay modo creación/edición separado — siempre es upsert.
 *
 * Recibe opcionalmente un Horario por @Input para pre-cargar valores en modo edición.
 * Recibe opcionalmente un canchaId para pre-seleccionar la cancha en modo creación.
 */
import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { DialogShellComponent } from '../../../../shared/components/dialog-shell/dialog-shell.component';
import { Cancha } from '../../../canchas/interfaces/cancha.model';
import { CanchasService } from '../../../canchas/services/canchas.service';
import { Horario } from '../../interfaces/horario.model';
import { HorariosService } from '../../services/horarios.service';

@Component({
  selector: 'app-horario-form',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatButtonModule, MatCheckboxModule],
  templateUrl: './horario-form.component.html',
})
export class HorarioFormComponent implements OnInit {
  private readonly horariosService = inject(HorariosService);
  private readonly canchasService = inject(CanchasService);
  readonly dialogRef = inject(MatDialogRef<DialogShellComponent>);

  @Input() horario?: Horario;
  @Input() canchaIdInicial?: string;

  readonly canchas = signal<Cancha[]>([]);

  readonly diasSemana = [
    { value: 0, label: 'Domingo' },
    { value: 1, label: 'Lunes' },
    { value: 2, label: 'Martes' },
    { value: 3, label: 'Miércoles' },
    { value: 4, label: 'Jueves' },
    { value: 5, label: 'Viernes' },
    { value: 6, label: 'Sábado' },
  ];

  readonly form = new FormGroup({
    canchaId: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    diaSemana: new FormControl<number>(1, { nonNullable: true, validators: [Validators.required] }),
    horaApertura: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    horaCierre: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    activo: new FormControl(true, { nonNullable: true }),
  });

  ngOnInit(): void {
    this.canchasService.getCanchas().subscribe((r) => this.canchas.set(r.data.canchas));

    if (this.horario) {
      this.form.patchValue({
        canchaId: this.horario.canchaId,
        diaSemana: this.horario.diaSemana,
        horaApertura: this.horario.horaApertura.slice(0, 5),
        horaCierre: this.horario.horaCierre.slice(0, 5),
        activo: this.horario.activo,
      });
      // En modo edición no se puede cambiar la cancha ni el día (son la clave del upsert)
      this.form.get('canchaId')?.disable();
      this.form.get('diaSemana')?.disable();
    } else if (this.canchaIdInicial) {
      this.form.patchValue({ canchaId: this.canchaIdInicial });
    }
  }

  get modoEdicion(): boolean {
    return !!this.horario;
  }

  submit(): void {
    if (this.form.invalid) return;

    const value = this.form.getRawValue();
    const body = {
      ...value,
      horaApertura: `${value.horaApertura}:00`,
      horaCierre: `${value.horaCierre}:00`,
    };

    this.horariosService.upsertHorario(body).subscribe({
      next: () => this.dialogRef.close(true),
      error: () => this.dialogRef.close(false),
    });
  }
}
