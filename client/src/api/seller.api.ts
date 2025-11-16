// src/api/seller.api.ts
import { api } from './index';

// Product interfaces
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  images: string[];
  status: 'active' | 'inactive' | 'out_of_stock';
  created_at: string;
  updatedAt: string;
}

export interface CreateProductData {
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  images?: string[];
}

export interface UpdateProductData extends Partial<CreateProductData> {
  status?: 'active' | 'inactive' | 'out_of_stock';
}

// Order interfaces
export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled';
  deliveryAddress: string;
  deliveryPhone: string;
  assignedDeliveryPerson?: {
    id: string;
    name: string;
    phone: string;
  };
  created_at: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

export interface AcceptOrderPayload {
  estimatedPreparationTime?: number; // in minutes
  notes?: string;
}

export interface UpdateOrderStatusPayload {
  status: Order['status'];
  notes?: string;
}

export interface AssignDeliveryPayload {
  deliveryPersonId: string;
  estimatedDeliveryTime?: number; // in minutes
  notes?: string;
}

// Dashboard interfaces
export interface SellerDashboard {
  stats: {
    totalOrders: number;
    totalRevenue: number;
    pendingOrders: number;
    activeProducts: number;
    todayOrders: number;
    todayRevenue: number;
  };
  recentOrders: Order[];
  topProducts: {
    productId: string;
    productName: string;
    totalSold: number;
    revenue: number;
  }[];
  ordersByStatus: {
    status: Order['status'];
    count: number;
  }[];
}

// API Responses
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  message: string;
}

export interface DeliveryPerson {
  id: string;
  name: string;
  phone: string;
  email: string;
  isAvailable: boolean;
  currentOrders?: number;
}

// Seller API functions
export const sellerApi = {
  // Get seller dashboard data
  getDashboard: async (): Promise<ApiResponse<SellerDashboard>> => {
    const response = await api.get<ApiResponse<SellerDashboard>>('/sellers/dashboard');
    return response;
  },

  // Get seller products
  getProducts: async (params?: {
    page?: number;
    limit?: number;
    category?: string;
    status?: Product['status'];
    search?: string;
  }): Promise<PaginatedResponse<Product>> => {
    const response = await api.get<PaginatedResponse<Product>>('/sellers/products', { params });
    return response;
  },

  // Create new product
  createProduct: async (productData: CreateProductData): Promise<ApiResponse<Product>> => {
    const response = await api.post<ApiResponse<Product>>('/sellers/products', productData);
    return response;
  },

  // Update existing product
  updateProduct: async (productId: string, productData: UpdateProductData): Promise<ApiResponse<Product>> => {
    const response = await api.put<ApiResponse<Product>>(`/sellers/products/${productId}`, productData);
    return response;
  },

  // Delete product
  deleteProduct: async (productId: string): Promise<ApiResponse<{ success: boolean }>> => {
    const response = await api.delete<ApiResponse<{ success: boolean }>>(`/sellers/products/${productId}`);
    return response;
  },

  // Get seller orders
  getOrders: async (params?: {
    page?: number;
    limit?: number;
    status?: Order['status'];
    startDate?: string;
    endDate?: string;
    search?: string;
  }): Promise<PaginatedResponse<Order>> => {
    const response = await api.get<PaginatedResponse<Order>>('/sellers/orders', { params });
    return response;
  },

  // Accept order
  acceptOrder: async (orderId: string, payload: AcceptOrderPayload): Promise<ApiResponse<Order>> => {
    const response = await api.post<ApiResponse<Order>>(`/sellers/orders/${orderId}/accept`, payload);
    return response;
  },

  // Update order status
  updateOrderStatus: async (orderId: string, payload: UpdateOrderStatusPayload): Promise<ApiResponse<Order>> => {
    const response = await api.put<ApiResponse<Order>>(`/sellers/orders/${orderId}/status`, payload);
    return response;
  },

  // Assign delivery person
  assignDelivery: async (orderId: string, payload: AssignDeliveryPayload): Promise<ApiResponse<Order>> => {
    const response = await api.post<ApiResponse<Order>>(`/sellers/orders/${orderId}/assign-delivery`, payload);
    return response;
  },

  // Get available delivery persons
  getAvailableDeliveryPersons: async (): Promise<ApiResponse<DeliveryPerson[]>> => {
    const response = await api.get<ApiResponse<DeliveryPerson[]>>('/sellers/delivery-persons/available');
    return response;
  },

  // Get order details
  getOrderDetails: async (orderId: string): Promise<ApiResponse<Order>> => {
    const response = await api.get<ApiResponse<Order>>(`/sellers/orders/${orderId}`);
    return response;
  },

  // Upload product images
  uploadProductImages: async (files: File[]): Promise<ApiResponse<{ urls: string[] }>> => {
    const formData = new FormData();
    files.forEach((file) => formData.append('images', file));

    const response = await api.post<ApiResponse<{ urls: string[] }>>('/sellers/products/upload-images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  },

  // Get product categories
  getCategories: async (): Promise<ApiResponse<{ name: string; count: number }[]>> => {
    const response = await api.get<ApiResponse<{ name: string; count: number }[]>>('/sellers/categories');
    return response;
  },

  // Get order statistics
  getOrderStats: async (params?: {
    startDate?: string;
    endDate?: string;
    groupBy?: 'day' | 'week' | 'month';
  }): Promise<ApiResponse<{
    totalOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    ordersByStatus: { status: Order['status']; count: number }[];
    revenueOverTime: { date: string; revenue: number; orders: number }[];
  }>> => {
    const response = await api.get<ApiResponse<any>>('/sellers/orders/stats', { params });
    return response;
  },
};