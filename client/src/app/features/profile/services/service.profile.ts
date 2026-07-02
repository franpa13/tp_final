import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { AuthService } from '../../auth/services/auth.service';
import { environment } from '../../../../environments/environment';
import { UserResponse } from '../interfaces/get-profile';

@Injectable({
  providedIn: 'root',
})
export class ServiceProfile {
  private readonly http = inject(HttpClient)
  private readonly authService = inject(AuthService);
  private readonly apiUrl = `${environment.apiUrl}/users/user`;
  private getHeaders(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${this.authService.getToken()}` });
  }
  getUserById(id?: string) {
    return this.http.get<UserResponse>(`${this.apiUrl}/${id}`,{ headers: this.getHeaders() })
  }
}
