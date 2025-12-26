import { useState } from 'react';
import { WeightEntry } from '@/components/WeightTracker';
import { formatDate } from '@/lib/time';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, TrendingDown, TrendingUp, Minus, Pencil, Trash2, X, Check } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ConfirmDialog } from './ConfirmDialog';

interface WeightDetailViewProps {
  entries: WeightEntry[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdateEntry?: (entryId: string, updates: Partial<Omit<WeightEntry, 'id'>>) => void;
  onDeleteEntry?: (entryId: string) => void;
}

export const WeightDetailView = ({ entries, open, onOpenChange, onUpdateEntry, onDeleteEntry }: WeightDetailViewProps) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editWeight, setEditWeight] = useState('');
  const [editFatPct, setEditFatPct] = useState('');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

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

  const handleStartEdit = (entry: WeightEntry) => {
    setEditingId(entry.id);
    setEditWeight(entry.weight.toString());
    setEditFatPct(entry.fatPercentage?.toString() || '');
  };

  const handleSaveEdit = (entryId: string) => {
    if (!onUpdateEntry) return;
    onUpdateEntry(entryId, {
      weight: parseFloat(editWeight),
      fatPercentage: editFatPct ? parseFloat(editFatPct) : undefined,
    });
    setEditingId(null);
  };

  const handleDeleteClick = (entryId: string) => {
    setDeleteTargetId(entryId);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (deleteTargetId && onDeleteEntry) {
      onDeleteEntry(deleteTargetId);
    }
    setDeleteConfirmOpen(false);
    setDeleteTargetId(null);
  };

  return (
    <>
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
            <div className="space-y-5">
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
                        {weightChange > 0 ? '+' : ''}{weightChange.toFixed(1)} kg
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="glass rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">Body Fat</p>
                  <p className="text-2xl font-display font-bold text-foreground">
                    {latestEntry?.fatPercentage ? `${latestEntry.fatPercentage}%` : '--'}
                  </p>
                  {fatChange !== null && (
                    <div className="flex items-center gap-1 mt-1">
                      {getFatTrendIcon()}
                      <span className={`text-sm ${fatChange < 0 ? 'text-success' : fatChange > 0 ? 'text-warning' : 'text-muted-foreground'}`}>
                        {fatChange > 0 ? '+' : ''}{fatChange.toFixed(1)}%
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Weight Chart */}
              {chartData.length > 1 && (
                <div className="glass rounded-lg p-4">
                  <h3 className="text-sm font-medium text-foreground mb-4">Weight Trend</h3>
                  <div className="h-40">
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
                          dot={{ fill: 'hsl(var(--primary))', strokeWidth: 0, r: 3 }}
                          activeDot={{ r: 5, fill: 'hsl(var(--primary))' }}
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
                  <div className="h-40">
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
                          dot={{ fill: 'hsl(var(--warning))', strokeWidth: 0, r: 3 }}
                          activeDot={{ r: 5, fill: 'hsl(var(--warning))' }}
                          name="Body Fat (%)"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              {/* Data Table with Edit/Delete */}
              <div className="glass rounded-lg p-4">
                <h3 className="text-sm font-medium text-foreground mb-3">All Entries</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {entries.map((entry) => {
                    const isEditing = editingId === entry.id;
                    
                    return (
                      <div key={entry.id} className="flex items-center gap-2 py-2 border-b border-border last:border-0">
                        {isEditing ? (
                          <>
                            <div className="flex-1 grid grid-cols-2 gap-2">
                              <Input
                                type="number"
                                step="0.1"
                                value={editWeight}
                                onChange={(e) => setEditWeight(e.target.value)}
                                className="h-8 text-sm"
                                placeholder="kg"
                              />
                              <Input
                                type="number"
                                step="0.1"
                                value={editFatPct}
                                onChange={(e) => setEditFatPct(e.target.value)}
                                className="h-8 text-sm"
                                placeholder="%"
                              />
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => handleSaveEdit(entry.id)}>
                              <Check className="w-4 h-4 text-success" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => setEditingId(null)}>
                              <X className="w-4 h-4" />
                            </Button>
                          </>
                        ) : (
                          <>
                            <span className="text-sm text-muted-foreground flex-shrink-0 w-20">
                              {formatDate(entry.date)}
                            </span>
                            <div className="flex-1 flex items-center gap-3">
                              <span className="text-foreground font-medium">{entry.weight} kg</span>
                              {entry.fatPercentage && (
                                <span className="text-muted-foreground text-sm">{entry.fatPercentage}%</span>
                              )}
                            </div>
                            {onUpdateEntry && (
                              <Button variant="ghost" size="sm" onClick={() => handleStartEdit(entry)}>
                                <Pencil className="w-3 h-3" />
                              </Button>
                            )}
                            {onDeleteEntry && (
                              <Button variant="ghost" size="sm" onClick={() => handleDeleteClick(entry.id)}>
                                <Trash2 className="w-3 h-3 text-destructive" />
                              </Button>
                            )}
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Delete Weight Entry?"
        description="This will permanently delete this weight entry. This action cannot be undone."
        confirmText="Delete"
        variant="destructive"
        onConfirm={handleConfirmDelete}
      />
    </>
  );
};
