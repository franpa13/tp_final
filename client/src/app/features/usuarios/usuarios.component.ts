import { Component, OnInit, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { ConfirmDialogComponent } from '../../shared/components/confirm-dialog/confirm-dialog.component';
import { DialogShellComponent } from '../../shared/components/dialog-shell/dialog-shell.component';
import { ToastService } from '../../shared/services/toast.service';
import { UsuarioFormComponent } from './components/usuario-form/usuario-form.component';
import { Usuario } from './interfaces/usuario.model';
import { UsuariosService } from './services/usuarios.service';
import { MatFormField, MatFormFieldModule, MatLabel } from "@angular/material/form-field";
import { MatSelect, MatOption, MatSelectModule } from "@angular/material/select";
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../auth/services/auth.service';

/**
 * Panel de administración de usuarios (solo accesible por SUPERADMIN, ver
 * role.guard.ts). Lista, crea, edita el rol y desactiva cuentas.
 */
@Component({
  selector: 'app-usuarios',
  standalone: true,
  imports: [MatButtonModule, MatCardModule, MatIconModule, MatDialogModule, MatTableModule, MatChipsModule, MatFormField, MatLabel, MatSelect, MatOption, MatFormFieldModule, MatSelectModule, MatInputModule, MatTooltipModule, ReactiveFormsModule, FormsModule],
  templateUrl: './usuarios.component.html',

})
export class UsuariosComponent implements OnInit {
  private readonly usuariosService = inject(UsuariosService);
  private readonly dialog = inject(MatDialog);
  private readonly toast = inject(ToastService);
  private readonly authService = inject(AuthService);

  /** Solo un SUPERADMIN puede editar/desactivar usuarios (restricción también aplicada en el backend). */
  readonly esSuperAdmin = this.authService.getUser()?.type === 'SUPERADMIN';

  // manejo de navegacion
  readonly page = signal<number>(1);
  readonly pageSize = signal<number>(10);

  // estados para la resp del endpoint
  readonly totalPages = signal<number>(0);
  readonly total = signal<number>(0);
  readonly usuarios = signal<Usuario[]>([]);
  readonly displayedColumns = ['name', 'email', 'type', 'acciones'];
  readonly sizePages = [10, 25, 50];

  ngOnInit(): void {
    this.cargarUsuarios();
  }


  readonly form = new FormGroup({
    search: new FormControl('', { nonNullable: true }),

  });

  /** Aplica el filtro de búsqueda por nombre y vuelve a la página 1. */
  submit() {
    this.page.set(1);
    const nombreUsuario = this.form.getRawValue().search || undefined;
    this.cargarUsuarios(nombreUsuario);
  }

  /** Limpia el input de búsqueda y recarga la lista sin filtro. */
  deleteFilters() {
    this.form.reset();
    this.page.set(1);
    this.cargarUsuarios();
  }

  /** Trae la página actual de usuarios, opcionalmente filtrada por nombre. */
  private cargarUsuarios(searchUser?: string): void {
    this.usuariosService.getUsuarios(this.page(), this.pageSize(), searchUser).subscribe((r) => {
      this.usuarios.set(r.data.users);
      this.total.set(r.data.total);
      this.totalPages.set(r.data.totalPages);
    });
  }

  paginaAnterior(): void {
    if (this.page() > 1) {
      this.page.set(this.page() - 1);
      this.cargarUsuarios();
    }
  }

  paginaSiguiente(): void {
    if (this.page() < this.totalPages()) {
      this.page.set(this.page() + 1);
      this.cargarUsuarios();
    }
  }

  /** Cambia cuántos usuarios se ven por página y reinicia a la página 1. */
  cambiarTamanio(size: number): void {
    this.pageSize.set(size);
    this.page.set(1);
    this.cargarUsuarios();
  }

  abrirFormularioCrear(): void {
    this.abrirFormUsuario('Nuevo usuario');
  }

  abrirFormularioEditar(usuario: Usuario): void {
    this.abrirFormUsuario('Editar usuario', usuario);
  }

  /** Abre el modal reutilizable con UsuarioFormComponent adentro; recarga la lista si se guardó algo. */
  private abrirFormUsuario(title: string, usuario?: Usuario): void {
    const dialogRef = this.dialog.open(DialogShellComponent, {
      width: '500px',
      data: {
        title,
        component: UsuarioFormComponent,
        inputs: usuario ? { usuario } : undefined,
      },
    });

    dialogRef.afterClosed().subscribe((guardado: boolean) => {
      if (guardado) this.cargarUsuarios();
    });
  }

  /** Pide confirmación y desactiva (soft delete) el usuario. */
  eliminarUsuario(id: string): void {
    this.dialog
      .open(ConfirmDialogComponent, {
        data: {
          title: 'Desactivar usuario',
          message: '¿Estás seguro que querés desactivar este usuario?',
          confirmLabel: 'Desactivar',
        },
      })
      .afterClosed()
      .subscribe((confirmo: boolean) => {
        if (confirmo) this.usuariosService.deleteUsuario(id).subscribe({
          next: () => this.cargarUsuarios(),
          error: (err) => this.toast.error(err?.error?.error ?? 'No se pudo desactivar el usuario.'),
        });
      });
  }
}
