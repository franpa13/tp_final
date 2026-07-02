/**
 * Formulario reutilizable para crear y editar usuarios.
 *
 * Modo creación: sin @Input. Muestra campo password.
 * Modo edición:  recibe un Usuario por @Input. Oculta password, solo permite cambiar nombre y rol.
 */
import { Component, Input, OnInit, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { DialogShellComponent } from '../../../../shared/components/dialog-shell/dialog-shell.component';
import { ToastService } from '../../../../shared/services/toast.service';
import { Usuario, UserRole } from '../../interfaces/usuario.model';
import { UsuariosService } from '../../services/usuarios.service';

@Component({
  selector: 'app-usuario-form',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatIconModule, MatInputModule, MatSelectModule, MatButtonModule],
  templateUrl: './usuario-form.component.html',
})
export class UsuarioFormComponent implements OnInit {
  private readonly usuariosService = inject(UsuariosService);
  readonly dialogRef = inject(MatDialogRef<DialogShellComponent>);
  private readonly toast = inject(ToastService);

  @Input() usuario?: Usuario;

  // El rol solo se elige/edita en modo edición (SUPERADMIN); al crear, el
  // usuario siempre nace CLIENTE por defecto (ver userCtrl.createUser).
  readonly roles: UserRole[] = ['ADMIN', 'SUPERADMIN', 'CLIENTE'];

  readonly form = new FormGroup({
    name: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    email: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    password: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.minLength(6)] }),
    type: new FormControl<UserRole>('ADMIN', { nonNullable: true, validators: [Validators.required] }),
  });

  ngOnInit(): void {
    if (!this.usuario) return;

    this.form.patchValue({ name: this.usuario.name, type: this.usuario.type });
    // En modo edición no se puede cambiar el email ni la contraseña
    this.form.get('email')?.disable();
    this.form.get('password')?.disable();
  }

  get modoEdicion(): boolean {
    return !!this.usuario;
  }

  submit(): void {
    if (this.form.invalid) return;

    const { type, ...datosBasicos } = this.form.getRawValue();
    const request$ = this.modoEdicion
      ? this.usuariosService.updateUsuario(this.usuario!.id, {
          name: datosBasicos.name,
          type,
        })
      // Al crear nunca se manda type: nace CLIENTE por defecto (backend lo asume).
      : this.usuariosService.createUsuario(datosBasicos);

    request$.subscribe({
      next: () => this.dialogRef.close(true),
      error: (err) => {
        this.toast.error(err?.error?.error ?? 'Ocurrió un error al guardar el usuario.');
        this.dialogRef.close(false);
      },
    });
  }
}
