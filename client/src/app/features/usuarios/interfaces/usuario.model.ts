export type UserRole = 'ADMIN' | 'SUPERADMIN' | 'CLIENTE';

export interface BodyCreateUser {
  name: string;
  email: string;
  password: string;
  telefono?: string;
  // No se envía al crear: el backend siempre lo asume CLIENTE por defecto.
  // Un SUPERADMIN cambia el rol después vía BodyUpdateUser.
  type?: UserRole;
}

export interface BodyUpdateUser {
  name: string;
  type: UserRole;
}

export interface Usuario {
  id: string;
  name: string;
  email: string;
  type: UserRole;
  telefono?: string;
  estado: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UsuariosResponse {
  data: {
    users:      Usuario[];
    total:      number;
    page:       number;
    totalPages: number;
    limit:      number;
  };
  message: string;
}
