export interface BodyCreateHorario {
  canchaId: string;
  diaSemana: number;
  horaApertura: string;
  horaCierre: string;
  activo: boolean;
}

export interface Horario extends BodyCreateHorario {
  id: string;
  cancha?: { id: string; nombreCancha: string };
  createdAt: string;
  updatedAt: string;
}

export interface HorariosResponse {
  data: {
    horarios:   Horario[];
    total:      number;
    page:       number;
    totalPages: number;
    limit:      number;
  };
  message: string;
}
