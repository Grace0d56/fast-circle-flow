import { WeightEntry } from '@/components/WeightTracker';
import { formatDate } from '@/lib/time';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ArrowLeft, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface WeightDetailViewProps {
  entries: WeightEntry[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const WeightDetailView = ({ entries, open, onOpenChange }: WeightDetailViewProps) => {
  // Reverse entries for chart (oldest first)
  const chartData = [...entries].reverse().map(entry => ({
    date: new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    weight: entry.weight,
    fatPercentage: entry.fatPercentage,
  }));

  const latestEntry = entries[0];
  const oldestEntry = entries[entries.length - 1];
  
  const weightChange = latestEntry && oldestEntry && entries.length > 1
    ? latestEntry.weight - oldestEntry.weight
    : null;
    
  const fatChange = latestEntry?.fatPercentage && oldestEntry?.fatPercentage && entries.length > 1
    ? latestEntry.fatPercentage - oldestEntry.fatPercentage
    : null;

  const getWeightTrendIcon = () => {
    if (!weightChange) return <Minus className="w-4 h-4 text-muted-foreground" />;
    if (weightChange < 0) return <TrendingDown className="w-4 h-4 text-success" />;
    return <TrendingUp className="w-4 h-4 text-warning" />;
  };

  const getFatTrendIcon = () => {
    if (!fatChange) return <Minus className="w-4 h-4 text-muted-foreground" />;
    if (fatChange < 0) return <TrendingDown className="w-4 h-4 text-success" />;
    return <TrendingUp className="w-4 h-4 text-warning" />;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            Weight & Body Fat Trends
          </DialogTitle>
        </DialogHeader>

        {entries.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No weight entries yet. Start tracking to see trends!
          </p>
        ) : (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="glass rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-1">Current Weight</p>
                <p className="text-2xl font-display font-bold text-foreground">
                  {latestEntry?.weight} kg
                </p>
                {weightChange !== null && (
                  <div className="flex items-center gap-1 mt-1">
                    {getWeightTrendIcon()}
                    <span className={`text-sm ${weightChange < 0 ? 'text-success' : weightChange > 0 ? 'text-warning' : 'text-muted-foreground'}`}>
                      {weightChange > 0 ? '+' : ''}{weightChange.toFixed(1)} kg total
                    </span>
                  </div>
                )}
              </div>
              
              <div className="glass rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-1">Current Body Fat</p>
                <p className="text-2xl font-display font-bold text-foreground">
                  {latestEntry?.fatPercentage ? `${latestEntry.fatPercentage}%` : '--'}
                </p>
                {fatChange !== null && (
                  <div className="flex items-center gap-1 mt-1">
                    {getFatTrendIcon()}
                    <span className={`text-sm ${fatChange < 0 ? 'text-success' : fatChange > 0 ? 'text-warning' : 'text-muted-foreground'}`}>
                      {fatChange > 0 ? '+' : ''}{fatChange.toFixed(1)}% total
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Weight Chart */}
            {chartData.length > 1 && (
              <div className="glass rounded-lg p-4">
                <h3 className="text-sm font-medium text-foreground mb-4">Weight Trend</h3>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="date" 
                        stroke="hsl(var(--muted-foreground))" 
                        fontSize={10}
                      />
                      <YAxis 
                        stroke="hsl(var(--muted-foreground))" 
                        fontSize={10}
                        domain={['dataMin - 1', 'dataMax + 1']}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                        labelStyle={{ color: 'hsl(var(--foreground))' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="weight" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={2}
                        dot={{ fill: 'hsl(var(--primary))', strokeWidth: 0 }}
                        activeDot={{ r: 6, fill: 'hsl(var(--primary))' }}
                        name="Weight (kg)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Body Fat Chart */}
            {chartData.filter(d => d.fatPercentage).length > 1 && (
              <div className="glass rounded-lg p-4">
                <h3 className="text-sm font-medium text-foreground mb-4">Body Fat % Trend</h3>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData.filter(d => d.fatPercentage)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis 
                        dataKey="date" 
                        stroke="hsl(var(--muted-foreground))" 
                        fontSize={10}
                      />
                      <YAxis 
                        stroke="hsl(var(--muted-foreground))" 
                        fontSize={10}
                        domain={['dataMin - 1', 'dataMax + 1']}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--card))', 
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                        labelStyle={{ color: 'hsl(var(--foreground))' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="fatPercentage" 
                        stroke="hsl(var(--warning))" 
                        strokeWidth={2}
                        dot={{ fill: 'hsl(var(--warning))', strokeWidth: 0 }}
                        activeDot={{ r: 6, fill: 'hsl(var(--warning))' }}
                        name="Body Fat (%)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}

            {/* Data Table */}
            <div className="glass rounded-lg p-4">
              <h3 className="text-sm font-medium text-foreground mb-3">All Entries</h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {entries.map((entry, index) => {
                  const prevEntry = entries[index + 1];
                  const change = prevEntry ? entry.weight - prevEntry.weight : null;
                  
                  return (
                    <div key={entry.id} className="flex justify-between items-center text-sm py-2 border-b border-border last:border-0">
                      <span className="text-muted-foreground">{formatDate(entry.date)}</span>
                      <div className="flex items-center gap-3">
                        <span className="text-foreground font-medium">{entry.weight} kg</span>
                        {entry.fatPercentage && (
                          <span className="text-muted-foreground">{entry.fatPercentage}%</span>
                        )}
                        {change !== null && change !== 0 && (
                          <span className={`text-xs ${change < 0 ? 'text-success' : 'text-warning'}`}>
                            {change > 0 ? '+' : ''}{change.toFixed(1)}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
