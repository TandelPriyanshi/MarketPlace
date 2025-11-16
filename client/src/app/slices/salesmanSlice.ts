import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Beat {
  id: string;
  areaName: string;
  storeCount: number;
  assignedAt: string;
  stores: Store[];
}

interface Store {
  id: string;
  name: string;
  address: string;
  ownerName: string;
  phone: string;
  lastVisitDate?: string;
}

interface StoreVisit {
  id: string;
  storeId: string;
  storeName: string;
  visitDate: string;
  notes: string;
  orderTaken: boolean;
}

interface SalesmanState {
  beats: Beat[];
  visits: StoreVisit[];
  performance: {
    totalVisits: number;
    ordersGenerated: number;
    beatsCompleted: number;
  };
  attendance: {
    checkedIn: boolean;
    checkInTime?: string;
    checkOutTime?: string;
  };
  isLoading: boolean;
}

const initialState: SalesmanState = {
  beats: [],
  visits: [],
  performance: {
    totalVisits: 0,
    ordersGenerated: 0,
    beatsCompleted: 0,
  },
  attendance: {
    checkedIn: false,
  },
  isLoading: false,
};

const salesmanSlice = createSlice({
  name: 'salesman',
  initialState,
  reducers: {
    setBeats: (state, action: PayloadAction<Beat[]>) => {
      state.beats = action.payload;
    },
    setVisits: (state, action: PayloadAction<StoreVisit[]>) => {
      state.visits = action.payload;
    },
    addVisit: (state, action: PayloadAction<StoreVisit>) => {
      state.visits.push(action.payload);
    },
    setPerformance: (state, action: PayloadAction<SalesmanState['performance']>) => {
      state.performance = action.payload;
    },
    checkIn: (state) => {
      state.attendance.checkedIn = true;
      state.attendance.checkInTime = new Date().toISOString();
    },
    checkOut: (state) => {
      state.attendance.checkedIn = false;
      state.attendance.checkOutTime = new Date().toISOString();
      state.attendance.checkInTime = undefined;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const {
  setBeats,
  setVisits,
  addVisit,
  setPerformance,
  checkIn,
  checkOut,
  setLoading,
} = salesmanSlice.actions;

export default salesmanSlice.reducer;
