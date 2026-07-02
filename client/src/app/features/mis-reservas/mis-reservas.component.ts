import { Component, OnInit, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { DialogShellComponent } from '../../shared/components/dialog-shell/dialog-shell.component';
import { ToastService } from '../../shared/services/toast.service';
import { ReservaFormComponent } from '../reservas/components/reserva-form/reserva-form.component';
import { Reserva } from '../reservas/interfaces/reserva.model';
import { ReservasService } from '../reservas/services/reservas.service';

/**
 * Pantalla de reservas para un usuario CLIENTE: solo ve y gestiona las suyas.
 * El backend ya filtra por clienteId (ver reservaCtrl.getAll), así que este
 * componente reutiliza ReservasService tal cual lo usa el panel de admin.
 */
@Component({
  selector: 'app-mis-reservas',
  standalone: true,
  imports: [
    MatButtonModule, MatCardModule, MatIconModule,
    MatDialogModule, MatTableModule, MatChipsModule,
    MatFormFieldModule, MatSelectModule,
  ],
  templateUrl: './mis-reservas.component.html',
})
export class MisReservasComponent implements OnInit {
  private readonly reservasService = inject(ReservasService);
  private readonly dialog = inject(MatDialog);
  private readonly toast = inject(ToastService);

  readonly reservas   = signal<Reserva[]>([]);
  readonly page       = signal<number>(1);
  readonly pageSize   = signal<number>(10);
  readonly totalPages = signal<number>(0);
  readonly total      = signal<number>(0);
  readonly displayedColumns = ['cancha', 'fecha', 'horario', 'estado', 'acciones'];
  readonly sizePages = [10, 25, 50];

  readonly colorEstado: Record<string, string> = {
    pendiente: '',
    confirmada: 'primary',
    cancelada: 'warn',
    finalizada: 'accent',
  };

  ngOnInit(): void {
    this.cargarReservas();
  }

  cargarReservas(): void {
    this.reservasService.getReservas(this.page(), this.pageSize()).subscribe((r) => {
      this.reservas.set(r.data.reservas);
      this.total.set(r.data.total);
      this.totalPages.set(r.data.totalPages);
    });
  }

  paginaAnterior(): void {
    if (this.page() > 1) {
      this.page.set(this.page() - 1);
      this.cargarReservas();
    }
  }

  paginaSiguiente(): void {
    if (this.page() < this.totalPages()) {
      this.page.set(this.page() + 1);
      this.cargarReservas();
    }
  }

  cambiarTamanio(size: number): void {
    this.pageSize.set(size);
    this.page.set(1);
    this.cargarReservas();
  }

  puedeCancelar(reserva: Reserva): boolean {
    return reserva.estado === 'pendiente' || reserva.estado === 'confirmada';
  }

  abrirFormularioCrear(): void {
    this.dialog.open(DialogShellComponent, {
      width: '480px',
      data: { title: 'Nueva reserva', component: ReservaFormComponent, inputs: { modoCliente: true } },
    }).afterClosed().subscribe((guardado: boolean) => { if (guardado) this.cargarReservas(); });
  }

  cancelarReserva(id: string): void {
    this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Cancelar reserva', message: '¿Estás seguro que querés cancelar esta reserva?', confirmLabel: 'Cancelar reserva' },
    }).afterClosed().subscribe((confirmo: boolean) => {
      if (confirmo) this.reservasService.cancelarReserva(id).subscribe({
        next: () => this.cargarReservas(),
        error: (err) => this.toast.error(err?.error?.error ?? 'No se pudo cancelar la reserva.'),
      });
    });
  }
}
