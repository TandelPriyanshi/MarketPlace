import { useState } from 'react';
import { Eye, MapPin, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/utils/helpers';
import { useSalesmanBeats } from '@/hooks/use-salesman-beats';
import { StoreVisitForm } from './StoreVisitForm';

export const BeatTable = () => {
  const { data: beatsData, isLoading, isError, error } = useSalesmanBeats();
  const [visitFormOpen, setVisitFormOpen] = useState(false);
  const [selectedBeat, setSelectedBeat] = useState<any>(null);

  const handleLogVisit = (beat: any) => {
    setSelectedBeat(beat);
    setVisitFormOpen(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">My Beats</h2>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2 text-muted-foreground">Loading beats...</span>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">My Beats</h2>
        <div className="flex items-center justify-center py-12">
          <AlertCircle className="h-8 w-8 text-destructive" />
          <span className="ml-2 text-destructive">
            {error instanceof Error ? error.message : 'Failed to load beats'}
          </span>
        </div>
      </div>
    );
  }

  const beats = beatsData?.data || [];

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">My Beats</h2>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Beat ID</TableHead>
              <TableHead>Area</TableHead>
              <TableHead>Store Count</TableHead>
              <TableHead>Assigned Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {beats.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  No beats assigned yet.
                </TableCell>
              </TableRow>
            ) : (
              beats.map((beat) => (
                <TableRow key={beat.id}>
                  <TableCell className="font-mono text-sm">{beat.id}</TableCell>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      {beat.area}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{beat.storeCount} stores</Badge>
                  </TableCell>
                  <TableCell>{formatDate(beat.assignedAt)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleLogVisit(beat)}
                        className="gap-1"
                      >
                        <Eye className="h-3 w-3" />
                        View Stores
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleLogVisit(beat)}
                        className="gap-1"
                      >
                        Log Visit
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {selectedBeat && (
        <StoreVisitForm
          isOpen={visitFormOpen}
          onClose={() => { setVisitFormOpen(false); setSelectedBeat(null); }}
          beat={selectedBeat}
        />
      )}
    </div>
  );
};