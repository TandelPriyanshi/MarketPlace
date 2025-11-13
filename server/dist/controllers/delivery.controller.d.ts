import { Request, Response } from 'express';
declare class DeliveryController {
    getAssignedOrders(req: Request, res: Response): Promise<void>;
    updateDeliveryStatus(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    uploadDeliveryProof(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getTodaysRoute(req: Request, res: Response): Promise<void>;
}
declare const _default: DeliveryController;
export default _default;
//# sourceMappingURL=delivery.controller.d.ts.map