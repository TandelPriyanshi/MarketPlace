import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Clock, MapPin, CheckCircle, XCircle, AlertCircle, Calendar as CalendarIcon } from 'lucide-react';
import { RootState } from '@/app/store';
import { checkIn, checkOut } from '@/app/slices/salesmanSlice';
import { markAttendance } from '@/api/salesman.api';
import { toast } from 'sonner';

interface AttendanceRecord {
  id: string;
  date: string;
  status: 'present' | 'absent' | 'leave';
  checkInTime?: string;
  checkOutTime?: string;
  location?: string;
  notes?: string;
}

export const AttendanceTracking = () => {
  const dispatch = useDispatch();
  const { attendance } = useSelector((state: RootState) => state.salesman);
  const [loading, setLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);

  useEffect(() => {
    fetchAttendanceRecords();
  }, [selectedMonth]);

  const fetchAttendanceRecords = async () => {
    try {
      setLoading(true);
      // Mock data for now - replace with actual API call
      const mockRecords: AttendanceRecord[] = [
        {
          id: '1',
          date: '2024-01-15',
          status: 'present',
          checkInTime: '09:00',
          checkOutTime: '18:00',
          location: 'Office',
        },
        {
          id: '2',
          date: '2024-01-14',
          status: 'present',
          checkInTime: '08:45',
          checkOutTime: '17:30',
          location: 'Field Visit',
        },
        {
          id: '3',
          date: '2024-01-13',
          status: 'absent',
          notes: 'Sick leave',
        },
      ];
      setAttendanceRecords(mockRecords);
    } catch (error) {
      console.error('Error fetching attendance records:', error);
      toast.error('Failed to load attendance records');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    try {
      setLoading(true);
      await markAttendance({
        date: new Date().toISOString(),
        status: 'present',
        checkInTime: new Date().toISOString(),
        location: {
          latitude: 12.9716,
          longitude: 77.5946,
        },
      });
      
      dispatch(checkIn());
      toast.success('Checked in successfully');
      fetchAttendanceRecords();
    } catch (error) {
      console.error('Error checking in:', error);
      toast.error('Failed to check in');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    try {
      setLoading(true);
      // You might need to update the attendance record with check-out time
      dispatch(checkOut());
      toast.success('Checked out successfully');
      fetchAttendanceRecords();
    } catch (error) {
      console.error('Error checking out:', error);
      toast.error('Failed to check out');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-800';
      case 'absent':
        return 'bg-red-100 text-red-800';
      case 'leave':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'absent':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'leave':
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getDayAttendance = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return attendanceRecords.find(record => record.date === dateStr);
  };

  const calculateStats = () => {
    const totalDays = attendanceRecords.length;
    const presentDays = attendanceRecords.filter(r => r.status === 'present').length;
    const absentDays = attendanceRecords.filter(r => r.status === 'absent').length;
    const leaveDays = attendanceRecords.filter(r => r.status === 'leave').length;
    const attendanceRate = totalDays > 0 ? (presentDays / totalDays) * 100 : 0;

    return {
      totalDays,
      presentDays,
      absentDays,
      leaveDays,
      attendanceRate,
    };
  };

  const stats = calculateStats();

  if (loading && attendanceRecords.length === 0) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Attendance Tracking</h2>
          <p className="text-muted-foreground">Track your daily attendance and work hours</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedMonth.getMonth().toString()} onValueChange={(value) => {
            const newMonth = new Date(selectedMonth);
            newMonth.setMonth(parseInt(value));
            setSelectedMonth(newMonth);
          }}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent>
              {['January', 'February', 'March', 'April', 'May', 'June', 
                'July', 'August', 'September', 'October', 'November', 'December'].map((month, index) => (
                <SelectItem key={index} value={index.toString()}>
                  {month}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Attendance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </div>
              <div className="text-lg font-semibold">
                Status: <Badge className={getStatusColor(attendance.checkedIn ? 'present' : 'absent')}>
                  {attendance.checkedIn ? 'Checked In' : 'Not Checked In'}
                </Badge>
              </div>
              {attendance.checkInTime && (
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Check-in: {attendance.checkInTime}
                </div>
              )}
              {attendance.checkOutTime && (
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Check-out: {attendance.checkOutTime}
                </div>
              )}
            </div>
            <div className="flex gap-2">
              {!attendance.checkedIn ? (
                <Button onClick={handleCheckIn} disabled={loading}>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Check In
                </Button>
              ) : (
                <Button onClick={handleCheckOut} disabled={loading}>
                  <XCircle className="h-4 w-4 mr-2" />
                  Check Out
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.attendanceRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.presentDays} of {stats.totalDays} days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Present Days</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.presentDays}</div>
            <p className="text-xs text-muted-foreground mt-1">
              This month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Absent Days</CardTitle>
            <XCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.absentDays}</div>
            <p className="text-xs text-muted-foreground mt-1">
              This month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Leave Days</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.leaveDays}</div>
            <p className="text-xs text-muted-foreground mt-1">
              This month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Calendar View */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Attendance Calendar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedMonth}
              month={selectedMonth}
              onMonthChange={setSelectedMonth}
              className="rounded-md border"
              modifiers={{
                present: (date) => getDayAttendance(date)?.status === 'present',
                absent: (date) => getDayAttendance(date)?.status === 'absent',
                leave: (date) => getDayAttendance(date)?.status === 'leave',
              }}
              modifiersStyles={{
                present: { backgroundColor: '#22c55e', color: 'white' },
                absent: { backgroundColor: '#ef4444', color: 'white' },
                leave: { backgroundColor: '#eab308', color: 'white' },
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {attendanceRecords.map((record) => (
                <div key={record.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-1">
                    <div className="font-medium">
                      {new Date(record.date).toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(record.status)}
                      <Badge className={getStatusColor(record.status)}>
                        {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    {record.checkInTime && (
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        In: {record.checkInTime}
                      </div>
                    )}
                    {record.checkOutTime && (
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Out: {record.checkOutTime}
                      </div>
                    )}
                    {record.location && (
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {record.location}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
