import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../auth/services/auth.service';
import { BodyCreateReserva, EstadoReserva, ReservasResponse } from '../interfaces/reserva.model';

@Injectable({ providedIn: 'root' })
export class ReservasService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly apiUrl = `${environment.apiUrl}/reservas`;

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${this.authService.getToken()}` });
  }

  /**
   * GET /reservas — para ADMIN/SUPERADMIN lista todas las reservas no canceladas
   * (con búsqueda opcional por nombreCliente); para un usuario CLIENTE, el backend
   * ignora nombreCliente y devuelve únicamente sus propias reservas (con canceladas incluidas).
   */
  getReservas(page = 1, limit = 10, nombreCliente?: string) {
    let url = `${this.apiUrl}?page=${page}&limit=${limit}`;
    if (nombreCliente) {
      url += `&nombreCliente=${encodeURIComponent(nombreCliente)}`;
    }
    return this.http.get<ReservasResponse>(url, { headers: this.getHeaders() });
  }

  /**
   * POST /reservas — crea una reserva. Un ADMIN/SUPERADMIN debe mandar nombreCliente/
   * telefonoCliente (cliente externo); si la pide un CLIENTE, el backend ignora esos
   * campos y usa los datos de su propio perfil.
   */
  createReserva(body: BodyCreateReserva) {
    return this.http.post(this.apiUrl, body, { headers: this.getHeaders() });
  }

  /**
   * PATCH /reservas/:id/estado — cambia el estado del turno. ADMIN/SUPERADMIN
   * pueden ponerle cualquier estado a cualquier reserva; un CLIENTE solo puede
   * cancelar (ver cancelarReserva) su propia reserva pendiente/confirmada.
   */
  cambiarEstado(id: string, estado: EstadoReserva) {
    return this.http.patch(`${this.apiUrl}/${id}/estado`, { estado }, { headers: this.getHeaders() });
  }

  /** Cancela la reserva (atajo de cambiarEstado a 'cancelada'). Es la única transición permitida para un CLIENTE. */
  cancelarReserva(id: string) {
    return this.cambiarEstado(id, 'cancelada');
  }
}
