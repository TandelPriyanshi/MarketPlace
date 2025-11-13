import { Request, Response, NextFunction } from 'express';
export declare const notFoundHandler: (req: Request, res: Response, next: NextFunction) => void;
interface HttpException extends Error {
    status?: number;
    statusCode?: number;
    message: string;
    stack?: string;
}
export declare const errorHandler: (error: HttpException, req: Request, res: Response, next: NextFunction) => void;
export {};
//# sourceMappingURL=error.middleware.d.ts.map