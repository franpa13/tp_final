/**
 * Listado de EJEMPLO "productos". Plantilla de referencia de una pantalla
 * CRUD completa: tabla + modal de alta/edición + confirmación de borrado.
 *
 * A propósito NO tiene paginación ni buscador (ver UsuariosComponent o
 * CanchasComponent para el mismo tipo de pantalla, pero CON esos agregados,
 * si el ejercicio pide sumarlos sobre esta base).
 */
import { Component, OnInit, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { DialogShellComponent } from '../../shared/components/dialog-shell/dialog-shell.component';
import { ToastService } from '../../shared/services/toast.service';
import { ProductoFormComponent } from './components/producto-form/producto-form.component';
import { Producto } from './interfaces/producto.model';
import { ProductosService } from './services/productos.service';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [MatButtonModule, MatCardModule, MatIconModule, MatDialogModule, MatTableModule],
  templateUrl: './productos.component.html',
})
export class ProductosComponent implements OnInit {
  private readonly productosService = inject(ProductosService);
  private readonly dialog = inject(MatDialog);
  private readonly toast = inject(ToastService);

  readonly productos = signal<Producto[]>([]);
  readonly displayedColumns = ['nombre', 'descripcion', 'precio', 'stock', 'acciones'];

  ngOnInit(): void {
    this.cargarProductos();
  }

  cargarProductos(): void {
    this.productosService.getProductos().subscribe((r) => {
      this.productos.set(r.data);
    });
  }

  abrirFormularioCrear(): void {
    this.abrirFormProducto('Nuevo producto');
  }

  abrirFormularioEditar(producto: Producto): void {
    this.abrirFormProducto('Editar producto', producto);
  }

  /** Abre el modal reutilizable con ProductoFormComponent adentro (crear o editar). */
  private abrirFormProducto(title: string, producto?: Producto): void {
    this.dialog.open(DialogShellComponent, {
      width: '480px',
      data: { title, component: ProductoFormComponent, inputs: producto ? { producto } : undefined },
    }).afterClosed().subscribe((guardado: boolean) => {
      if (guardado) this.cargarProductos();
    });
  }

  eliminarProducto(id: string): void {
    this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Eliminar producto', message: '¿Estás seguro que querés eliminar este producto?', confirmLabel: 'Eliminar' },
    }).afterClosed().subscribe((confirmo: boolean) => {
      if (confirmo) {
        this.productosService.deleteProducto(id).subscribe({
          next: () => this.cargarProductos(),
          error: (err) => this.toast.error(err?.error?.error ?? 'No se pudo eliminar el producto.'),
        });
      }
    });
  }
}
