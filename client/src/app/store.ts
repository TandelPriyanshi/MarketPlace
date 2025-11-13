import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import sellerReducer from './slices/sellerSlice';
import deliveryReducer from './slices/deliverySlice';
import salesmanReducer from './slices/salesmanSlice';
import customerReducer from './slices/customerSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    seller: sellerReducer,
    delivery: deliveryReducer,
    salesman: salesmanReducer,
    customer: customerReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
