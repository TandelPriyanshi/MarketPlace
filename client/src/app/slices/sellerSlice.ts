import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import { sellerApi, Product, Order, SellerDashboard, DeliveryPerson } from '@/api/seller.api';

interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

interface SellerState {
  products: Product[];
  orders: Order[];
  dashboard: SellerDashboard | null;
  availableDeliveryPersons: DeliveryPerson[];
  analytics: {
    totalSales: number;
    totalOrders: number;
    activeProducts: number;
  };
  isLoading: boolean;
  error: string | null;
  pagination: {
    products: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    orders: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

const initialState: SellerState = {
  products: [],
  orders: [],
  dashboard: null,
  availableDeliveryPersons: [],
  analytics: {
    totalSales: 0,
    totalOrders: 0,
    activeProducts: 0,
  },
  isLoading: false,
  error: null,
  pagination: {
    products: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
    },
    orders: {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 0,
    },
  },
};

// Async thunks
export const fetchSellerDashboard = createAsyncThunk(
  'seller/fetchDashboard',
  async (_, { rejectWithValue }) => {
    try {
      const response = await sellerApi.getDashboard();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard');
    }
  }
);

export const fetchSellerProducts = createAsyncThunk(
  'seller/fetchProducts',
  async (params: {
    page?: number;
    limit?: number;
    category?: string;
    status?: Product['status'];
    search?: string;
  } = {}, { rejectWithValue }) => {
    try {
      const response = await sellerApi.getProducts(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch products');
    }
  }
);

export const createProduct = createAsyncThunk(
  'seller/createProduct',
  async (productData: {
    name: string;
    description: string;
    price: number;
    category: string;
    stock: number;
    images?: string[];
  }, { rejectWithValue }) => {
    try {
      const response = await sellerApi.createProduct(productData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create product');
    }
  }
);

export const updateProduct = createAsyncThunk(
  'seller/updateProduct',
  async ({ productId, productData }: {
    productId: string;
    productData: {
      name?: string;
      description?: string;
      price?: number;
      category?: string;
      stock?: number;
      status?: Product['status'];
      images?: string[];
    };
  }, { rejectWithValue }) => {
    try {
      const response = await sellerApi.updateProduct(productId, productData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update product');
    }
  }
);

export const deleteProduct = createAsyncThunk(
  'seller/deleteProduct',
  async (productId: string, { rejectWithValue }) => {
    try {
      await sellerApi.deleteProduct(productId);
      return productId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete product');
    }
  }
);

export const fetchSellerOrders = createAsyncThunk(
  'seller/fetchOrders',
  async (params: {
    page?: number;
    limit?: number;
    status?: Order['status'];
    startDate?: string;
    endDate?: string;
    search?: string;
  } = {}, { rejectWithValue }) => {
    try {
      const response = await sellerApi.getOrders(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch orders');
    }
  }
);

export const acceptSellerOrder = createAsyncThunk(
  'seller/acceptOrder',
  async ({ orderId, payload }: {
    orderId: string;
    payload: {
      estimatedPreparationTime?: number;
      notes?: string;
    };
  }, { rejectWithValue }) => {
    try {
      const response = await sellerApi.acceptOrder(orderId, payload);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to accept order');
    }
  }
);

export const updateSellerOrderStatus = createAsyncThunk(
  'seller/updateOrderStatus',
  async ({ orderId, payload }: {
    orderId: string;
    payload: {
      status: Order['status'];
      notes?: string;
    };
  }, { rejectWithValue }) => {
    try {
      const response = await sellerApi.updateOrderStatus(orderId, payload);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update order status');
    }
  }
);

export const assignDeliveryPerson = createAsyncThunk(
  'seller/assignDelivery',
  async ({ orderId, payload }: {
    orderId: string;
    payload: {
      deliveryPersonId: string;
      estimatedDeliveryTime?: number;
      notes?: string;
    };
  }, { rejectWithValue }) => {
    try {
      const response = await sellerApi.assignDelivery(orderId, payload);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to assign delivery person');
    }
  }
);

export const fetchAvailableDeliveryPersons = createAsyncThunk(
  'seller/fetchAvailableDeliveryPersons',
  async (_, { rejectWithValue }) => {
    try {
      const response = await sellerApi.getAvailableDeliveryPersons();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch delivery persons');
    }
  }
);

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
    deleteProduct: (state, action: PayloadAction<string>) => {
      state.products = state.products.filter((p) => p.id !== action.payload);
    },
    setOrders: (state, action: PayloadAction<Order[]>) => {
      state.orders = action.payload;
    },
    updateOrderStatus: (state, action: PayloadAction<{ orderId: string; status: Order['status'] }>) => {
      const order = state.orders.find((o) => o.id === action.payload.orderId);
      if (order) {
        order.status = action.payload.status;
      }
    },
    assignDelivery: (state, action: PayloadAction<{ orderId: string; deliveryPersonId: string; deliveryPerson: DeliveryPerson }>) => {
      const order = state.orders.find((o) => o.id === action.payload.orderId);
      if (order) {
        order.assignedDeliveryPerson = {
          id: action.payload.deliveryPersonId,
          name: action.payload.deliveryPerson.name,
          phone: action.payload.deliveryPerson.phone,
        };
        order.status = 'out_for_delivery';
      }
    },
    setAnalytics: (state, action: PayloadAction<SellerState['analytics']>) => {
      state.analytics = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setDashboard: (state, action: PayloadAction<SellerDashboard | null>) => {
      state.dashboard = action.payload;
    },
    setAvailableDeliveryPersons: (state, action: PayloadAction<DeliveryPerson[]>) => {
      state.availableDeliveryPersons = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Dashboard
    builder
      .addCase(fetchSellerDashboard.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSellerDashboard.fulfilled, (state, action) => {
        state.isLoading = false;
        state.dashboard = action.payload;
        state.analytics = {
          totalSales: action.payload.stats.totalRevenue,
          totalOrders: action.payload.stats.totalOrders,
          activeProducts: action.payload.stats.activeProducts,
        };
      })
      .addCase(fetchSellerDashboard.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Products
    builder
      .addCase(fetchSellerProducts.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSellerProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products = action.payload.data;
        state.pagination.products = {
          page: action.payload.pagination.page,
          limit: action.payload.pagination.limit,
          total: action.payload.pagination.total,
          totalPages: action.payload.pagination.totalPages,
        };
      })
      .addCase(fetchSellerProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(createProduct.fulfilled, (state, action) => {
        state.products.push(action.payload);
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    builder
      .addCase(updateProduct.fulfilled, (state, action) => {
        const index = state.products.findIndex((p) => p.id === action.payload.id);
        if (index !== -1) {
          state.products[index] = action.payload;
        }
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    builder
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.products = state.products.filter((p) => p.id !== action.payload);
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Orders
    builder
      .addCase(fetchSellerOrders.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSellerOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload.data;
        state.pagination.orders = {
          page: action.payload.pagination.page,
          limit: action.payload.pagination.limit,
          total: action.payload.pagination.total,
          totalPages: action.payload.pagination.totalPages,
        };
      })
      .addCase(fetchSellerOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    builder
      .addCase(acceptSellerOrder.fulfilled, (state, action) => {
        const index = state.orders.findIndex((o) => o.id === action.payload.id);
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
      })
      .addCase(acceptSellerOrder.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    builder
      .addCase(updateSellerOrderStatus.fulfilled, (state, action) => {
        const index = state.orders.findIndex((o) => o.id === action.payload.id);
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
      })
      .addCase(updateSellerOrderStatus.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    builder
      .addCase(assignDeliveryPerson.fulfilled, (state, action) => {
        const index = state.orders.findIndex((o) => o.id === action.payload.id);
        if (index !== -1) {
          state.orders[index] = action.payload;
        }
      })
      .addCase(assignDeliveryPerson.rejected, (state, action) => {
        state.error = action.payload as string;
      });

    // Delivery Persons
    builder
      .addCase(fetchAvailableDeliveryPersons.fulfilled, (state, action) => {
        state.availableDeliveryPersons = action.payload;
      })
      .addCase(fetchAvailableDeliveryPersons.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const {
  setProducts,
  addProduct,
  setOrders,
  updateOrderStatus,
  assignDelivery,
  setAnalytics,
  setLoading,
  setDashboard,
  setAvailableDeliveryPersons,
  clearError,
} = sellerSlice.actions;

export default sellerSlice.reducer;
