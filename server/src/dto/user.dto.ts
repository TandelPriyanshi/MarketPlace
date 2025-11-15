import { UserRole } from '../types/roles.enum';

export interface UserResponseDto {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateUserDto {
  email: string;
  password: string;
  name: string;
  phone: string;
  role?: UserRole;
}

export interface UpdateUserDto {
  name?: string;
  phone?: string;
  isActive?: boolean;
}

export interface UserListResponseDto {
  users: UserResponseDto[];
  pagination: {
    total: number;
    page: number;
    totalPages: number;
    limit: number;
  };
}

