export interface UserResponse {
    data: DataUser;
    message: string;
}

export interface DataUser {
    id: string;
    type: string;
    name: string;
    email: string;
    telefono: string;
    estado: boolean;
    createdAt: Date;
    updatedAt: Date;
}
