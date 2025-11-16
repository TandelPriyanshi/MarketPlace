import { OrderStatus, PaymentStatus, DeliveryStatus } from '../models/order.model';

export interface OrderItemDto {
  productId: string;
  quantity: number;
  price: number;
}

export interface CreateOrderDto {
  items: OrderItemDto[];
  shippingAddress: string;
  billingAddress?: string;
  metadata?: Record<string, any>;
}

export interface UpdateOrderStatusDto {
  status: OrderStatus;
  reason?: string;
}

export interface OrderResponseDto {
  id: string;
  userId: string;
  orderNumber: string;
  totalAmount: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  deliveryStatus: DeliveryStatus;
  shippingAddress?: string;
  billingAddress?: string;
  metadata?: Record<string, any>;
  items: OrderItemResponseDto[];
  created_at: Date;
  updatedAt: Date;
}

export interface OrderItemResponseDto {
  id: string;
  orderId: string;
  productId: string;
  sellerId: string;
  quantity: number;
  price: number;
  status: OrderStatus;
  product?: {
    id: string;
    name: string;
    images?: string[];
  };
  seller?: {
    id: string;
    businessName: string;
  };
}

export interface OrderListResponseDto {
  orders: OrderResponseDto[];
  pagination: {
    total: number;
    page: number;
    totalPages: number;
    limit: number;
  };
}

