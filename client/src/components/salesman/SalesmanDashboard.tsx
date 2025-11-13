import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { MapPin, TrendingUp, CheckCircle, LogIn } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RootState } from '@/app/store';
import { setBeats, setPerformance, checkIn, checkOut } from '@/app/slices/salesmanSlice';
import { BeatTable } from './BeatTable';
import { PerformanceCard } from './PerformanceCard';
import { toast } from 'sonner';

// Mock data
const mockBeats = [
  {
    id: 'BEAT-001',
    areaName: 'Jayanagar',
    storeCount: 12,
    assignedAt: new Date().toISOString(),
    stores: [
      {
        id: 'STORE-1',
        name: 'Raghavendra Stores',
        address: '4th Block, Jayanagar',
        ownerName: 'Raghavendra',
        phone: '9876543210',
      },
      {
        id: 'STORE-2',
        name: 'Lakshmi Super Market',
        address: '9th Block, Jayanagar',
        ownerName: 'Lakshmi',
        phone: '9876543211',
      },
    ],
  },
  {
    id: 'BEAT-002',
    areaName: 'Koramangala',
    storeCount: 8,
    assignedAt: new Date().toISOString(),
    stores: [
      {
        id: 'STORE-3',
        name: 'Metro Mart',
        address: '5th Block, Koramangala',
        ownerName: 'Suresh',
        phone: '9876543212',
      },
    ],
  },
];

export const SalesmanDashboard = () => {
  const dispatch = useDispatch();
  const { performance, attendance } = useSelector((state: RootState) => state.salesman);

  useEffect(() => {
    // Simulate API calls
    dispatch(setBeats(mockBeats));
    dispatch(setPerformance({
      totalVisits: 32,
      ordersGenerated: 18,
      beatsCompleted: 3,
    }));
  }, [dispatch]);

  const handleCheckIn = () => {
    dispatch(checkIn());
    toast.success('Checked in successfully');
  };

  const handleCheckOut = () => {
    dispatch(checkOut());
    toast.success('Checked out successfully');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Salesman Dashboard</h1>
          <p className="text-muted-foreground">Manage your beats and store visits</p>
        </div>
        {!attendance.checkedIn ? (
          <Button onClick={handleCheckIn} size="lg" className="gap-2">
            <LogIn className="h-4 w-4" />
            Check In
          </Button>
        ) : (
          <div className="flex items-center gap-4">
            <div className="text-sm">
              <div className="text-muted-foreground">Checked in at</div>
              <div className="font-medium">
                {new Date(attendance.checkInTime!).toLocaleTimeString()}
              </div>
            </div>
            <Button onClick={handleCheckOut} variant="outline" className="gap-2">
              Check Out
            </Button>
          </div>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Store Visits</CardTitle>
            <MapPin className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{performance.totalVisits}</div>
            <p className="text-xs text-muted-foreground mt-1">
              This month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Orders Generated</CardTitle>
            <TrendingUp className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{performance.ordersGenerated}</div>
            <p className="text-xs text-muted-foreground mt-1">
              From visits
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Beats Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{performance.beatsCompleted}</div>
            <p className="text-xs text-muted-foreground mt-1">
              This week
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <BeatTable />
        </div>
        <div>
          <PerformanceCard performance={performance} />
        </div>
      </div>
    </div>
  );
};
