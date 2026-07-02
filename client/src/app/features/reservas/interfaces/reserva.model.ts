export type EstadoReserva = 'pendiente' | 'confirmada' | 'cancelada' | 'finalizada';

export interface BodyCreateReserva {
  canchaId: string;
  // Requeridos cuando la carga un admin para un cliente externo.
  // Un usuario CLIENTE no los envía: el backend los completa con su propio perfil.
  nombreCliente?: string;
  telefonoCliente?: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
}

export interface Reserva extends BodyCreateReserva {
  id: string;
  creadoPor: string;
  clienteId?: string | null;
  estado: EstadoReserva;
  cancha?: { id: string; nombreCancha: string; type: string; precio: number };
  admin?: { id: string; name: string };
  cliente?: { id: string; name: string };
  createdAt: string;
  updatedAt: string;
}

export interface ReservasResponse {
  data: {
    reservas:   Reserva[];
    total:      number;
    page:       number;
    totalPages: number;
    limit:      number;
  };
  message: string;
}
