import { Request, Response, NextFunction } from 'express';
export declare class AppError extends Error {
    statusCode: number;
    isOperational: boolean;
    errors?: any[];
    constructor(message: string, statusCode?: number, errors?: any[], isOperational?: boolean, stack?: string);
}
export declare const errorHandler: (err: any, req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>>;
export declare const setServerInstance: (srv: any) => void;
export declare const notFoundHandler: (req: Request, res: Response, next: NextFunction) => void;
export declare const handleJWTError: () => AppError;
export declare const handleJWTExpiredError: () => AppError;
export declare const handleCastErrorDB: (err: any) => AppError;
export declare const handleDuplicateFieldsDB: (err: any) => AppError;
export declare const handleValidationErrorDB: (err: any) => AppError;
//# sourceMappingURL=error-handler.d.ts.map