import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../auth/services/auth.service';
import {
  CanchaMasReservada,
  EstadisticaResponse,
  IngresoPorMes,
  MetodoPagoStat,
  ReservaPorEstado,
} from '../interfaces/estadisticas.model';

/** Datos agregados para los gráficos del dashboard. Todos los endpoints requieren rol ADMIN o SUPERADMIN. */
@Injectable({ providedIn: 'root' })
export class EstadisticasService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly apiUrl = `${environment.apiUrl}/estadisticas`;

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${this.authService.getToken()}` });
  }

  /** GET /estadisticas/reservas-por-estado — para el gráfico de torta de estados. */
  getReservasPorEstado() {
    return this.http.get<EstadisticaResponse<ReservaPorEstado>>(
      `${this.apiUrl}/reservas-por-estado`,
      { headers: this.getHeaders() },
    );
  }

  /** GET /estadisticas/ingresos-por-mes — para el gráfico de línea, últimos 12 meses. */
  getIngresosPorMes() {
    return this.http.get<EstadisticaResponse<IngresoPorMes>>(
      `${this.apiUrl}/ingresos-por-mes`,
      { headers: this.getHeaders() },
    );
  }

  /** GET /estadisticas/canchas-mas-reservadas — para el gráfico de barras (top 5). */
  getCanchasMasReservadas() {
    return this.http.get<EstadisticaResponse<CanchaMasReservada>>(
      `${this.apiUrl}/canchas-mas-reservadas`,
      { headers: this.getHeaders() },
    );
  }

  /** GET /estadisticas/metodos-pago — para el segundo gráfico de torta. */
  getMetodosPago() {
    return this.http.get<EstadisticaResponse<MetodoPagoStat>>(
      `${this.apiUrl}/metodos-pago`,
      { headers: this.getHeaders() },
    );
  }
}
