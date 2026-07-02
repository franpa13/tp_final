/**
 * Tipos del feature de EJEMPLO "productos". Plantilla de referencia: para un
 * modelo nuevo, cloná este archivo cambiando los campos por los que
 * correspondan (ver también producto.controller.js del lado del backend,
 * que es de donde salen exactamente estos mismos nombres de campo).
 *
 * Regla del proyecto: acá solo van tipos/interfaces (sin @angular/*, sin
 * HTTP) — la lógica de red vive en services/productos.service.ts.
 */

/** Body que espera el backend para crear o editar un producto. */
export interface BodyProducto {
  nombre: string;
  descripcion?: string;
  precio: number;
  stock: number;
}

/** Producto tal como lo devuelve el backend, con los campos generados por la base. */
export interface Producto extends BodyProducto {
  id: string;
  estado: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Forma de la respuesta de GET /productos y GET /productos/:id. Sin paginado a propósito. */
export interface ProductosResponse {
  data: Producto[];
  message: string;
}

/** Forma de la respuesta de POST/PUT /productos (un solo producto, no un array). */
export interface ProductoResponse {
  data: Producto;
  message: string;
}
