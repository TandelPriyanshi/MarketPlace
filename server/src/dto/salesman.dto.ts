import { VisitStatus } from '../models/visit.model';
import { BeatStatus } from '../models/beat.model';

export interface CreateBeatDto {
  name: string;
  description?: string;
  salesmanId: string;
  startDate: Date;
  endDate: Date;
  route?: {
    coordinates: Array<{ lat: number; lng: number }>;
    waypoints: Array<{ storeId: string; order: number }>;
  };
}

export interface CreateVisitDto {
  salesmanId: string;
  storeId: string;
  scheduledAt: Date;
  purpose: string;
  remarks?: string;
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
}

export interface UpdateVisitStatusDto {
  status: VisitStatus;
  checkIn?: {
    timestamp: Date;
    location: {
      latitude: number;
      longitude: number;
      address: string;
    };
    imageUrl?: string;
  };
  checkOut?: {
    timestamp: Date;
    location: {
      latitude: number;
      longitude: number;
      address: string;
    };
    summary?: string;
  };
}

export interface BeatResponseDto {
  id: string;
  name: string;
  description?: string;
  salesmanId: string;
  startDate: Date;
  endDate: Date;
  status: BeatStatus;
  route?: {
    coordinates: Array<{ lat: number; lng: number }>;
    waypoints: Array<{ storeId: string; order: number }>;
  };
  stores?: Array<{
    id: string;
    name: string;
    address: string;
  }>;
  created_at: Date;
  updatedAt: Date;
}

export interface VisitResponseDto {
  id: string;
  salesmanId: string;
  storeId: string;
  status: VisitStatus;
  scheduledAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  purpose: string;
  remarks?: string;
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  checkIn?: {
    timestamp: Date;
    location: {
      latitude: number;
      longitude: number;
      address: string;
    };
    imageUrl?: string;
  };
  checkOut?: {
    timestamp: Date;
    location: {
      latitude: number;
      longitude: number;
      address: string;
    };
    summary?: string;
  };
  store?: {
    id: string;
    name: string;
    address: string;
    contactPerson: string;
    phone: string;
  };
  created_at: Date;
  updatedAt: Date;
}
