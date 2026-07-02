// Cada interfaz de acá refleja el `data` que devuelve un endpoint de
// /api/estadisticas/* (ver estadisticas.controller.js en el backend).
// dashboard.component.ts las transforma en {labels, datasets} para Chart.js.

export interface ReservaPorEstado {
  estado: string;
  total: number;
}

export interface IngresoPorMes {
  mes: string; // 'YYYY-MM'
  total: number;
}

export interface CanchaMasReservada {
  canchaId: string;
  nombreCancha: string;
  total: number;
}

export interface MetodoPagoStat {
  metodoPago: string;
  total: number;
}

/** Envoltorio común {data, message} de todos los endpoints de estadísticas; T es la fila (ej. ReservaPorEstado). */
export interface EstadisticaResponse<T> {
  data: T[];
  message: string;
}
