import { SellerStatus } from '../models/seller.model';

export interface SellerResponseDto {
  id: string;
  userId: string;
  businessName: string;
  businessDescription?: string;
  businessAddress?: string;
  businessPhone?: string;
  businessEmail?: string;
  taxId?: string;
  status: SellerStatus;
  rating?: number;
  totalSales?: number;
  user?: {
    id: string;
    name?: string;
    email: string;
    phone?: string;
  };
  created_at: Date;
  updatedAt: Date;
}

export interface CreateSellerDto {
  userId: string;
  businessName: string;
  businessDescription?: string;
  businessAddress?: string;
  businessPhone?: string;
  businessEmail?: string;
  taxId?: string;
}

export interface UpdateSellerDto {
  businessName?: string;
  businessDescription?: string;
  businessAddress?: string;
  businessPhone?: string;
  businessEmail?: string;
  taxId?: string;
  status?: SellerStatus;
}

export interface SellerListResponseDto {
  sellers: SellerResponseDto[];
  pagination: {
    total: number;
    page: number;
    totalPages: number;
    limit: number;
  };
}

