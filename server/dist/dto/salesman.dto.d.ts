export declare class LocationDto {
    latitude: number;
    longitude: number;
    address: string;
}
export declare class CheckInOutDto {
    timestamp: Date;
    location: LocationDto;
    imageUrl?: string;
    summary?: string;
}
export declare class CreateVisitDto {
    storeId: string;
    scheduledAt: Date;
    purpose?: string;
}
export declare class UpdateVisitDto {
    status?: string;
    checkIn?: CheckInOutDto;
    checkOut?: CheckInOutDto;
    remarks?: string;
    startedAt?: Date;
    completedAt?: Date;
}
export declare class RecordAttendanceDto {
    timestamp: Date;
    location: LocationDto;
    imageUrl?: string;
}
export declare class PerformanceQueryDto {
    period?: string;
    startDate?: string;
    endDate?: string;
}
export declare class CreateBeatDto {
    name: string;
    description?: string;
    startDate: Date;
    endDate?: Date;
    storeIds: string[];
    route?: {
        coordinates: Array<{
            lat: number;
            lng: number;
        }>;
        waypoints: Array<{
            storeId: string;
            order: number;
        }>;
    };
}
//# sourceMappingURL=salesman.dto.d.ts.map