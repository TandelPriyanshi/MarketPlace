import { Request, Response } from 'express';
export declare class CustomerController {
    getSellers(req: Request, res: Response): Promise<void>;
    placeOrder(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getOrderDetails(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    createComplaint(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getComplaints(req: Request, res: Response): Promise<void>;
}
export declare const customerController: CustomerController;
//# sourceMappingURL=customer.controller.d.ts.map