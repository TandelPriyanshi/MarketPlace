import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Product {
  id: string;
  name: string;
  sku: string;
  description: string;
  price: number;
  stock: number;
  unit: string;
  isActive: boolean;
  createdAt: string;
}

interface Order {
  id: string;
  customerId: string;
  customerName: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  items: OrderItem[];
  deliveryAddress?: string;
  deliveryPersonId?: string;
}

interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

interface SellerState {
  products: Product[];
  orders: Order[];
  analytics: {
    totalSales: number;
    totalOrders: number;
    activeProducts: number;
  };
  isLoading: boolean;
}

const initialState: SellerState = {
  products: [],
  orders: [],
  analytics: {
    totalSales: 0,
    totalOrders: 0,
    activeProducts: 0,
  },
  isLoading: false,
};

const sellerSlice = createSlice({
  name: 'seller',
  initialState,
  reducers: {
    setProducts: (state, action: PayloadAction<Product[]>) => {
      state.products = action.payload;
    },
    addProduct: (state, action: PayloadAction<Product>) => {
      state.products.push(action.payload);
    },
    updateProduct: (state, action: PayloadAction<Product>) => {
      const index = state.products.findIndex((p) => p.id === action.payload.id);
      if (index !== -1) {
        state.products[index] = action.payload;
      }
    },
    deleteProduct: (state, action: PayloadAction<string>) => {
      state.products = state.products.filter((p) => p.id !== action.payload);
    },
    setOrders: (state, action: PayloadAction<Order[]>) => {
      state.orders = action.payload;
    },
    updateOrderStatus: (state, action: PayloadAction<{ orderId: string; status: string }>) => {
      const order = state.orders.find((o) => o.id === action.payload.orderId);
      if (order) {
        order.status = action.payload.status;
      }
    },
    assignDelivery: (state, action: PayloadAction<{ orderId: string; deliveryPersonId: string }>) => {
      const order = state.orders.find((o) => o.id === action.payload.orderId);
      if (order) {
        order.deliveryPersonId = action.payload.deliveryPersonId;
        order.status = 'assigned';
      }
    },
    setAnalytics: (state, action: PayloadAction<SellerState['analytics']>) => {
      state.analytics = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const {
  setProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  setOrders,
  updateOrderStatus,
  assignDelivery,
  setAnalytics,
  setLoading,
} = sellerSlice.actions;

export default sellerSlice.reducer;
