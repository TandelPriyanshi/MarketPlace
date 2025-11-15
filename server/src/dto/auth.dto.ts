import { UserRole } from '../types/roles.enum';

export interface RegisterRequestDto {
  email: string;
  password: string;
  name: string;
  phone: string;
  role?: UserRole;
}

export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface AuthResponseDto {
  user: {
    id: string;
    email: string;
    name?: string;
    phone?: string;
    role: UserRole;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  };
  token: string;
}

