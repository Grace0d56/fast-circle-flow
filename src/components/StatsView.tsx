import { FastingSession } from '@/hooks/useFasting';
import { calculateStats } from '@/lib/stats';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Flame, Clock, Target, Trophy } from 'lucide-react';

interface StatsViewProps {
  sessions: FastingSession[];
}

type Period = 'week' | 'month' | 'year' | 'all';

export const StatsView = ({ sessions }: StatsViewProps) => {
  const [period, setPeriod] = useState<Period>('week');
  const stats = calculateStats(sessions, period);

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
            className={`glass rounded-xl p-4 animate-fade-in-up animation-delay-${index * 100}`}
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
    </div>
  );
};
