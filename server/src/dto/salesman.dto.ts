import { IsEnum, IsString, IsUUID, IsDateString, IsNumber, IsBoolean, IsOptional, IsObject, ValidateNested, IsArray, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class LocationDto {
  @IsNumber()
  latitude!: number;

  @IsNumber()
  longitude!: number;

  @IsString()
  address!: string;
}

export class CheckInOutDto {
  @IsDateString()
  timestamp!: Date;

  @ValidateNested()
  @Type(() => LocationDto)
  location!: LocationDto;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsString()
  @IsOptional()
  summary?: string;
}

export class CreateVisitDto {
  @IsUUID()
  storeId!: string;

  @IsDateString()
  scheduledAt!: Date;

  @IsString()
  @IsOptional()
  purpose?: string;
}

export class UpdateVisitDto {
  @IsEnum(['scheduled', 'in_progress', 'completed', 'cancelled'])
  @IsOptional()
  status?: string;

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => CheckInOutDto)
  checkIn?: CheckInOutDto;

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => CheckInOutDto)
  checkOut?: CheckInOutDto;

  @IsString()
  @IsOptional()
  remarks?: string;

  // These fields are managed by the server, not the client
  startedAt?: Date;
  completedAt?: Date;
}

export class RecordAttendanceDto {
  @IsDateString()
  @IsOptional()
  timestamp: Date = new Date();

  @ValidateNested()
  @Type(() => LocationDto)
  location!: LocationDto;

  @IsString()
  @IsOptional()
  imageUrl?: string;
}

export class PerformanceQueryDto {
  @IsString()
  @IsOptional()
  @IsEnum(['day', 'week', 'month', 'year'])
  period?: string = 'month';

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;
}

export class CreateBeatDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsDateString()
  startDate!: Date;

  @IsDateString()
  @IsOptional()
  endDate?: Date;

  @IsArray()
  @IsUUID(undefined, { each: true })
  storeIds!: string[];

  @IsObject()
  @IsOptional()
  route?: {
    coordinates: Array<{ lat: number; lng: number }>;
    waypoints: Array<{ storeId: string; order: number }>;
  };
}
