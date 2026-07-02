/**
 * Tipos del dominio de canchas.
 * Solo contiene interfaces de datos — sin lógica, sin Angular, sin HTTP.
 *
 * Regla: si necesitás importar algo de @angular/* aquí, ese tipo no pertenece a este archivo.
 */

/** Payload para crear una cancha nueva. Refleja exactamente lo que espera el backend. */
export interface BodyCreateCancha {
  type: 'FUT-5' | 'FUT-7' | 'FUT-9';
  nombreCancha: string;
  numberCancha: number;
  horaApertura: string; // formato esperado por Postgres: "HH:MM:SS"
  horaCierre: string;   // formato esperado por Postgres: "HH:MM:SS"
  precio: number;
}

/** Cancha tal como la devuelve el backend, con campos generados por la base de datos. */
export interface Cancha extends BodyCreateCancha {
  id: string;
  disponible: boolean;
  estado: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Forma de la respuesta del endpoint GET /canchas */
export interface CanchasResponse {
  data: {
    canchas:    Cancha[];
    total:      number;
    page:       number;
    totalPages: number;
    limit:      number;
  };
  message: string;
}
