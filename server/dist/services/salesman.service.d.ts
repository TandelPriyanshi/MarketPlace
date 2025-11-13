import { Salesman } from '../models/salesman.model';
import { Beat } from '../models/beat.model';
import { Store } from '../models/store.model';
import { Visit } from '../models/visit.model';
import { CreateVisitDto, UpdateVisitDto, RecordAttendanceDto, PerformanceQueryDto, CreateBeatDto } from '../dto/salesman.dto';
export declare class SalesmanService {
    private salesmanModel;
    private beatModel;
    private storeModel;
    private visitModel;
    constructor(salesmanModel: typeof Salesman, beatModel: typeof Beat, storeModel: typeof Store, visitModel: typeof Visit);
    getSalesmanBeats(salesmanId: string): Promise<Beat[]>;
    createBeat(salesmanId: string, createBeatDto: CreateBeatDto): Promise<Beat | null>;
    logVisit(salesmanId: string, createVisitDto: CreateVisitDto): Promise<Visit>;
    updateVisit(visitId: string, salesmanId: string, updateVisitDto: UpdateVisitDto): Promise<Visit>;
    recordAttendance(salesmanId: string, attendanceData: RecordAttendanceDto): Promise<[affectedCount: number, affectedRows: Salesman[]]>;
    getPerformanceMetrics(salesmanId: string, query: PerformanceQueryDto): Promise<{
        period: {
            start: Date;
            end: Date;
        };
        visits: Visit;
        beats: {
            total: number;
            completed: number;
            completionRate: number;
        };
    }>;
}
//# sourceMappingURL=salesman.service.d.ts.map