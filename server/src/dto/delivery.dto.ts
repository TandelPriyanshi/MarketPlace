import { DeliveryStatus, OrderStatus } from '../models/order.model';

export interface DeliveryAssignmentDto {
  orderId: string;
  deliveryPersonId: string;
}

export interface UpdateDeliveryStatusDto {
  status: DeliveryStatus;
  notes?: string;
  proofFiles?: string[];
}

export interface DeliveryOrderResponseDto {
  id: string;
  orderId: string;
  orderNumber: string;
  userId: string;
  deliveryPersonId?: string;
  status: OrderStatus;
  deliveryStatus: DeliveryStatus;
  totalAmount: number;
  shippingAddress?: string;
  customer?: {
    id: string;
    name?: string;
    phone?: string;
  };
  items: Array<{
    id: string;
    productId: string;
    productName: string;
    quantity: number;
    price: number;
  }>;
  created_at: Date;
  updatedAt: Date;
}

export interface DeliveryListResponseDto {
  orders: DeliveryOrderResponseDto[];
  pagination: {
    total: number;
    page: number;
    totalPages: number;
    limit: number;
  };
}

