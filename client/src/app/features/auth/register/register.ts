import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatError, MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { GoogleSigninButtonComponent } from '../../../shared/components/google-signin-button/google-signin-button.component';

/**
 * Registro público: siempre crea un usuario tipo CLIENTE.
 * Un SUPERADMIN es quien luego, desde el panel de Usuarios, puede editar
 * el rol de una cuenta (ej. subirla a ADMIN) — ver UsuarioFormComponent.
 * También ofrece registrarse/entrar directo con Google (mismo botón y
 * mismo endpoint de backend que en el login).
 */
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSnackBarModule,
    MatError,
    GoogleSigninButtonComponent,
  ],
  templateUrl: './register.html',
})
export class Register {
  private readonly authService = inject(AuthService)
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);

  readonly loading = signal(false)
  readonly error = signal("")

  readonly form = new FormGroup({
    name: new FormControl("", {
      nonNullable: true,
      validators: [Validators.required]
    }),
    email: new FormControl("", {
      nonNullable: true,
      validators: [Validators.required, Validators.email]
    }),
    telefono: new FormControl("", { nonNullable: true }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  })


  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return
    }

    this.loading.set(true);
    this.error.set('');
    this.authService.createUser(this.form.getRawValue()).subscribe({
      next: () => {
        this.loading.set(false);
        this.openSuccessSnackBar();
      },
      error: (error) => {
        this.loading.set(false);
        this.error.set(error.error?.error || 'No se pudo crear el usuario')
      }
    })
  }

  openSuccessSnackBar(): void {
    const snackBarRef = this.snackBar.open(
      'Usuario creado correctamente',
      'Ir al login',
      {
        duration: 7000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
      }
    );

    snackBarRef.onAction().subscribe(() => {
      this.router.navigateByUrl('/login');
    });
  }


  goToLogin(): void {
    this.router.navigateByUrl("/login")
  }

  /** Recibe el idToken de GoogleSigninButtonComponent: crea la cuenta (o entra si ya existía) y va al dashboard. */
  onGoogleCredential(idToken: string): void {
    this.loading.set(true);
    this.error.set('');

    this.authService.loginWithGoogle(idToken).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigateByUrl('/dashboard');
      },
      error: () => {
        this.loading.set(false);
        this.error.set('No se pudo continuar con Google.');
      },
    });
  }

  getNameError(): string {
    const name = this.form.controls.name;

    if (name.hasError('required')) {
      return 'El nombre es requerido';
    }

    return '';
  }

  getEmailError(): string {
    const email = this.form.controls.email;

    if (email.hasError('required')) {
      return 'El email es requerido';
    }

    if (email.hasError('email')) {
      return 'El email no tiene un formato valido';
    }

    return '';
  }

  getPasswordError(): string {
    const password = this.form.controls.password;

    if (password.hasError('required')) {
      return 'La password es requerida';
    }

    return '';
  }
}
