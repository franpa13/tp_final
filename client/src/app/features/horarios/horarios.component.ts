import { Component, OnInit, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { FormsModule } from '@angular/forms';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { DialogShellComponent } from '../../shared/components/dialog-shell/dialog-shell.component';
import { Cancha } from '../canchas/interfaces/cancha.model';
import { CanchasService } from '../canchas/services/canchas.service';
import { HorarioFormComponent } from './components/horario-form/horario-form.component';
import { Horario } from './interfaces/horario.model';
import { HorariosService } from './services/horarios.service';

/**
 * Gestión de horarios de una cancha (elegida en un selector) por día de la semana.
 * ⚠️ Este componente existe y funciona pero no está enrutado en app.routes.ts ni
 * enlazado en el menú (layout.ts) — hoy no es alcanzable navegando la app.
 * El backend (horario.routes.js) sí exige ADMIN/SUPERADMIN para crear/eliminar.
 */
@Component({
  selector: 'app-horarios',
  standalone: true,
  imports: [
    FormsModule, MatButtonModule, MatCardModule, MatIconModule,
    MatDialogModule, MatTableModule, MatFormFieldModule, MatSelectModule,
  ],
  templateUrl: './horarios.component.html',
})
export class HorariosComponent implements OnInit {
  private readonly horariosService = inject(HorariosService);
  private readonly canchasService  = inject(CanchasService);
  private readonly dialog = inject(MatDialog);

  readonly canchas      = signal<Cancha[]>([]);
  readonly horarios     = signal<Horario[]>([]);
  readonly page         = signal<number>(1);
  readonly pageSize     = signal<number>(10);
  readonly totalPages   = signal<number>(0);
  readonly total        = signal<number>(0);
  readonly displayedColumns = ['diaSemana', 'horaApertura', 'horaCierre', 'activo', 'acciones'];
  readonly sizePages = [7, 10, 25];
  readonly diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  canchaSeleccionada = '';

  ngOnInit(): void {
    // Trae todas las canchas para el selector (limit alto para no paginar el dropdown)
    this.canchasService.getCanchas(1, 1000).subscribe((r) => {
      this.canchas.set(r.data.canchas);
      if (r.data.canchas.length > 0) {
        this.canchaSeleccionada = r.data.canchas[0].id;
        this.cargarHorarios();
      }
    });
  }

  cargarHorarios(): void {
    if (!this.canchaSeleccionada) return;
    this.horariosService.getHorarios(this.canchaSeleccionada, this.page(), this.pageSize()).subscribe((r) => {
      this.horarios.set(r.data.horarios);
      this.total.set(r.data.total);
      this.totalPages.set(r.data.totalPages);
    });
  }

  paginaAnterior(): void {
    if (this.page() > 1) {
      this.page.set(this.page() - 1);
      this.cargarHorarios();
    }
  }

  paginaSiguiente(): void {
    if (this.page() < this.totalPages()) {
      this.page.set(this.page() + 1);
      this.cargarHorarios();
    }
  }

  cambiarTamanio(size: number): void {
    this.pageSize.set(size);
    this.page.set(1);
    this.cargarHorarios();
  }

  abrirFormularioCrear(): void {
    this.abrirFormHorario('Nuevo horario');
  }

  abrirFormularioEditar(horario: Horario): void {
    this.abrirFormHorario('Editar horario', horario);
  }

  private abrirFormHorario(title: string, horario?: Horario): void {
    this.dialog.open(DialogShellComponent, {
      width: '500px',
      data: {
        title,
        component: HorarioFormComponent,
        inputs: horario ? { horario } : { canchaIdInicial: this.canchaSeleccionada },
      },
    }).afterClosed().subscribe((guardado: boolean) => {
      if (guardado) this.cargarHorarios();
    });
  }

  eliminarHorario(id: string): void {
    this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Desactivar horario', message: '¿Estás seguro que querés desactivar este horario?', confirmLabel: 'Desactivar' },
    }).afterClosed().subscribe((confirmo: boolean) => {
      if (confirmo) this.horariosService.deleteHorario(id).subscribe(() => this.cargarHorarios());
    });
  }
}
