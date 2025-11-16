import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { MapPin, TrendingUp, CheckCircle, LogIn } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RootState } from '@/app/store';
import { setBeats, setPerformance, checkIn, checkOut } from '@/app/slices/salesmanSlice';
import { BeatTable } from './BeatTable';
import { PerformanceCard } from './PerformanceCard';
import { toast } from 'sonner';
import { getBeats, markAttendance, getSalesmanPerformance } from '@/api/salesman.api';
import { Beat, SalesmanPerformance } from '@/api/salesman.api';

export const SalesmanDashboard = () => {
  const dispatch = useDispatch();
  const { performance, attendance } = useSelector((state: RootState) => state.salesman);
  const [loading, setLoading] = useState(true);
  const [beats, setBeatsData] = useState<Beat[]>([]);
  const [performanceData, setPerformanceData] = useState<SalesmanPerformance | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [beatsResponse, performanceResponse] = await Promise.all([
        getBeats(),
        getSalesmanPerformance(),
      ]);
      
      setBeatsData(beatsResponse.data);
      setPerformanceData(performanceResponse.data);
      
      // Transform API beats to match Redux store format
      const transformedBeats = beatsResponse.data.map((beat: any) => ({
        id: beat.id,
        areaName: beat.name || beat.area,
        storeCount: beat.stores?.length || 0,
        assignedAt: beat.created_at || new Date().toISOString(),
        stores: beat.stores?.map((store: any) => ({
          id: store.id,
          name: store.name,
          address: store.address,
          ownerName: store.owner || store.contactPerson,
          phone: store.phone,
          lastVisitDate: store.lastVisitedAt,
        })) || [],
      }));
      
      // Update Redux store
      dispatch(setBeats(transformedBeats));
      dispatch(setPerformance({
        totalVisits: performanceResponse.data.visitsCompleted,
        ordersGenerated: performanceResponse.data.totalOrders,
        beatsCompleted: performanceResponse.data.storesCovered,
      }));
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    try {
      await markAttendance({
        date: new Date().toISOString(),
        status: 'present',
        checkInTime: new Date().toISOString(),
        location: {
          latitude: 12.9716, // Default Bangalore coordinates
          longitude: 77.5946,
        },
      });
      dispatch(checkIn());
      toast.success('Checked in successfully');
      // Refresh data after check-in
      fetchData();
    } catch (error) {
      console.error('Error checking in:', error);
      toast.error('Failed to check in');
    }
  };

  const handleCheckOut = async () => {
    try {
      // You might need to update the attendance record with check-out time
      dispatch(checkOut());
      toast.success('Checked out successfully');
      // Refresh data after check-out
      fetchData();
    } catch (error) {
      console.error('Error checking out:', error);
      toast.error('Failed to check out');
    }
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
