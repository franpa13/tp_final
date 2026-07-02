import { User } from '../../usuarios/models/user.model';
// LOGIN
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  data: {
    token: string;
    user: User;
  };
  message: string;
}


// REGISTER
// Siempre crea un usuario CLIENTE (el backend lo asume por defecto si se omite `type`).
export interface RegisterUser {
  email: string,
  name: string,
  password: string,
  telefono?: string,
}
export interface RegisterResponse {
  data: User;
  message: string;
}
