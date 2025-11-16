import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { MapPin, Plus, Edit, Eye, Calendar, Target, Users } from 'lucide-react';
import { RootState } from '@/app/store';
import { setBeats } from '@/app/slices/salesmanSlice';
import { getBeats } from '@/api/salesman.api';
import { toast } from 'sonner';

export const BeatManagement = () => {
  const dispatch = useDispatch();
  const { beats } = useSelector((state: RootState) => state.salesman);
  const [loading, setLoading] = useState(true);
  const [selectedBeat, setSelectedBeat] = useState<any>(null);

  useEffect(() => {
    fetchBeats();
  }, []);

  const fetchBeats = async () => {
    try {
      setLoading(true);
      const response = await getBeats();
      const transformedBeats = response.data.map((beat: any) => ({
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
      dispatch(setBeats(transformedBeats));
    } catch (error) {
      console.error('Error fetching beats:', error);
      toast.error('Failed to load beats');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateProgress = (beat: any) => {
    if (!beat.stores || beat.stores.length === 0) return 0;
    const visitedStores = beat.stores.filter((store: any) => store.lastVisitDate).length;
    return (visitedStores / beat.stores.length) * 100;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Beat Management</h2>
          <p className="text-muted-foreground">Manage your assigned beats and store coverage</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {beats.map((beat) => (
          <Card key={beat.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{beat.areaName}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Assigned on {new Date(beat.assignedAt).toLocaleDateString()}
                  </p>
                </div>
                <Badge className={getStatusColor('active')}>Active</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span>{beat.storeCount} Stores</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{beat.stores?.length || 0} Areas</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Coverage Progress</span>
                  <span>{Math.round(calculateProgress(beat))}%</span>
                </div>
                <Progress value={calculateProgress(beat)} />
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedBeat(beat)}
                  className="flex-1"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedBeat && (
        <Dialog open={!!selectedBeat} onOpenChange={() => setSelectedBeat(null)}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{selectedBeat.areaName}</DialogTitle>
            </DialogHeader>
            <BeatDetails beat={selectedBeat} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

const BeatDetails = ({ beat }: { beat: any }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium">Total Stores</Label>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-lg">{beat.storeCount}</span>
          </div>
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium">Assigned Date</Label>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{new Date(beat.assignedAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium">Stores in Beat</Label>
        <div className="space-y-2 max-h-60 overflow-y-auto">
          {beat.stores?.map((store: any) => (
            <div key={store.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="space-y-1">
                <div className="font-medium">{store.name}</div>
                <div className="text-sm text-muted-foreground">{store.address}</div>
                <div className="text-sm text-muted-foreground">{store.phone}</div>
              </div>
              <div className="text-right space-y-1">
                <Badge variant={store.lastVisitDate ? 'default' : 'secondary'}>
                  {store.lastVisitDate ? 'Visited' : 'Pending'}
                </Badge>
                {store.lastVisitDate && (
                  <div className="text-xs text-muted-foreground">
                    {new Date(store.lastVisitDate).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
