import { Model } from 'sequelize-typescript';
import { User } from './user.model';
import { Product } from './product.model';
export declare enum DeliveryStatus {
    PENDING = "pending",
    ASSIGNED = "assigned",
    PICKED_UP = "picked_up",
    OUT_FOR_DELIVERY = "out_for_delivery",
    DELIVERED = "delivered",
    RETURNED = "returned",
    CANCELLED = "cancelled"
}
export declare enum PaymentStatus {
    PENDING = "pending",
    PAID = "paid",
    FAILED = "failed",
    REFUNDED = "refunded",
    PARTIALLY_REFUNDED = "partially_refunded"
}
export declare enum OrderStatus {
    PENDING = "pending",
    CONFIRMED = "confirmed",
    PROCESSING = "processing",
    SHIPPED = "shipped",
    DELIVERED = "delivered",
    COMPLETED = "completed",
    CANCELLED = "cancelled",
    REFUNDED = "refunded"
}
export declare class Order extends Model {
    id: string;
    userId: string;
    orderNumber: string;
    totalAmount: number;
    deliveryStatus: DeliveryStatus;
    paymentStatus: PaymentStatus;
    status: OrderStatus;
    isCancelled: boolean;
    shippingAddress?: string;
    billingAddress?: string;
    metadata: Record<string, unknown>;
    user?: User;
    items?: OrderItem[];
    created_at?: Date;
    updatedAt?: Date;
}
export declare class OrderItem extends Model {
    id: string;
    orderId?: string;
    productId?: string;
    sellerId?: string;
    quantity: number;
    price: number;
    status: OrderStatus;
    isCancelled: boolean;
    cancellationReason?: string;
    order?: Order;
    product?: Product;
    seller?: User;
    created_at?: Date;
    updatedAt?: Date;
}
//# sourceMappingURL=order.model.d.ts.map