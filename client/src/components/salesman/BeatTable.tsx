import { useState } from 'react';
import { Eye, MapPin } from 'lucide-react';
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
import { useSelector } from 'react-redux';
import { RootState } from '@/app/store';
import { StoreVisitForm } from './StoreVisitForm';

export const BeatTable = () => {
  const { beats } = useSelector((state: RootState) => state.salesman);
  const [visitFormOpen, setVisitFormOpen] = useState(false);
  const [selectedBeat, setSelectedBeat] = useState<any>(null);

  const handleLogVisit = (beat: any) => {
    setSelectedBeat(beat);
    setVisitFormOpen(true);
  };

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
                      {beat.areaName}
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
