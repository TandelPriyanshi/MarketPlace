import { Model } from 'sequelize-typescript';
import { Order } from './order.model';
import { User } from './user.model';
export declare class Attachment extends Model {
    id: string;
    orderId: string;
    uploadedById: string;
    fileName: string;
    filePath: string;
    mimeType: string;
    type: 'signature' | 'delivery_proof' | 'return_proof';
    notes?: string;
    order: Order;
    uploadedBy: User;
    createdAt: Date;
    updatedAt: Date;
}
//# sourceMappingURL=attachment.model.d.ts.map