import { Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { GoogleSigninButtonComponent } from '../../../shared/components/google-signin-button/google-signin-button.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    GoogleSigninButtonComponent,
  ],
  templateUrl: './login.component.html',

})
export class LoginComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly error = signal('');

  readonly form = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
    password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required],
    }),
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set('');

    this.authService.login(this.form.getRawValue()).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigateByUrl('/dashboard');
      },
      error: () => {
        this.loading.set(false);
        this.error.set('No se pudo iniciar sesion. Revisa tus credenciales.');
      },
    });
  }

  goToRegister(): void {
    this.router.navigateByUrl("/register")
  }

  /** Recibe el idToken emitido por GoogleSigninButtonComponent y completa el login. */
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
        this.error.set('No se pudo iniciar sesión con Google.');
      },
    });
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
