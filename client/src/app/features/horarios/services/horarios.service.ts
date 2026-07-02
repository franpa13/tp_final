import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../auth/services/auth.service';
import { BodyCreateHorario, HorariosResponse } from '../interfaces/horario.model';

@Injectable({ providedIn: 'root' })
export class HorariosService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly apiUrl = `${environment.apiUrl}/horarios`;

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${this.authService.getToken()}` });
  }

  /** GET /horarios?canchaId=xxx — trae los horarios activos de una cancha, paginados. */
  getHorarios(canchaId: string, page = 1, limit = 10) {
    return this.http.get<HorariosResponse>(`${this.apiUrl}?canchaId=${canchaId}&page=${page}&limit=${limit}`, { headers: this.getHeaders() });
  }

  /** POST /horarios — crea o actualiza (upsert) el horario de un día para una cancha. */
  upsertHorario(body: BodyCreateHorario) {
    return this.http.post(this.apiUrl, body, { headers: this.getHeaders() });
  }

  /** DELETE /horarios/:id — soft delete: marca activo: false. */
  deleteHorario(id: string) {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }
}
