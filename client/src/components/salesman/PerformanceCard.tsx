import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Target, TrendingUp, MapPin } from 'lucide-react';

interface PerformanceCardProps {
  performance: {
    totalVisits: number;
    ordersGenerated: number;
    beatsCompleted: number;
  };
}

export const PerformanceCard = ({ performance }: PerformanceCardProps) => {
  const targetVisits = 50;
  const targetOrders = 30;
  const targetBeats = 5;

  const visitsProgress = (performance.totalVisits / targetVisits) * 100;
  const ordersProgress = (performance.ordersGenerated / targetOrders) * 100;
  const beatsProgress = (performance.beatsCompleted / targetBeats) * 100;

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
              {performance.totalVisits} / {targetVisits}
            </span>
          </div>
          <Progress value={visitsProgress} className="h-2" />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              Orders Generated
            </span>
            <span className="font-medium">
              {performance.ordersGenerated} / {targetOrders}
            </span>
          </div>
          <Progress value={ordersProgress} className="h-2" />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              Beats Completed
            </span>
            <span className="font-medium">
              {performance.beatsCompleted} / {targetBeats}
            </span>
          </div>
          <Progress value={beatsProgress} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
};
