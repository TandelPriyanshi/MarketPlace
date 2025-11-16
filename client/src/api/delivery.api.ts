import axiosInstance from './axiosInstance';

// Delivery interfaces
export interface Delivery {
  id: string;
  orderId: string;
  orderNumber: string;
  sellerId: string;
  sellerName: string;
  customerId: string;
  customerName: string;
  customerAddress: string;
  customerPhone: string;
  deliveryPersonId: string;
  deliveryPersonName: string;
  status: 'assigned' | 'picked_up' | 'in_transit' | 'delivered' | 'failed';
  assignedAt: string;
  pickedUpAt?: string;
  deliveredAt?: string;
  notes?: string;
  proofOfDelivery?: {
    imageUrl?: string;
    signatureUrl?: string;
    notes?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface DeliveryRoute {
  deliveries: Delivery[];
  optimizedRoute: {
    order: string[]; // Array of delivery IDs in order
    estimatedTime: number; // Total estimated time in minutes
    totalDistance: number; // Total distance in km
  };
  currentLocation?: {
    lat: number;
    lng: number;
  };
}

export interface DeliveryListResponse {
  success: boolean;
  data: {
    deliveries: Delivery[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  };
}

export interface UpdateDeliveryStatusPayload {
  status: Delivery['status'];
  notes?: string;
  location?: {
    lat: number;
    lng: number;
  };
}

export interface UploadProofPayload {
  proofType: 'photo' | 'signature';
  file: File;
  notes?: string;
}

// Get all deliveries assigned to the authenticated delivery person
export const getAssignedDeliveries = async (params?: {
  page?: number;
  limit?: number;
  status?: Delivery['status'];
  startDate?: string;
  endDate?: string;
}): Promise<DeliveryListResponse> => {
  const response = await axiosInstance.get('/delivery/assigned', { params });
  return response.data;
};

// Update delivery status
export const updateDeliveryStatus = async (
  orderId: string,
  payload: UpdateDeliveryStatusPayload
): Promise<Delivery> => {
  const response = await axiosInstance.put(`/delivery/${orderId}/status`, payload);
  return response.data;
};

// Upload proof of delivery
export const uploadProof = async (
  orderId: string,
  payload: UploadProofPayload
): Promise<Delivery> => {
  const formData = new FormData();
  formData.append('proofType', payload.proofType);
  formData.append('file', payload.file);
  if (payload.notes) {
    formData.append('notes', payload.notes);
  }

  const response = await axiosInstance.post(
    `/delivery/${orderId}/proof`,
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data;
};

// Get optimized delivery route for assigned deliveries
export const getDeliveryRoute = async (params?: {
  includeDelivered?: boolean;
  startLocation?: {
    lat: number;
    lng: number;
  };
}): Promise<DeliveryRoute> => {
  const response = await axiosInstance.get('/delivery/route', { params });
  return response.data;
};

// Get delivery details by order ID
export const getDeliveryDetails = async (orderId: string): Promise<Delivery> => {
  const response = await axiosInstance.get(`/delivery/${orderId}`);
  return response.data;
};

// Start delivery (mark as picked up)
export const startDelivery = async (
  orderId: string,
  payload?: {
    notes?: string;
    location?: {
      lat: number;
      lng: number;
    };
  }
): Promise<Delivery> => {
  const response = await axiosInstance.post(`/delivery/${orderId}/start`, payload);
  return response.data;
};

// Complete delivery (mark as delivered)
export const completeDelivery = async (
  orderId: string,
  payload: {
    notes?: string;
    location?: {
      lat: number;
      lng: number;
    };
  }
): Promise<Delivery> => {
  const response = await axiosInstance.post(`/delivery/${orderId}/complete`, payload);
  return response.data;
};

// Report delivery issue/failed delivery
export const reportDeliveryIssue = async (
  orderId: string,
  payload: {
    reason: string;
    notes?: string;
    location?: {
      lat: number;
      lng: number;
    };
  }
): Promise<Delivery> => {
  const response = await axiosInstance.post(`/delivery/${orderId}/issue`, payload);
  return response.data;
};

// Get delivery statistics
export const getDeliveryStats = async (params?: {
  startDate?: string;
  endDate?: string;
}): Promise<{
  success: boolean;
  data: {
    totalDeliveries: number;
    completedDeliveries: number;
    failedDeliveries: number;
    averageDeliveryTime: number; // in minutes
    totalDistance: number; // in km
  };
}> => {
  const response = await axiosInstance.get('/delivery/stats', { params });
  return response.data;
};
