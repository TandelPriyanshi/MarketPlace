import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Seller {
  id: string;
  name: string;
  businessName: string;
  city: string;
  area: string;
  pincode: string;
  rating: number;
}

interface Product {
  id: string;
  sellerId: string;
  sellerName: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  stock: number;
  image?: string;
}

interface CartItem {
  productId: string;
  sellerId: string;
  productName: string;
  sellerName: string;
  quantity: number;
  price: number;
  unit: string;
}

interface Order {
  id: string;
  sellerId: string;
  sellerName: string;
  orderStatus: string;
  totalAmount: number;
  orderDate: string;
  items: CartItem[];
}

interface Complaint {
  id: string;
  orderId: string;
  subject: string;
  description: string;
  status: string;
  created_at: string;
  imageUrl?: string;
}

interface CustomerState {
  sellers: Seller[];
  products: Product[];
  cart: CartItem[];
  orders: Order[];
  complaints: Complaint[];
  filters: {
    city?: string;
    area?: string;
    pincode?: string;
  };
  isLoading: boolean;
}

const initialState: CustomerState = {
  sellers: [],
  products: [],
  cart: [],
  orders: [],
  complaints: [],
  filters: {},
  isLoading: false,
};

const customerSlice = createSlice({
  name: 'customer',
  initialState,
  reducers: {
    setSellers: (state, action: PayloadAction<Seller[]>) => {
      state.sellers = action.payload;
    },
    setProducts: (state, action: PayloadAction<Product[]>) => {
      state.products = action.payload;
    },
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const existingItem = state.cart.find(
        (item) => item.productId === action.payload.productId
      );
      if (existingItem) {
        existingItem.quantity += action.payload.quantity;
      } else {
        state.cart.push(action.payload);
      }
    },
    removeFromCart: (state, action: PayloadAction<string>) => {
      state.cart = state.cart.filter((item) => item.productId !== action.payload);
    },
    updateCartQuantity: (state, action: PayloadAction<{ productId: string; quantity: number }>) => {
      const item = state.cart.find((item) => item.productId === action.payload.productId);
      if (item) {
        item.quantity = action.payload.quantity;
      }
    },
    clearCart: (state) => {
      state.cart = [];
    },
    setOrders: (state, action: PayloadAction<Order[]>) => {
      state.orders = action.payload;
    },
    addOrder: (state, action: PayloadAction<Order>) => {
      state.orders.unshift(action.payload);
    },
    setComplaints: (state, action: PayloadAction<Complaint[]>) => {
      state.complaints = action.payload;
    },
    addComplaint: (state, action: PayloadAction<Complaint>) => {
      state.complaints.unshift(action.payload);
    },
    setFilters: (state, action: PayloadAction<CustomerState['filters']>) => {
      state.filters = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const {
  setSellers,
  setProducts,
  addToCart,
  removeFromCart,
  updateCartQuantity,
  clearCart,
  setOrders,
  addOrder,
  setComplaints,
  addComplaint,
  setFilters,
  setLoading,
} = customerSlice.actions;

export default customerSlice.reducer;
