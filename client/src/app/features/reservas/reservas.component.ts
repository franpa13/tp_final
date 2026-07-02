import { Component, OnInit, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { DialogShellComponent } from '../../shared/components/dialog-shell/dialog-shell.component';
import { ToastService } from '../../shared/services/toast.service';
import { ReservaPagoModalComponent } from './components/reserva-pago-modal/reserva-pago-modal.component';
import { ReservaFormComponent } from './components/reserva-form/reserva-form.component';
import { EstadoReserva, Reserva } from './interfaces/reserva.model';
import { ReservasService } from './services/reservas.service';

/**
 * Panel de administración de reservas (solo ADMIN/SUPERADMIN, ver role.guard.ts):
 * ve todas las reservas activas, cambia su estado (confirmar/cancelar/finalizar)
 * y abre el modal de pago. Un CLIENTE usa /mis-reservas en su lugar.
 */
@Component({
  selector: 'app-reservas',
  standalone: true,
  imports: [
    MatButtonModule, MatCardModule, MatIconModule,
    MatDialogModule, MatTableModule, MatChipsModule, MatMenuModule,
    MatFormFieldModule, MatSelectModule, MatInputModule, MatTooltipModule, ReactiveFormsModule,
  ],
  templateUrl: './reservas.component.html',
  styleUrl: './reservas.component.scss',
})
export class ReservasComponent implements OnInit {
  private readonly reservasService = inject(ReservasService);
  private readonly dialog = inject(MatDialog);
  private readonly toast = inject(ToastService);

  readonly reservas     = signal<Reserva[]>([]);
  readonly page         = signal<number>(1);
  readonly pageSize     = signal<number>(10);
  readonly totalPages   = signal<number>(0);
  readonly total        = signal<number>(0);
  readonly displayedColumns = ['cliente', 'cancha', 'fecha', 'horario', 'estado', 'acciones'];
  readonly sizePages = [10, 25, 50];

  readonly colorEstado: Record<string, string> = {
    pendiente: '',
    confirmada: 'primary',
    cancelada: 'warn',
    finalizada: 'accent',
  };

  readonly form = new FormGroup({
    search: new FormControl('', { nonNullable: true }),
  });

  ngOnInit(): void {
    this.cargarReservas();
  }

  submit(): void {
    this.page.set(1);
    this.cargarReservas();
  }

  deleteFilters(): void {
    this.form.reset();
    this.page.set(1);
    this.cargarReservas();
  }

  cargarReservas(): void {
    const nombreCliente = this.form.getRawValue().search || undefined;
    this.reservasService.getReservas(this.page(), this.pageSize(), nombreCliente).subscribe((r) => {
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

  abrirFormularioCrear(): void {
    this.dialog.open(DialogShellComponent, {
      width: '560px',
      data: { title: 'Nueva reserva', component: ReservaFormComponent },
    }).afterClosed().subscribe((guardado: boolean) => { if (guardado) this.cargarReservas(); });
  }

  /** Abre el modal de pago (manual o MercadoPago) para una reserva pendiente. */
  abrirPagos(reserva: Reserva): void {
    this.dialog.open(DialogShellComponent, {
      width: '480px',
      data: { title: 'Pagar reserva', component: ReservaPagoModalComponent, inputs: { reserva } },
    }).afterClosed().subscribe((guardado: boolean) => { if (guardado) this.cargarReservas(); });
  }

  cambiarEstado(id: string, estado: EstadoReserva): void {
    this.reservasService.cambiarEstado(id, estado).subscribe({
      next: () => this.cargarReservas(),
      error: (err) => this.toast.error(err?.error?.error ?? 'No se pudo cambiar el estado.'),
    });
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
