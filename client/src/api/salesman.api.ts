import axiosInstance from './axiosInstance';

// Types
export interface Beat {
  id: string;
  name: string;
  area: string;
  stores: Store[];
  status: 'active' | 'inactive';
  targetAmount: number;
  achievedAmount: number;
}

export interface Store {
  id: string;
  name: string;
  address: string;
  phone: string;
  email?: string;
  owner: string;
  type: 'retail' | 'wholesale' | 'distributor';
  category: string;
  latitude?: number;
  longitude?: number;
  creditLimit: number;
  outstandingBalance: number;
  lastVisitDate?: string;
  status: 'active' | 'inactive';
}

export interface AttendancePayload {
  date: string;
  status: 'present' | 'absent' | 'leave';
  checkInTime?: string;
  checkOutTime?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  notes?: string;
}

export interface VisitPayload {
  storeId: string;
  date: string;
  checkInTime: string;
  checkOutTime?: string;
  purpose: 'sales' | 'collection' | 'follow_up' | 'new_store';
  outcome: 'successful' | 'unsuccessful' | 'follow_up_required';
  notes?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  orders?: SalesOrder[];
  collections?: Collection[];
}

export interface SalesOrderPayload {
  storeId: string;
  items: OrderItem[];
  discount?: number;
  tax?: number;
  paymentMethod: 'cash' | 'credit' | 'upi' | 'cheque';
  deliveryDate?: string;
  notes?: string;
}

export interface OrderItem {
  productId: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
}

export interface Collection {
  storeId: string;
  amount: number;
  method: 'cash' | 'cheque' | 'upi' | 'bank_transfer';
  reference?: string;
  date: string;
}

export interface SalesOrder {
  id: string;
  storeId: string;
  store: Store;
  items: OrderItem[];
  totalAmount: number;
  discount: number;
  tax: number;
  finalAmount: number;
  paymentMethod: string;
  status: 'pending' | 'confirmed' | 'delivered' | 'cancelled';
  createdAt: string;
  deliveryDate?: string;
  notes?: string;
}

export interface SalesmanPerformance {
  visitsCompleted: number;
  storesCovered: number;
  totalOrdersPlaced: number;
}

export interface SalesmanBeat {
  id: string;
  name: string;
  area: string;
  storeCount: number;
  assignedAt: string;
}

export interface Visit {
  id: string;
  storeId: string;
  date: string;
  checkInTime: string;
  checkOutTime?: string;
  purpose: string;
  outcome: string;
  notes?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
}

// API Functions
export const getBeats = async (params?: {
  status?: string;
  area?: string;
}): Promise<{
  success: boolean;
  data: SalesmanBeat[];
}> => {
  const response = await axiosInstance.get('/salesman/beats', { params });
  return response.data;
};

export const getVisits = async (params?: {
  status?: string;
  storeId?: string;
}): Promise<{
  success: boolean;
  data: Visit[];
}> => {
  const response = await axiosInstance.get('/salesman/visits', { params });
  return response.data;
};

export const getOrders = async (params?: {
  status?: string;
  startDate?: string;
  endDate?: string;
}): Promise<{
  success: boolean;
  data: SalesOrder[];
}> => {
  const response = await axiosInstance.get('/salesman/orders', { params });
  return response.data;
};

export const markAttendance = async (payload: AttendancePayload): Promise<{
  success: boolean;
  data: {
    id: string;
    date: string;
    status: string;
    checkInTime?: string;
    checkOutTime?: string;
  };
}> => {
  const response = await axiosInstance.post('/salesman/attendance', payload);
  return response.data;
};

export const logVisit = async (payload: VisitPayload): Promise<{
  success: boolean;
  data: {
    id: string;
    storeId: string;
    date: string;
    checkInTime: string;
    checkOutTime?: string;
    purpose: string;
    outcome: string;
  };
}> => {
  const response = await axiosInstance.post('/salesman/visits', payload);
  return response.data;
};

export const createSalesOrder = async (payload: SalesOrderPayload): Promise<{
  success: boolean;
  data: SalesOrder;
}> => {
  const response = await axiosInstance.post('/salesman/orders', payload);
  return response.data;
};

export const getSalesmanPerformance = async (params?: {
  startDate?: string;
  endDate?: string;
  period?: 'daily' | 'weekly' | 'monthly';
}): Promise<{
  success: boolean;
  data: SalesmanPerformance;
}> => {
  const response = await axiosInstance.get('/salesmen/performance', { params });
  return response.data;
};

export const getSalesmanBeats = async (): Promise<{
  success: boolean;
  data: SalesmanBeat[];
}> => {
  const response = await axiosInstance.get('/salesmen/beats');
  return response.data;
};