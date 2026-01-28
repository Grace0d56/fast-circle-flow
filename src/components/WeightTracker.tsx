import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Scale, Plus, TrendingDown, TrendingUp, Minus, ChevronRight } from 'lucide-react';
import { formatDate } from '@/lib/time';
import { WeightDetailView } from './WeightDetailView';

export interface WeightEntry {
  id: string;
  date: number;
  weight: number;
  fatPercentage?: number;
}

interface WeightTrackerProps {
  entries: WeightEntry[];
  onAddEntry: (entry: Omit<WeightEntry, 'id' | 'date'>) => void;
  onUpdateEntry?: (entryId: string, updates: Partial<Omit<WeightEntry, 'id'>>) => void;
  onDeleteEntry?: (entryId: string) => void;
}

export const WeightTracker = ({ entries, onAddEntry, onUpdateEntry, onDeleteEntry }: WeightTrackerProps) => {
  const [open, setOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [weight, setWeight] = useState('');
  const [fatPercentage, setFatPercentage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!weight) return;

    onAddEntry({
      weight: parseFloat(weight),
      fatPercentage: fatPercentage ? parseFloat(fatPercentage) : undefined,
    });

    setWeight('');
    setFatPercentage('');
    setOpen(false);
  };

  const latestEntry = entries[0];
  const previousEntry = entries[1];

  const weightChange = latestEntry && previousEntry
    ? latestEntry.weight - previousEntry.weight
    : null;

  const getTrendIcon = () => {
    if (!weightChange) return <Minus className="w-4 h-4 text-muted-foreground" />;
    if (weightChange < 0) return <TrendingDown className="w-4 h-4 text-success" />;
    if (weightChange > 0) return <TrendingUp className="w-4 h-4 text-warning" />;
    return <Minus className="w-4 h-4 text-muted-foreground" />;
  };

  const handleLogClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setOpen(true);
  };

  return (
    <>
      {/* Log Weight Dialog - moved outside the clickable card */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>Log Weight</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                step="0.1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="e.g., 65.5"
                required
              />
            </div>
            <div>
              <Label htmlFor="fatPercentage">Body Fat % (optional)</Label>
              <Input
                id="fatPercentage"
                type="number"
                step="0.1"
                value={fatPercentage}
                onChange={(e) => setFatPercentage(e.target.value)}
                placeholder="e.g., 22.5"
              />
            </div>
            <Button type="submit" className="w-full">
              Save Entry
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <div
        className="glass rounded-xl p-4 cursor-pointer hover:bg-card/80 transition-colors active:scale-[0.98]"
        onClick={() => setDetailOpen(true)}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Scale className="w-5 h-5 text-primary" />
            <h3 className="font-medium text-foreground">Weight Tracker</h3>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="glass" size="sm" onClick={handleLogClick}>
              <Plus className="w-4 h-4 mr-1" />
              Log
            </Button>
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>

        {latestEntry ? (
          <div className="space-y-2">
            <div className="flex items-end gap-2">
              <span className="text-2xl font-display font-bold text-foreground">
                {latestEntry.weight}
              </span>
              <span className="text-muted-foreground mb-0.5">kg</span>
              {getTrendIcon()}
              {weightChange !== null && weightChange !== 0 && (
                <span className={`text-sm mb-0.5 ${weightChange < 0 ? 'text-success' : 'text-warning'}`}>
                  {weightChange > 0 ? '+' : ''}{weightChange.toFixed(1)}
                </span>
              )}
            </div>
            {latestEntry.fatPercentage && (
              <p className="text-sm text-muted-foreground">
                Body Fat: {latestEntry.fatPercentage}%
              </p>
            )}
            <p className="text-xs text-muted-foreground/70">
              Updated: {formatDate(latestEntry.date)}
            </p>
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">
            No entries yet. Log your first weight!
          </p>
        )}

        {entries.length > 0 && (
          <p className="text-xs text-primary mt-2">Tap to view trends →</p>
        )}
      </div>

      <WeightDetailView
        entries={entries}
        open={detailOpen}
        onOpenChange={setDetailOpen}
        onUpdateEntry={onUpdateEntry}
        onDeleteEntry={onDeleteEntry}
      />
    </>
  );
};
