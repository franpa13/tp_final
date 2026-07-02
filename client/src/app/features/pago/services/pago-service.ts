import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { AuthService } from '../../auth/services/auth.service';
import { environment } from '../../../../environments/environment';
import { BodyCreatePago, PreferenciaResponse, ResponsePagos } from '../interfaces/pago-interface';

@Injectable({
  providedIn: 'root',
})
export class PagoService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly apiUrl = `${environment.apiUrl}/pagos`
  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${this.authService.getToken()}`,
    });
  }

  /** GET /pagos — lista pagos paginados, con filtro opcional por estado. Requiere rol ADMIN o SUPERADMIN. */
  getPagos(page = 1, limit = 10, estado?: string) {
    let url = `${this.apiUrl}?page=${page}&limit=${limit}`;
    if (estado) {
      url += `&estado=${encodeURIComponent(estado)}`;
    }
    return this.http.get<ResponsePagos>(url, {
      headers: this.getHeaders()
    })
  }

  /** POST /pagos — registra un pago manual (efectivo, transferencia o tarjeta). Requiere rol ADMIN o SUPERADMIN. */
  createPago(body: BodyCreatePago) {
    return this.http.post(this.apiUrl, body, { headers: this.getHeaders() });
  }

  /** POST /pagos/mp/preferencia — crea la preferencia de pago en MercadoPago y devuelve el init_point. Requiere rol ADMIN o SUPERADMIN. */
  crearPreferencia(reservaId: string) {
    return this.http.post<PreferenciaResponse>(`${this.apiUrl}/mp/preferencia`, { reservaId }, { headers: this.getHeaders() });
  }
}
