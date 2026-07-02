import { Component, OnInit, inject, signal } from '@angular/core';
import { PagoService } from './services/pago-service';
import { PagoInterface } from './interfaces/pago-interface';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { DialogShellComponent } from '../../shared/components/dialog-shell/dialog-shell.component';
import { DetailPago } from './components/detail-pago/detail-pago';

/**
 * Listado de pagos (solo ADMIN/SUPERADMIN, ver role.guard.ts). Filtra por
 * estado (pendiente/pagado/reembolsado) y abre el detalle de cada pago.
 * El registro de pagos en sí se hace desde ReservaPagoModalComponent.
 */
@Component({
  selector: 'app-pago',
  imports: [MatButtonModule, MatCardModule, MatIconModule, MatDialogModule, MatTableModule, MatFormFieldModule, MatSelectModule],
  templateUrl: './pago.html',
  styleUrl: './pago.css',
})
export class Pago implements OnInit {
  private readonly pagosService = inject(PagoService);
  private readonly dialog = inject(MatDialog);

  readonly pagos        = signal<PagoInterface[]>([]);
  readonly page         = signal<number>(1);
  readonly pageSize     = signal<number>(10);
  readonly totalPages   = signal<number>(0);
  readonly total        = signal<number>(0);
  readonly displayedColumns = ['monto', 'metodoPago', 'cancha', 'acciones'];
  readonly sizePages = [10, 25, 50];
  readonly estados = ['pendiente', 'pagado', 'reembolsado'];
  readonly estadoFiltro = signal<string | undefined>(undefined);

  ngOnInit(): void {
    this.cargarPagos();
  }

  /** Filtra la lista por estado (o la limpia si viene undefined) y vuelve a la página 1. */
  filtrarPorEstado(estado: string | undefined): void {
    this.estadoFiltro.set(estado);
    this.page.set(1);
    this.cargarPagos();
  }

  deleteFilters(): void {
    this.filtrarPorEstado(undefined);
  }

  cargarPagos(): void {
    this.pagosService.getPagos(this.page(), this.pageSize(), this.estadoFiltro()).subscribe({
      next: (r) => {
        this.pagos.set(r.data.pagos);
        this.total.set(r.data.total);
        this.totalPages.set(r.data.totalPages);
      },
      error: (e) => alert(e.message),
    });
  }

  paginaAnterior(): void {
    if (this.page() > 1) {
      this.page.set(this.page() - 1);
      this.cargarPagos();
    }
  }

  paginaSiguiente(): void {
    if (this.page() < this.totalPages()) {
      this.page.set(this.page() + 1);
      this.cargarPagos();
    }
  }

  cambiarTamanio(size: number): void {
    this.pageSize.set(size);
    this.page.set(1);
    this.cargarPagos();
  }

  abrirDetailPago(pago: PagoInterface): void {
    this.dialog.open(DialogShellComponent, {
      width: '500px',
      data: { title: 'Detalle del pago', component: DetailPago, inputs: pago ? { pago } : undefined },
    });
  }
}
