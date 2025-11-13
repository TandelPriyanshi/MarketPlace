import { Request } from 'express';
import { SalesmanService } from '../services/salesman.service';
import { CreateVisitDto, UpdateVisitDto, RecordAttendanceDto, PerformanceQueryDto, CreateBeatDto } from '../dto/salesman.dto';
interface AuthenticatedRequest extends Request {
    user: {
        id: string;
    };
}
export declare class SalesmanController {
    private readonly salesmanService;
    constructor(salesmanService: SalesmanService);
    getBeats(req: AuthenticatedRequest): Promise<import("../models/beat.model").Beat[]>;
    createBeat(req: AuthenticatedRequest, createBeatDto: CreateBeatDto): Promise<import("../models/beat.model").Beat | null>;
    logVisit(req: AuthenticatedRequest, createVisitDto: CreateVisitDto): Promise<import("../models/visit.model").Visit>;
    updateVisit(req: AuthenticatedRequest, visitId: string, updateVisitDto: UpdateVisitDto): Promise<import("../models/visit.model").Visit>;
    recordAttendance(req: AuthenticatedRequest, attendanceData: RecordAttendanceDto): Promise<[affectedCount: number, affectedRows: import("../models/salesman.model").Salesman[]]>;
    getPerformance(req: AuthenticatedRequest, query: PerformanceQueryDto): Promise<{
        period: {
            start: Date;
            end: Date;
        };
        visits: import("../models/visit.model").Visit;
        beats: {
            total: number;
            completed: number;
            completionRate: number;
        };
    }>;
}
export {};
//# sourceMappingURL=salesman.controller.d.ts.map