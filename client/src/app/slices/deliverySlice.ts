import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface DeliveryRoute {
  id: string;
  sellerId: string;
  sellerName: string;
  customerId: string;
  customerName: string;
  deliveryAddress: string;
  deliveryStatus: string;
  proofImageUrl?: string;
  assignedAt: string;
  orderItems: Array<{
    productName: string;
    quantity: number;
  }>;
}

interface DeliveryState {
  routes: DeliveryRoute[];
  completedDeliveries: number;
  pendingDeliveries: number;
  isLoading: boolean;
}

const initialState: DeliveryState = {
  routes: [],
  completedDeliveries: 0,
  pendingDeliveries: 0,
  isLoading: false,
};

const deliverySlice = createSlice({
  name: 'delivery',
  initialState,
  reducers: {
    setRoutes: (state, action: PayloadAction<DeliveryRoute[]>) => {
      state.routes = action.payload;
      state.completedDeliveries = action.payload.filter((r) => r.deliveryStatus === 'delivered').length;
      state.pendingDeliveries = action.payload.filter((r) => r.deliveryStatus !== 'delivered').length;
    },
    updateDeliveryStatus: (state, action: PayloadAction<{ routeId: string; status: string }>) => {
      const route = state.routes.find((r) => r.id === action.payload.routeId);
      if (route) {
        route.deliveryStatus = action.payload.status;
      }
    },
    uploadProof: (state, action: PayloadAction<{ routeId: string; proofUrl: string }>) => {
      const route = state.routes.find((r) => r.id === action.payload.routeId);
      if (route) {
        route.proofImageUrl = action.payload.proofUrl;
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const { setRoutes, updateDeliveryStatus, uploadProof, setLoading } = deliverySlice.actions;
export default deliverySlice.reducer;
