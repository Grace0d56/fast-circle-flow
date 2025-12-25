import { FastingSession } from '@/hooks/useFasting';
import { calculateStats } from '@/lib/stats';
import { calculateTotalFatBurned } from '@/lib/fatEstimate';
import { WeightTracker, WeightEntry } from '@/components/WeightTracker';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Flame, Clock, Target, Trophy, Scale, Trash2 } from 'lucide-react';
import { ConfirmDialog } from '@/components/ConfirmDialog';

interface StatsViewProps {
  sessions: FastingSession[];
  weightEntries: WeightEntry[];
  onAddWeightEntry: (entry: Omit<WeightEntry, 'id' | 'date'>) => void;
  onClearHistory: () => void;
  onClearWeightEntries: () => void;
}

type Period = 'week' | 'month' | 'year' | 'all';

export const StatsView = ({ 
  sessions, 
  weightEntries,
  onAddWeightEntry,
  onClearHistory,
  onClearWeightEntries,
}: StatsViewProps) => {
  const [period, setPeriod] = useState<Period>('week');
  const [clearHistoryOpen, setClearHistoryOpen] = useState(false);
  const [clearWeightOpen, setClearWeightOpen] = useState(false);
  
  const stats = calculateStats(sessions, period);
  const totalFatBurned = calculateTotalFatBurned(
    sessions.filter(s => s.endTime !== null)
  );

  const periods: { value: Period; label: string }[] = [
    { value: 'week', label: 'Week' },
    { value: 'month', label: 'Month' },
    { value: 'year', label: 'Year' },
    { value: 'all', label: 'All' },
  ];

  const statCards = [
    { 
      icon: Target, 
      label: 'Fasts', 
      value: stats.totalFasts,
      subValue: `${stats.completedFasts} completed`,
      color: 'text-primary' 
    },
    { 
      icon: Clock, 
      label: 'Total Hours', 
      value: stats.totalHours,
      subValue: `${stats.averageDuration}h avg`,
      color: 'text-primary' 
    },
    { 
      icon: Trophy, 
      label: 'Longest', 
      value: `${stats.longestFast}h`,
      subValue: 'personal best',
      color: 'text-warning' 
    },
    { 
      icon: Flame, 
      label: 'Streak', 
      value: stats.currentStreak,
      subValue: 'completed in a row',
      color: 'text-success' 
    },
    {
      icon: Scale,
      label: 'Fat Burned',
      value: `~${Math.round(totalFatBurned)}g`,
      subValue: 'conservative estimate',
      color: 'text-warning'
    },
  ];

  return (
    <div className="space-y-4">
      {/* Period selector */}
      <div className="flex gap-2 justify-center">
        {periods.map(({ value, label }) => (
          <Button
            key={value}
            variant={period === value ? 'default' : 'glass'}
            size="sm"
            onClick={() => setPeriod(value)}
            className="min-w-[60px]"
          >
            {label}
          </Button>
        ))}
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        {statCards.map((stat, index) => (
          <div
            key={stat.label}
            className={`glass rounded-xl p-4 animate-fade-in-up ${
              index === statCards.length - 1 && statCards.length % 2 === 1 ? 'col-span-2' : ''
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
              <span className="text-sm text-muted-foreground">{stat.label}</span>
            </div>
            <p className="text-2xl font-display font-bold text-foreground">
              {stat.value}
            </p>
            <p className="text-xs text-muted-foreground mt-1">{stat.subValue}</p>
          </div>
        ))}
      </div>

      {/* Weight Tracker */}
      <WeightTracker 
        entries={weightEntries} 
        onAddEntry={onAddWeightEntry}
      />

      {/* Clear Data */}
      <div className="glass rounded-xl p-4 space-y-3">
        <h3 className="font-medium text-foreground flex items-center gap-2">
          <Trash2 className="w-4 h-4 text-destructive" />
          Clear Data
        </h3>
        <div className="flex gap-2">
          <Button
            variant="glass"
            size="sm"
            onClick={() => setClearHistoryOpen(true)}
            disabled={sessions.length === 0}
            className="flex-1"
          >
            Clear Fasting History
          </Button>
          <Button
            variant="glass"
            size="sm"
            onClick={() => setClearWeightOpen(true)}
            disabled={weightEntries.length === 0}
            className="flex-1"
          >
            Clear Weight Data
          </Button>
        </div>
      </div>

      {/* Confirmation Dialogs */}
      <ConfirmDialog
        open={clearHistoryOpen}
        onOpenChange={setClearHistoryOpen}
        title="Clear Fasting History?"
        description="This will permanently delete all your fasting sessions. This action cannot be undone."
        confirmText="Yes, Clear History"
        variant="destructive"
        onConfirm={() => {
          onClearHistory();
          setClearHistoryOpen(false);
        }}
      />

      <ConfirmDialog
        open={clearWeightOpen}
        onOpenChange={setClearWeightOpen}
        title="Clear Weight Data?"
        description="This will permanently delete all your weight entries. This action cannot be undone."
        confirmText="Yes, Clear Data"
        variant="destructive"
        onConfirm={() => {
          onClearWeightEntries();
          setClearWeightOpen(false);
        }}
      />
    </div>
  );
};
