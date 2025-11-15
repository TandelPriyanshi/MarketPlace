import { OrderStatus, PaymentStatus, DeliveryStatus } from '../models/order.model';
import { ProductStatus } from '../models/product.model';
import { ComplaintStatus, ComplaintType } from '../models/complaint.model';
import { SellerStatus } from '../models/seller.model';
import { DeliveryPersonStatus } from '../models/deliveryPerson.model';
import { VisitStatus } from '../models/visit.model';
import { BeatStatus } from '../models/beat.model';

export const ORDER_STATUSES = Object.values(OrderStatus);
export const PAYMENT_STATUSES = Object.values(PaymentStatus);
export const DELIVERY_STATUSES = Object.values(DeliveryStatus);
export const PRODUCT_STATUSES = Object.values(ProductStatus);
export const COMPLAINT_STATUSES = Object.values(ComplaintStatus);
export const COMPLAINT_TYPES = Object.values(ComplaintType);
export const SELLER_STATUSES = Object.values(SellerStatus);
export const DELIVERY_PERSON_STATUSES = Object.values(DeliveryPersonStatus);
export const VISIT_STATUSES = Object.values(VisitStatus);
export const BEAT_STATUSES = Object.values(BeatStatus);

export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.PENDING]: [OrderStatus.CONFIRMED, OrderStatus.CANCELLED],
  [OrderStatus.CONFIRMED]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
  [OrderStatus.PROCESSING]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
  [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED, OrderStatus.CANCELLED],
  [OrderStatus.DELIVERED]: [OrderStatus.COMPLETED],
  [OrderStatus.COMPLETED]: [],
  [OrderStatus.CANCELLED]: [],
  [OrderStatus.REFUNDED]: [],
  [OrderStatus.RETURN_REQUESTED]: [OrderStatus.RETURN_APPROVED, OrderStatus.RETURN_REJECTED],
  [OrderStatus.RETURN_APPROVED]: [OrderStatus.RETURN_COMPLETED],
  [OrderStatus.RETURN_REJECTED]: [],
  [OrderStatus.RETURN_COMPLETED]: [],
};

export const DELIVERY_STATUS_TRANSITIONS: Record<DeliveryStatus, DeliveryStatus[]> = {
  [DeliveryStatus.PENDING]: [DeliveryStatus.ASSIGNED, DeliveryStatus.CANCELLED],
  [DeliveryStatus.ASSIGNED]: [DeliveryStatus.PICKED_UP, DeliveryStatus.CANCELLED],
  [DeliveryStatus.PICKED_UP]: [DeliveryStatus.OUT_FOR_DELIVERY, DeliveryStatus.RETURNED],
  [DeliveryStatus.OUT_FOR_DELIVERY]: [DeliveryStatus.DELIVERED, DeliveryStatus.RETURNED],
  [DeliveryStatus.DELIVERED]: [],
  [DeliveryStatus.RETURNED]: [],
  [DeliveryStatus.CANCELLED]: [],
};

export const DEFAULT_PAGE_SIZE = 10;
export const MAX_PAGE_SIZE = 100;
export const DEFAULT_PAGE = 1;

export const FILE_UPLOAD_LIMITS = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  ALLOWED_MIME_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
  UPLOAD_PATH: './uploads',
};

export const JWT_CONFIG = {
  EXPIRES_IN: '7d',
  REFRESH_EXPIRES_IN: '30d',
};

