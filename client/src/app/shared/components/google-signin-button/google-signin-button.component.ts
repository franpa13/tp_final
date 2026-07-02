import { AfterViewInit, Component, ElementRef, EventEmitter, Output, ViewChild } from '@angular/core';
import { environment } from '../../../../environments/environment';

// Google Identity Services se carga como <script> global en index.html y
// define window.google en tiempo de ejecución; no tiene tipos oficiales acá.
declare const google: any;

/**
 * Botón "Sign in with Google" (Google Identity Services). Se usa igual en
 * login y register: ambos casos terminan en el mismo endpoint del backend
 * (POST /auth/google), que crea la cuenta como CLIENTE si no existía.
 * No decide qué hacer con la sesión — solo emite el idToken crudo que
 * devuelve Google; quien lo escuche llama a AuthService.loginWithGoogle().
 */
@Component({
  selector: 'app-google-signin-button',
  standalone: true,
  template: `<div #googleButton></div>`,
})
export class GoogleSigninButtonComponent implements AfterViewInit {
  @ViewChild('googleButton', { static: true }) googleButton!: ElementRef<HTMLDivElement>;

  /** idToken firmado por Google, listo para mandar al backend tal cual. */
  @Output() credential = new EventEmitter<string>();

  ngAfterViewInit(): void {
    if (!environment.googleClientId) {
      console.warn('environment.googleClientId vacío: configurá el Client ID de Google para mostrar este botón.');
      return;
    }

    if (typeof google === 'undefined') {
      console.warn('Google Identity Services no cargó (revisar el <script> de accounts.google.com en index.html).');
      return;
    }

    google.accounts.id.initialize({
      client_id: environment.googleClientId,
      callback: (response: { credential: string }) => this.credential.emit(response.credential),
    });

    google.accounts.id.renderButton(this.googleButton.nativeElement, {
      type: 'standard',
      theme: 'outline',
      size: 'large',
      width: 320,
    });
  }
}
