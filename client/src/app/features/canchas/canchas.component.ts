import { Component, OnInit, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { DialogShellComponent } from '../../shared/components/dialog-shell/dialog-shell.component';
import { ToastService } from '../../shared/services/toast.service';
import { CanchaFormComponent } from './components/cancha-form/cancha-form.component';
import { Cancha } from './interfaces/cancha.model';
import { CanchasService } from './services/canchas.service';
import { AuthService } from '../auth/services/auth.service';

/**
 * Listado de canchas: CRUD completo para ADMIN/SUPERADMIN, y navegación de
 * solo lectura para un CLIENTE (que necesita ver esto para elegir dónde
 * reservar, ver `esStaff` más abajo). El backend gatea las mutaciones igual.
 */
@Component({
  selector: 'app-canchas',
  standalone: true,
  imports: [MatButtonModule, MatCardModule, MatIconModule, MatDialogModule, MatTableModule, MatFormFieldModule, MatSelectModule, MatInputModule, MatTooltipModule, ReactiveFormsModule],
  templateUrl: './canchas.component.html',
  styleUrl: './canchas.component.scss',
})
export class CanchasComponent implements OnInit {
  private readonly canchasService = inject(CanchasService);
  private readonly dialog = inject(MatDialog);
  private readonly toast = inject(ToastService);
  private readonly authService = inject(AuthService);

  /** Un CLIENTE solo puede navegar el listado; crear/editar/eliminar es de ADMIN/SUPERADMIN. */
  readonly esStaff = this.authService.getUser()?.type !== 'CLIENTE';

  readonly canchas      = signal<Cancha[]>([]);
  readonly page         = signal<number>(1);
  readonly pageSize     = signal<number>(10);
  readonly totalPages   = signal<number>(0);
  readonly total        = signal<number>(0);
  readonly displayedColumns = this.esStaff
    ? ['nombreCancha', 'type', 'numberCancha', 'horaApertura', 'horaCierre', 'precio', 'acciones']
    : ['nombreCancha', 'type', 'numberCancha', 'horaApertura', 'horaCierre', 'precio'];
  readonly sizePages = [10, 25, 50];

  readonly form = new FormGroup({
    search: new FormControl('', { nonNullable: true }),
  });

  ngOnInit(): void {
    this.cargarCanchas();
  }

  submit(): void {
    this.page.set(1);
    this.cargarCanchas();
  }

  deleteFilters(): void {
    this.form.reset();
    this.page.set(1);
    this.cargarCanchas();
  }

  cargarCanchas(): void {
    const nombreCancha = this.form.getRawValue().search || undefined;
    this.canchasService.getCanchas(this.page(), this.pageSize(), nombreCancha).subscribe((r) => {
      this.canchas.set(r.data.canchas);
      this.total.set(r.data.total);
      this.totalPages.set(r.data.totalPages);
    });
  }

  paginaAnterior(): void {
    if (this.page() > 1) {
      this.page.set(this.page() - 1);
      this.cargarCanchas();
    }
  }

  paginaSiguiente(): void {
    if (this.page() < this.totalPages()) {
      this.page.set(this.page() + 1);
      this.cargarCanchas();
    }
  }

  cambiarTamanio(size: number): void {
    this.pageSize.set(size);
    this.page.set(1);
    this.cargarCanchas();
  }

  abrirFormularioCrear(): void {
    this.abrirFormCancha('Nueva cancha');
  }

  abrirFormularioEditar(cancha: Cancha): void {
    this.abrirFormCancha('Editar cancha', cancha);
  }

  /** Abre el modal reutilizable con CanchaFormComponent adentro (crear si no hay cancha, editar si la hay). */
  private abrirFormCancha(title: string, cancha?: Cancha): void {
    this.dialog.open(DialogShellComponent, {
      width: '500px',
      data: { title, component: CanchaFormComponent, inputs: cancha ? { cancha } : undefined },
    }).afterClosed().subscribe((guardado: boolean) => {
      if (guardado) this.cargarCanchas();
    });
  }

  eliminarCancha(id: string): void {
    this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Eliminar cancha', message: '¿Estás seguro que querés eliminar esta cancha?', confirmLabel: 'Eliminar' },
    }).afterClosed().subscribe((confirmo: boolean) => {
      if (confirmo) {
        this.canchasService.deleteCancha(id).subscribe({
          next: () => this.cargarCanchas(),
          error: (err) => this.toast.error(err?.error?.error ?? 'No se pudo eliminar la cancha.'),
        });
      }
    });
  }
}
