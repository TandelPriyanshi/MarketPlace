import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  MapPin, 
  Users,
  Calendar,
  Target
} from 'lucide-react';
import { getSalesmanPerformance } from '@/api/salesman.api';
import { SalesmanPerformance } from '@/api/salesman.api';
import { toast } from 'sonner';

interface PerformanceDashboardProps {
  period?: 'daily' | 'weekly' | 'monthly';
}

export const PerformanceDashboard = ({ period = 'monthly' }: PerformanceDashboardProps) => {
  const [performance, setPerformance] = useState<SalesmanPerformance | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPerformance();
  }, [period]);

  const fetchPerformance = async () => {
    try {
      setLoading(true);
      const response = await getSalesmanPerformance({ period });
      setPerformance(response.data);
    } catch (error) {
      console.error('Error fetching performance data:', error);
      toast.error('Failed to load performance data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const getTrendIcon = (value: number) => {
    return value > 0 ? (
      <TrendingUp className="h-4 w-4 text-green-600" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-600" />
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
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
    );
  }

  if (!performance) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No performance data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(performance.totalSales)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {performance.totalOrders} orders
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(performance.averageOrderValue)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Per order
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Visits Completed</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{performance.visitsCompleted}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {performance.storesCovered} stores covered
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Target Achievement</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{performance.targetAchievement}%</div>
            <Progress value={performance.targetAchievement} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Collections and Orders */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Collections
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Collected Amount</span>
              <span className="font-semibold text-green-600">
                {formatCurrency(performance.collectionsAmount)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Pending Collections</span>
              <span className="font-semibold text-orange-600">
                {formatCurrency(performance.pendingCollections)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">New Stores Added</span>
              <Badge variant="secondary">{performance.newStoresAdded}</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Monthly Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {performance.monthlyTrend?.map((trend, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-1">
                    <div className="font-medium">{trend.month}</div>
                    <div className="text-sm text-muted-foreground">
                      {trend.orders} orders • {trend.visits} visits
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{formatCurrency(trend.sales)}</div>
                    <div className="flex items-center gap-1">
                      {getTrendIcon(trend.sales)}
                      <span className="text-xs text-muted-foreground">vs last month</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Performance Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="stores">Store Coverage</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-blue-600">{performance.totalOrders}</div>
                  <div className="text-sm text-muted-foreground">Total Orders</div>
                </div>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-green-600">{performance.visitsCompleted}</div>
                  <div className="text-sm text-muted-foreground">Visits Done</div>
                </div>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-purple-600">{performance.storesCovered}</div>
                  <div className="text-sm text-muted-foreground">Stores Covered</div>
                </div>
                <div className="space-y-2">
                  <div className="text-2xl font-bold text-orange-600">{performance.newStoresAdded}</div>
                  <div className="text-sm text-muted-foreground">New Stores</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stores" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Store Coverage Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Total Stores in Beats</span>
                  <Badge variant="outline">--</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Stores Visited</span>
                  <Badge>{performance.storesCovered}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">New Stores Added</span>
                  <Badge variant="secondary">{performance.newStoresAdded}</Badge>
                </div>
                <Progress value={(performance.storesCovered / 50) * 100} className="mt-2" />
                <p className="text-xs text-muted-foreground">
                  Coverage based on {performance.storesCovered} stores visited
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {performance.monthlyTrend?.map((trend, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{trend.month}</span>
                      <span className="text-sm text-muted-foreground">
                        {formatCurrency(trend.sales)}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div className="flex items-center gap-2">
                        <ShoppingCart className="h-3 w-3" />
                        <span>{trend.orders} orders</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3 w-3" />
                        <span>{trend.visits} visits</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
