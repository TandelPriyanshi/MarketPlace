import axiosInstance from './axiosInstance';

// Product interfaces matching backend DTOs
export interface ProductApi {
  id: string;
  sellerId: string;
  name: string;
  sku?: string;
  description?: string;
  price: number;
  stock: number;
  status: 'draft' | 'published' | 'archived' | 'out_of_stock';
  createdAt: string;
  updatedAt: string;
}

export interface ProductListResponse {
  products: ProductApi[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface CreateProductPayload {
  name: string;
  sku?: string;
  description?: string;
  price: number;
  stock: number;
  status?: 'draft' | 'published' | 'archived' | 'out_of_stock';
}

export interface UpdateProductPayload {
  name?: string;
  sku?: string;
  description?: string;
  price?: number;
  stock?: number;
  status?: 'draft' | 'published' | 'archived' | 'out_of_stock';
}

// Get all products for the authenticated seller
export const listProductsBySeller = async (params?: {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
}): Promise<ProductListResponse> => {
  const response = await axiosInstance.get('/products', { params });
  return response.data.data;
};

// Get a single product by ID
export const getProduct = async (productId: string): Promise<ProductApi> => {
  const response = await axiosInstance.get(`/products/${productId}`);
  return response.data.data;
};

// Create a new product
export const createProduct = async (payload: CreateProductPayload): Promise<ProductApi> => {
  const response = await axiosInstance.post('/products', payload);
  return response.data.data;
};

// Update an existing product
export const updateProduct = async (id: string, payload: UpdateProductPayload): Promise<ProductApi> => {
  const response = await axiosInstance.put(`/products/${id}`, payload);
  return response.data.data;
};

// Delete a product
export const deleteProduct = async (id: string): Promise<void> => {
  await axiosInstance.delete(`/products/${id}`);
};

// Get all published products for customers
export const getAllProducts = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
}): Promise<ProductListResponse> => {
  const response = await axiosInstance.get('/products/all', { params });
  return response.data.data;
};
