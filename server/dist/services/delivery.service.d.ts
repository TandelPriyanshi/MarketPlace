import { Order, DeliveryStatus } from '../models/order.model';
import { Attachment } from '../models/attachment.model';
declare class DeliveryService {
    getAssignedOrders(deliveryPersonId: string, status?: DeliveryStatus): Promise<Order[]>;
    updateDeliveryStatus(orderId: string, deliveryPersonId: string, status: DeliveryStatus, notes?: string): Promise<Order>;
    uploadDeliveryProof(orderId: string, deliveryPersonId: string, file: Express.Multer.File, type: 'signature' | 'delivery_proof' | 'return_proof', notes?: string): Promise<Attachment>;
    getTodaysRoute(deliveryPersonId: string): Promise<Order[]>;
    private validateDeliveryStatusTransition;
}
declare const _default: DeliveryService;
export default _default;
//# sourceMappingURL=delivery.service.d.ts.map