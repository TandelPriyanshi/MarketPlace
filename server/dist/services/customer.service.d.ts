import { User } from '../models/user.model';
import { Order } from '../models/order.model';
import { Complaint } from '../models/complaint.model';
declare class CustomerService {
    getSellers(filters: {
        city?: string;
        area?: string;
        pincode?: string;
    }): Promise<User[]>;
    placeOrder(userId: string, orderData: any): Promise<Order>;
    getOrderDetails(userId: string, orderId: string): Promise<Order>;
    createComplaint(userId: string, complaintData: any, files?: Express.Multer.File[]): Promise<Complaint>;
    getUserComplaints(userId: string, filters?: {
        status?: string;
    }): Promise<Complaint[]>;
}
export declare const customerService: CustomerService;
export {};
//# sourceMappingURL=customer.service.d.ts.map