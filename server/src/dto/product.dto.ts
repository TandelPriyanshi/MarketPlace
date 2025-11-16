import { ProductStatus } from '../models/product.model';

export interface CreateProductDto {
  name: string;
  sku?: string;
  description?: string;
  price: number;
  stock: number;
  images?: string[];
  status?: ProductStatus;
  metadata?: Record<string, any>;
}

export interface UpdateProductDto {
  name?: string;
  sku?: string;
  description?: string;
  price?: number;
  stock?: number;
  images?: string[];
  status?: ProductStatus;
  metadata?: Record<string, any>;
}

export interface ProductResponseDto {
  id: string;
  sellerId: string;
  name: string;
  sku?: string;
  description?: string;
  price: number;
  stock: number;
  images?: string[];
  status: ProductStatus;
  metadata?: Record<string, any>;
  created_at: Date;
  updatedAt: Date;
}

export interface ProductListResponseDto {
  products: ProductResponseDto[];
  pagination: {
    total: number;
    page: number;
    totalPages: number;
    limit: number;
  };
}

