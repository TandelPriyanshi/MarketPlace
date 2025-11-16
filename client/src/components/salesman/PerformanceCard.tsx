import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Target, TrendingUp, MapPin, Loader2, AlertCircle } from 'lucide-react';
import { useSalesmanPerformance } from '@/hooks/use-salesman-performance';

export const PerformanceCard = () => {
  const { data: performanceData, isLoading, isError, error } = useSalesmanPerformance();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
            <span className="ml-2 text-muted-foreground">Loading performance...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <AlertCircle className="h-6 w-6 text-destructive" />
            <span className="ml-2 text-destructive">
              {error instanceof Error ? error.message : 'Failed to load performance data'}
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const performance = performanceData?.data;
  if (!performance) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground py-8">
            No performance data available.
          </div>
        </CardContent>
      </Card>
    );
  }

  const targetVisits = 50;
  const targetOrders = 30;
  const targetStores = 20;

  const visitsProgress = (performance.visitsCompleted / targetVisits) * 100;
  const ordersProgress = (performance.totalOrdersPlaced / targetOrders) * 100;
  const storesProgress = (performance.storesCovered / targetStores) * 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          Performance Metrics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Store Visits</span>
            <span className="font-medium">
              {performance.visitsCompleted} / {targetVisits}
            </span>
          </div>
          <Progress value={Math.min(visitsProgress, 100)} className="h-2" />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              Orders Placed
            </span>
            <span className="font-medium">
              {performance.totalOrdersPlaced} / {targetOrders}
            </span>
          </div>
          <Progress value={Math.min(ordersProgress, 100)} className="h-2" />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              Stores Covered
            </span>
            <span className="font-medium">
              {performance.storesCovered} / {targetStores}
            </span>
          </div>
          <Progress value={Math.min(storesProgress, 100)} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
};