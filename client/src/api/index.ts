// src/api/index.ts
export { default as axiosInstance } from './axiosInstance';
export { api } from './axiosInstance';
export type { ApiResponse, PaginatedResponse, ApiError } from './axiosInstance';

// Export API services
export * from './auth.api';
export * from './seller.api';
export * from './product.api';
export type { Order as OrderType, OrderItem, OrderStatus, UpdateOrderStatusPayload } from './order.api';
export { placeOrder, getOrderDetails, getCustomerOrders, getSellerOrders, updateOrderStatus, cancelOrder } from './order.api';
export * from './delivery.api';
export * from './notification.api';

// Re-export for easy importing
export { authApi } from './auth.api';
export { sellerApi } from './seller.api';
