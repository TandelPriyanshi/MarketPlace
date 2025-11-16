import { Model } from 'sequelize-typescript';
import { User } from './user.model';
import { Order } from './order.model';
export declare enum ComplaintStatus {
    OPEN = "open",
    IN_PROGRESS = "in_progress",
    RESOLVED = "resolved",
    REJECTED = "rejected",
    CLOSED = "closed"
}
export declare enum ComplaintType {
    ORDER_ISSUE = "order_issue",
    DELIVERY_ISSUE = "delivery_issue",
    PRODUCT_QUALITY = "product_quality",
    SELLER_BEHAVIOR = "seller_behavior",
    PAYMENT_ISSUE = "payment_issue",
    OTHER = "other"
}
export declare class Complaint extends Model {
    id: string;
    userId: string;
    orderId?: string;
    type: ComplaintType;
    title: string;
    description: string;
    status: ComplaintStatus;
    attachments: string[];
    resolutionNotes?: string;
    resolvedById?: string;
    resolvedAt?: Date;
    user?: User;
    order?: Order;
    resolvedBy?: User;
    created_at: Date;
    updatedAt: Date;
}
export declare function setupComplaintAssociations(): void;
//# sourceMappingURL=complaint.model.d.ts.map