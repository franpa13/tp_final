/**
 * Formulario de EJEMPLO para crear y editar un Producto. Plantilla de
 * referencia: mismo patrón que cancha-form.component.ts / usuario-form.component.ts.
 *
 * Modo creación: se monta sin @Input `producto`. El submit llama a createProducto.
 * Modo edición:  se recibe un Producto por @Input. ngOnInit precarga el form
 *                con patchValue y el submit llama a updateProducto.
 *
 * Este componente siempre vive dentro de un DialogShellComponent (ver
 * ProductosComponent, que es quien lo abre). Cierra el dialog con
 * dialogRef.close(true) si la operación fue exitosa (para que el padre sepa
 * que tiene que recargar la tabla), o close(false) si falló.
 */
import { Component, Input, OnInit, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { DialogShellComponent } from '../../../../shared/components/dialog-shell/dialog-shell.component';
import { ToastService } from '../../../../shared/services/toast.service';
import { Producto } from '../../interfaces/producto.model';
import { ProductosService } from '../../services/productos.service';

@Component({
  selector: 'app-producto-form',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule],
  templateUrl: './producto-form.component.html',
})
export class ProductoFormComponent implements OnInit {
  private readonly productosService = inject(ProductosService);
  // Público a propósito: el botón "Cancelar" del template llama a dialogRef.close(false) directamente.
  readonly dialogRef = inject(MatDialogRef<DialogShellComponent>);
  private readonly toast = inject(ToastService);

  /** Producto a editar. Si viene undefined, el form opera en modo creación. */
  @Input() producto?: Producto;

  readonly form = new FormGroup({
    nombre: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    descripcion: new FormControl('', { nonNullable: true }),
    precio: new FormControl(0, { nonNullable: true, validators: [Validators.required, Validators.min(0.01)] }),
    stock: new FormControl(0, { nonNullable: true, validators: [Validators.required, Validators.min(0)] }),
  });

  ngOnInit(): void {
    if (!this.producto) return;

    // Modo edición: precarga el form con los datos existentes.
    this.form.patchValue({
      nombre: this.producto.nombre,
      descripcion: this.producto.descripcion ?? '',
      precio: Number(this.producto.precio),
      stock: this.producto.stock,
    });
  }

  get modoEdicion(): boolean {
    return !!this.producto;
  }

  submit(): void {
    if (this.form.invalid) return;

    const body = this.form.getRawValue();

    const request$ = this.modoEdicion
      ? this.productosService.updateProducto(this.producto!.id, body)
      : this.productosService.createProducto(body);

    request$.subscribe({
      next: () => this.dialogRef.close(true),
      error: (err) => {
        this.toast.error(err?.error?.error ?? 'Ocurrió un error al guardar el producto.');
        this.dialogRef.close(false);
      },
    });
  }
}
