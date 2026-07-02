/**
 * Servicio HTTP del feature de canchas.
 *
 * Responsabilidad única: hablar con el backend.
 * No contiene lógica de negocio ni estado de UI.
 *
 * Todos los métodos devuelven Observables para que el componente
 * decida cuándo y cómo suscribirse.
 */
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../auth/services/auth.service';
import { BodyCreateCancha, CanchasResponse } from '../interfaces/cancha.model';

@Injectable({
  providedIn: 'root',
})
export class CanchasService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly apiUrl = `${environment.apiUrl}/canchas`;

  /** Construye el header Authorization con el token del usuario logueado. */
  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${this.authService.getToken()}`,
    });
  }

  /** GET /canchas — trae canchas activas paginadas, opcionalmente filtradas por nombre. Cualquier rol autenticado. */
  getCanchas(page = 1, limit = 10, nombreCancha?: string) {
    let url = `${this.apiUrl}?page=${page}&limit=${limit}`;
    if (nombreCancha) {
      url += `&nombreCancha=${encodeURIComponent(nombreCancha)}`;
    }
    return this.http.get<CanchasResponse>(url, { headers: this.getHeaders() });
  }

  /** POST /canchas/create-cancha — crea una cancha nueva. Requiere rol ADMIN o SUPERADMIN. */
  createCancha(body: BodyCreateCancha) {
    return this.http.post(`${this.apiUrl}/create-cancha`, body, { headers: this.getHeaders() });
  }

  /** PUT /canchas/:id — actualiza los campos enviados de una cancha existente. Requiere rol ADMIN o SUPERADMIN. */
  updateCancha(id: string, body: Partial<BodyCreateCancha>) {
    return this.http.put(`${this.apiUrl}/${id}`, body, { headers: this.getHeaders() });
  }

  /** DELETE /canchas/:id — soft delete: marca estado: false en el backend. Requiere rol ADMIN o SUPERADMIN. */
  deleteCancha(id: string) {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }
}
