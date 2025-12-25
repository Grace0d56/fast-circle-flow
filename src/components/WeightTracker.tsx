import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Scale, Plus, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { formatDate } from '@/lib/time';

export interface WeightEntry {
  id: string;
  date: number;
  weight: number;
  fatMass?: number;
  fatPercentage?: number;
}

interface WeightTrackerProps {
  entries: WeightEntry[];
  onAddEntry: (entry: Omit<WeightEntry, 'id' | 'date'>) => void;
}

export const WeightTracker = ({ entries, onAddEntry }: WeightTrackerProps) => {
  const [open, setOpen] = useState(false);
  const [weight, setWeight] = useState('');
  const [fatMass, setFatMass] = useState('');
  const [fatPercentage, setFatPercentage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!weight) return;

    onAddEntry({
      weight: parseFloat(weight),
      fatMass: fatMass ? parseFloat(fatMass) : undefined,
      fatPercentage: fatPercentage ? parseFloat(fatPercentage) : undefined,
    });

    setWeight('');
    setFatMass('');
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

  return (
    <div className="glass rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Scale className="w-5 h-5 text-primary" />
          <h3 className="font-medium text-foreground">Weight Tracker</h3>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="glass" size="sm">
              <Plus className="w-4 h-4 mr-1" />
              Log
            </Button>
          </DialogTrigger>
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
                <Label htmlFor="fatMass">Fat Mass (kg) - Optional</Label>
                <Input
                  id="fatMass"
                  type="number"
                  step="0.1"
                  value={fatMass}
                  onChange={(e) => setFatMass(e.target.value)}
                  placeholder="e.g., 15.2"
                />
              </div>
              <div>
                <Label htmlFor="fatPercentage">Body Fat % - Optional</Label>
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
      </div>

      {latestEntry ? (
        <div className="space-y-3">
          <div className="flex items-end gap-2">
            <span className="text-3xl font-display font-bold text-foreground">
              {latestEntry.weight}
            </span>
            <span className="text-muted-foreground mb-1">kg</span>
            {getTrendIcon()}
            {weightChange !== null && weightChange !== 0 && (
              <span className={`text-sm mb-1 ${weightChange < 0 ? 'text-success' : 'text-warning'}`}>
                {weightChange > 0 ? '+' : ''}{weightChange.toFixed(1)}
              </span>
            )}
          </div>
          {(latestEntry.fatMass || latestEntry.fatPercentage) && (
            <div className="flex gap-4 text-sm text-muted-foreground">
              {latestEntry.fatMass && <span>Fat: {latestEntry.fatMass}kg</span>}
              {latestEntry.fatPercentage && <span>Body Fat: {latestEntry.fatPercentage}%</span>}
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            Last updated: {formatDate(latestEntry.date)}
          </p>
        </div>
      ) : (
        <p className="text-muted-foreground text-sm">
          No entries yet. Log your first weight!
        </p>
      )}

      {entries.length > 1 && (
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-xs text-muted-foreground mb-2">Recent entries</p>
          <div className="space-y-2">
            {entries.slice(0, 5).map((entry) => (
              <div key={entry.id} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{formatDate(entry.date)}</span>
                <span className="text-foreground font-medium">{entry.weight} kg</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
