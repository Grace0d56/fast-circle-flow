import { FastingSession } from '@/hooks/useFasting';
import { calculateStats } from '@/lib/stats';
import { calculateTotalFatBurned } from '@/lib/fatEstimate';
import { WeightTracker, WeightEntry } from '@/components/WeightTracker';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Flame, Clock, Target, Trophy, Scale, Trash2, Download } from 'lucide-react';
import { ConfirmDialog } from '@/components/ConfirmDialog';

interface StatsViewProps {
  sessions: FastingSession[];
  weightEntries: WeightEntry[];
  onAddWeightEntry: (entry: Omit<WeightEntry, 'id' | 'date'>) => void;
  onUpdateWeightEntry?: (entryId: string, updates: Partial<Omit<WeightEntry, 'id'>>) => void;
  onDeleteWeightEntry?: (entryId: string) => void;
  onClearHistory: () => void;
  onClearWeightEntries: () => void;
}

type Period = 'week' | 'month' | '3months' | '6months' | 'year' | 'all';

export const StatsView = ({
  sessions,
  weightEntries,
  onAddWeightEntry,
  onUpdateWeightEntry,
  onDeleteWeightEntry,
  onClearHistory,
  onClearWeightEntries,
}: StatsViewProps) => {
  const [period, setPeriod] = useState<Period>('week');
  const [clearHistoryOpen, setClearHistoryOpen] = useState(false);
  const [clearWeightOpen, setClearWeightOpen] = useState(false);

  // Export data function
  const handleExportData = () => {
    const exportData = {
      exportDate: new Date().toISOString(),
      appName: 'FastTrack',
      sessions: sessions,
      weightEntries: weightEntries,
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download = `fasttrack-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const stats = calculateStats(sessions, period);

  // Get latest weight/body fat for better fat estimation
  const latestWeight = weightEntries[0];
  const fatBurnOptions = latestWeight ? {
    weightKg: latestWeight.weight,
    bodyFatPct: latestWeight.fatPercentage,
  } : undefined;

  // Filter sessions by period for fat calculation
  const getStartDate = (period: Period): Date => {
    const now = new Date();
    switch (period) {
      case 'week':
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay());
        weekStart.setHours(0, 0, 0, 0);
        return weekStart;
      case 'month':
        return new Date(now.getFullYear(), now.getMonth(), 1);
      case '3months':
        return new Date(now.getFullYear(), now.getMonth() - 3, 1);
      case '6months':
        return new Date(now.getFullYear(), now.getMonth() - 6, 1);
      case 'year':
        return new Date(now.getFullYear(), 0, 1);
      default:
        return new Date(0);
    }
  };

  const startDate = getStartDate(period);
  const filteredSessions = sessions.filter(
    s => s.endTime !== null && s.endTime >= startDate.getTime()
  );

  const totalFatBurned = calculateTotalFatBurned(
    filteredSessions,
    fatBurnOptions
  );

  const periods: { value: Period; label: string }[] = [
    { value: 'week', label: 'Week' },
    { value: 'month', label: 'Month' },
    { value: '3months', label: '3 Mon' },
    { value: '6months', label: '6 Mon' },
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
      subValue: 'in a row',
      color: 'text-success'
    },
    {
      icon: Scale,
      label: 'Fat Burned',
      value: `~${Math.round(totalFatBurned)}g`,
      subValue: 'estimated total',
      color: 'text-warning'
    },
  ];

  return (
    <div className="space-y-4">
      {/* Period selector */}
      <div className="flex gap-1.5 justify-center">
        {periods.map(({ value, label }) => (
          <Button
            key={value}
            variant={period === value ? 'default' : 'glass'}
            size="sm"
            onClick={() => setPeriod(value)}
            className="min-w-[50px] px-3 text-xs sm:text-sm"
          >
            {label}
          </Button>
        ))}
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3">
        {statCards.map((stat, index) => (
          <div
            key={stat.label}
            className={`glass rounded-xl p-3 sm:p-4 animate-fade-in-up ${index === statCards.length - 1 && statCards.length % 2 === 1 ? 'col-span-2' : ''
              }`}
          >
            <div className="flex items-center gap-1.5 mb-1.5">
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
              <span className="text-xs text-muted-foreground">{stat.label}</span>
            </div>
            <p className="text-xl sm:text-2xl font-display font-bold text-foreground">
              {stat.value}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">{stat.subValue}</p>
          </div>
        ))}
      </div>

      {/* Weight Tracker */}
      <WeightTracker
        entries={weightEntries}
        onAddEntry={onAddWeightEntry}
        onUpdateEntry={onUpdateWeightEntry}
        onDeleteEntry={onDeleteWeightEntry}
      />

      {/* Export Data */}
      <div className="glass rounded-xl p-4 space-y-3">
        <h3 className="font-medium text-foreground flex items-center gap-2 text-sm">
          <Download className="w-4 h-4 text-primary" />
          Backup Data
        </h3>
        <Button
          variant="glass"
          size="sm"
          onClick={handleExportData}
          disabled={sessions.length === 0 && weightEntries.length === 0}
          className="w-full text-xs"
        >
          Export as JSON
        </Button>
        <p className="text-xs text-muted-foreground">
          Download your fasting history and weight data
        </p>
      </div>

      {/* Clear Data */}
      <div className="glass rounded-xl p-4 space-y-3">
        <h3 className="font-medium text-foreground flex items-center gap-2 text-sm">
          <Trash2 className="w-4 h-4 text-destructive" />
          Clear Data
        </h3>
        <div className="flex gap-2">
          <Button
            variant="glass"
            size="sm"
            onClick={() => setClearHistoryOpen(true)}
            disabled={sessions.length === 0}
            className="flex-1 text-xs"
          >
            Clear Fasting
          </Button>
          <Button
            variant="glass"
            size="sm"
            onClick={() => setClearWeightOpen(true)}
            disabled={weightEntries.length === 0}
            className="flex-1 text-xs"
          >
            Clear Weight
          </Button>
        </div>
      </div>

      {/* Confirmation Dialogs */}
      <ConfirmDialog
        open={clearHistoryOpen}
        onOpenChange={setClearHistoryOpen}
        title="Clear Fasting History?"
        description="This will permanently delete all your fasting sessions. This action cannot be undone."
        confirmText="Yes, Clear"
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
        confirmText="Yes, Clear"
        variant="destructive"
        onConfirm={() => {
          onClearWeightEntries();
          setClearWeightOpen(false);
        }}
      />
    </div>
  );
};
