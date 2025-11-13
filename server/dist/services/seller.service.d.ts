import { Product } from '../models/product.model';
import { OrderItem, OrderStatus } from '../models/order.model';
declare class SellerService {
    getSellerProducts(sellerId: string, { page, limit, status }: {
        page?: number;
        limit?: number;
        status?: string;
    }): Promise<{
        products: Product[];
        pagination: {
            total: number;
            page: number;
            totalPages: number;
            limit: number;
        };
    }>;
    createProduct(sellerId: string, productData: Partial<Product>): Promise<Product>;
    updateProduct(sellerId: string, productId: string, productData: Partial<Product>): Promise<Product | null>;
    deleteProduct(sellerId: string, productId: string): Promise<{
        success: boolean;
    }>;
    getSellerOrders(sellerId: string, { page, limit, status }: {
        page?: number;
        limit?: number;
        status?: string;
    }): Promise<{
        orders: OrderItem[];
        pagination: {
            total: number;
            page: number;
            totalPages: number;
            limit: number;
        };
    }>;
    updateOrderStatus(sellerId: string, orderItemId: string, status: OrderStatus, reason?: string): Promise<OrderItem | null>;
    getSellerDashboard(sellerId: string): Promise<{
        stats: {
            totalProducts: number;
            totalOrders: number;
            totalRevenue: number;
            productStatus: Product[];
        };
        recentOrders: OrderItem[];
    }>;
    private validateStatusTransition;
}
declare const _default: SellerService;
export default _default;
//# sourceMappingURL=seller.service.d.ts.map