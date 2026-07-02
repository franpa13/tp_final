/**
 * Servicio HTTP del feature de EJEMPLO "productos".
 *
 * Responsabilidad única: hablar con el backend (`/api/productos`). Los
 * componentes nunca llaman a HttpClient directamente — siempre pasan por acá.
 *
 * Nota: el backend de productos (ver producto.routes.js) NO exige token
 * todavía. Igual mandamos el header Authorization por consistencia con el
 * resto del proyecto: si más adelante se le agrega `authRequired`, este
 * service ya está listo sin tener que tocarlo.
 */
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../auth/services/auth.service';
import { BodyProducto, ProductoResponse, ProductosResponse } from '../interfaces/producto.model';

@Injectable({ providedIn: 'root' })
export class ProductosService {
  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);
  private readonly apiUrl = `${environment.apiUrl}/productos`;

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${this.authService.getToken()}` });
  }

  /** GET /productos — trae todos los productos activos (sin paginado). */
  getProductos() {
    return this.http.get<ProductosResponse>(this.apiUrl, { headers: this.getHeaders() });
  }

  /** GET /productos/:id — trae un producto puntual. */
  getProductoById(id: string) {
    return this.http.get<ProductoResponse>(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }

  /** POST /productos — crea un producto nuevo. */
  createProducto(body: BodyProducto) {
    return this.http.post<ProductoResponse>(this.apiUrl, body, { headers: this.getHeaders() });
  }

  /** PUT /productos/:id — actualiza un producto existente. */
  updateProducto(id: string, body: BodyProducto) {
    return this.http.put<ProductoResponse>(`${this.apiUrl}/${id}`, body, { headers: this.getHeaders() });
  }

  /** DELETE /productos/:id — soft delete: marca estado: false en el backend. */
  deleteProducto(id: string) {
    return this.http.delete(`${this.apiUrl}/${id}`, { headers: this.getHeaders() });
  }
}
