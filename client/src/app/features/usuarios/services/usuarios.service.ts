import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../auth/services/auth.service';
import { BodyCreateUser, BodyUpdateUser, UsuariosResponse } from '../interfaces/usuario.model';

@Injectable({ providedIn: 'root' })
export class UsuariosService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly apiUrl = `${environment.apiUrl}/users`;

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${this.authService.getToken()}` });
  }

  /** GET /users/all-users — lista usuarios activos, paginados y con búsqueda opcional. Requiere rol SUPERADMIN. */
  getUsuarios(page: number, limit: number, nombreUsuario?: string) {
    let url = `${this.apiUrl}/all-users?page=${page}&limit=${limit}`;
    if (nombreUsuario) {
      url += `&nombreUsuario=${encodeURIComponent(nombreUsuario)}`;
    }
    return this.http.get<UsuariosResponse>(url, { headers: this.getHeaders() });
  }

  /** POST /users/create-user — crea un usuario nuevo (nace CLIENTE por defecto; ruta pública, no requiere token). */
  createUsuario(body: BodyCreateUser) {
    return this.http.post(`${this.apiUrl}/create-user`, body, { headers: this.getHeaders() });
  }

  /** PUT /users/:id — actualiza nombre y/o rol de un usuario. Requiere rol SUPERADMIN. */
  updateUsuario(id: string, body: BodyUpdateUser) {
    return this.http.put(`${this.apiUrl}/${id}`, body, { headers: this.getHeaders() });
  }

  /** DELETE /users/:id — soft delete: marca estado: false. Requiere rol SUPERADMIN. */
  deleteUsuario(id: string) {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }
}
