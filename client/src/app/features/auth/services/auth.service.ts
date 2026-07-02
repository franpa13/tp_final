import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { User } from '../../usuarios/models/user.model';
import { LoginRequest, LoginResponse, RegisterResponse, RegisterUser } from '../interfaces/auth.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = environment.apiUrl;
  private readonly tokenKey = 'auth_token';
  private readonly userKey = 'auth_user';

  /** POST /auth/login — valida credenciales y guarda token + datos del usuario en localStorage. */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, credentials).pipe(
      tap((response) => this.guardarSesion(response)),
    );
  }

  /**
   * POST /auth/google — login/registro con "Sign in with Google". El idToken lo
   * entrega GoogleSigninButtonComponent. El backend crea la cuenta como CLIENTE
   * si el email no existía, y devuelve el mismo shape que login().
   */
  loginWithGoogle(idToken: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.apiUrl}/auth/google`, { idToken }).pipe(
      tap((response) => this.guardarSesion(response)),
    );
  }

  /** Guarda token + datos del usuario en localStorage. Común a login() y loginWithGoogle(). */
  private guardarSesion(response: LoginResponse): void {
    localStorage.setItem(this.tokenKey, response.data.token);
    localStorage.setItem(this.userKey, JSON.stringify(response.data.user));
  }

  /** POST /users/create-user — registro público, siempre crea el usuario como CLIENTE por defecto. */
  createUser(userCreate: RegisterUser): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.apiUrl}/users/create-user`, userCreate)

  }

  /** Cierra sesión: borra el token y los datos del usuario guardados en localStorage. */
  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
  }

  /** Token JWT actual, o null si no hay sesión iniciada. */
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  /** Datos del usuario logueado (incluye `type`, el rol) guardados en el login, o null. */
  getUser(): User | null {
    const user = localStorage.getItem(this.userKey);
    return user ? JSON.parse(user) as User : null;
  }

  /** true si hay un token guardado (no valida si expiró contra el backend). */
  isLoggedIn(): boolean {
    return Boolean(this.getToken());
  }
}
