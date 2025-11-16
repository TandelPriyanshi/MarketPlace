//src/utils/constants.ts
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const ORDER_STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  PACKED: 'packed',
  ASSIGNED: 'assigned',
  PICKED: 'picked',
  OUT_FOR_DELIVERY: 'out_for_delivery',
  DELIVERED: 'delivered',
  RETURNED: 'returned',
  CANCELLED: 'cancelled',
} as const;

export const DELIVERY_STATUS = {
  PENDING: 'pending',
  PICKED: 'picked',
  OUT_FOR_DELIVERY: 'out_for_delivery',
  DELIVERED: 'delivered',
  RETURNED: 'returned',
} as const;

export const USER_ROLES = {
  SELLER: 'seller',
  DELIVERY: 'delivery_person',
  SALESMAN: 'salesman',
  CUSTOMER: 'customer',
} as const;

export const PRODUCT_UNITS = ['kg', 'g', 'l', 'ml', 'piece', 'box', 'pack'] as const;

export const STATUS_COLORS = {
  pending: 'bg-warning/10 text-warning border-warning/20',
  accepted: 'bg-accent/10 text-accent border-accent/20',
  rejected: 'bg-destructive/10 text-destructive border-destructive/20',
  packed: 'bg-primary/10 text-primary border-primary/20',
  assigned: 'bg-primary/10 text-primary border-primary/20',
  picked: 'bg-primary/10 text-primary border-primary/20',
  out_for_delivery: 'bg-primary/10 text-primary border-primary/20',
  delivered: 'bg-accent/10 text-accent border-accent/20',
  returned: 'bg-destructive/10 text-destructive border-destructive/20',
  cancelled: 'bg-muted text-muted-foreground border-border',
} as const;
