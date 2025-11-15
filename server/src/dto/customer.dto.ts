import { OrderResponseDto } from './order.dto';
import { ComplaintResponseDto } from './complaint.dto';

export interface SellerFilterDto {
  city?: string;
  area?: string;
  pincode?: string;
}

export interface SellerResponseDto {
  id: string;
  userId: string;
  businessName: string;
  businessDescription?: string;
  businessAddress?: string;
  businessPhone?: string;
  businessEmail?: string;
  status: string;
  rating?: number;
  totalSales?: number;
  user?: {
    id: string;
    name?: string;
    email: string;
    phone?: string;
  };
}

export interface CustomerOrderResponseDto {
  order: OrderResponseDto;
}

export interface CustomerComplaintResponseDto {
  complaint: ComplaintResponseDto;
}

