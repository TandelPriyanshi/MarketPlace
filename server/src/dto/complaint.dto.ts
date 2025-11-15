import { ComplaintStatus, ComplaintType } from '../models/complaint.model';

export interface CreateComplaintDto {
  orderId?: string;
  type: ComplaintType;
  title: string;
  description: string;
  attachments?: string[];
}

export interface UpdateComplaintStatusDto {
  status: ComplaintStatus;
  resolutionNotes?: string;
}

export interface ComplaintResponseDto {
  id: string;
  userId: string;
  orderId?: string;
  type: ComplaintType;
  title: string;
  description: string;
  status: ComplaintStatus;
  attachments?: string[];
  resolutionNotes?: string;
  resolvedById?: string;
  resolvedAt?: Date;
  user?: {
    id: string;
    name?: string;
    email: string;
  };
  order?: {
    id: string;
    orderNumber: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface ComplaintListResponseDto {
  complaints: ComplaintResponseDto[];
  pagination: {
    total: number;
    page: number;
    totalPages: number;
    limit: number;
  };
}

