import axiosInstance from './axiosInstance';

// Order Status enum matching backend
export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
  RETURN_REQUESTED = 'return_requested',
  RETURN_APPROVED = 'return_approved',
  RETURN_REJECTED = 'return_rejected',
  RETURN_COMPLETED = 'return_completed'
}

// Order interfaces
export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  productImage?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  product?: {
    id: string;
    name: string;
    sku?: string;
    images: string[];
  };
}

export interface Order {
  id: string;
  customerId: string;
  sellerId: string;
  customer?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  seller?: {
    id: string;
    businessName?: string;
    email: string;
  };
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shippingCost: number;
  discount: number;
  totalAmount: number;
  currency: string;
  status: OrderStatus;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod?: string;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  trackingNumber?: string;
  estimatedDelivery?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PlaceOrderPayload {
  items: {
    productId: string;
    quantity: number;
  }[];
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentMethod: string;
  notes?: string;
}

export interface UpdateOrderStatusPayload {
  status: OrderStatus;
  notes?: string;
  trackingNumber?: string;
  estimatedDelivery?: string;
}

export interface OrderListResponse {
  orders: Order[];
  pagination: {
    total: number;
    page: number;
    totalPages: number;
    limit: number;
  };
}

// API functions
export const placeOrder = async (payload: PlaceOrderPayload): Promise<Order> => {
  const response = await axiosInstance.post('/orders', payload);
  return response.data;
};

export const getOrderDetails = async (orderId: string): Promise<Order> => {
  const response = await axiosInstance.get(`/orders/${orderId}`);
  return response.data;
};

export const getCustomerOrders = async (params?: {
  page?: number;
  limit?: number;
  status?: OrderStatus;
  startDate?: string;
  endDate?: string;
  search?: string;
}): Promise<OrderListResponse> => {
  const response = await axiosInstance.get('/orders/customer', { params });
  return response.data;
};

export const getSellerOrders = async (params?: {
  page?: number;
  limit?: number;
  status?: OrderStatus;
  startDate?: string;
  endDate?: string;
  search?: string;
}): Promise<OrderListResponse> => {
  const response = await axiosInstance.get('/sellers/orders', { params });
  return response.data;
};

export const updateOrderStatus = async (orderId: string, payload: UpdateOrderStatusPayload): Promise<Order> => {
  const response = await axiosInstance.put(`/orders/${orderId}/status`, payload);
  return response.data;
};

// Additional helper functions
export const cancelOrder = async (orderId: string, reason?: string): Promise<Order> => {
  return updateOrderStatus(orderId, { 
    status: OrderStatus.CANCELLED, 
    notes: reason 
  });
};

export const confirmOrder = async (orderId: string): Promise<Order> => {
  return updateOrderStatus(orderId, { status: OrderStatus.CONFIRMED });
};

export const shipOrder = async (orderId: string, trackingNumber: string, estimatedDelivery?: string): Promise<Order> => {
  return updateOrderStatus(orderId, { 
    status: OrderStatus.SHIPPED, 
    trackingNumber,
    estimatedDelivery 
  });
};

export const deliverOrder = async (orderId: string): Promise<Order> => {
  return updateOrderStatus(orderId, { status: OrderStatus.DELIVERED });
};

export const completeOrder = async (orderId: string): Promise<Order> => {
  return updateOrderStatus(orderId, { status: OrderStatus.COMPLETED });
};
