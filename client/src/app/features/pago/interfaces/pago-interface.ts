export interface ResponsePagos {
    data:    Data;
    message: string;
}

export interface Data {
    pagos:      PagoInterface[];
    total:      number;
    page:       number;
    totalPages: number;
    limit:      number;
}

export interface PagoInterface {
    id:          string;
    reservaId:   string;
    monto:       string;
    metodoPago:  string;
    mpPaymentId: null;
    estado:      string;
    createdAt:   Date;
    updatedAt:   Date;
    reserva:     Reserva;
}

export interface Reserva {
    id:              string;
    canchaId:        string;
    creadoPor:       string;
    nombreCliente:   string;
    telefonoCliente: string;
    fecha:           Date;
    horaInicio:      string;
    horaFin:         string;
    estado:          string;
    createdAt:       Date;
    updatedAt:       Date;
    cancha:          Cancha;
    admin:           Admin;
}

export interface Admin {
    id:    string;
    name:  string;
    email: string;
}

export interface Cancha {
    id:           string;
    nombreCancha: string;
    type:         string;
}

export type MetodoPago  ="efectivo" | "transferencia" | "tarjeta"

export interface BodyCreatePago {
  reservaId: string;
  monto: number;
  metodoPago: MetodoPago;
}

export interface PreferenciaResponse {
  data: { init_point: string };
  message: string;
}
