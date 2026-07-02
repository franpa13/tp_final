export type UserRole = 'ADMIN' | 'SUPERADMIN' | 'CLIENTE';

export interface User {
  id: number;
  name: string;
  email: string;
  type: UserRole;
  telefono?: string;
}
