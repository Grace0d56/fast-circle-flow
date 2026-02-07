import { useState } from 'react';
import { FastingSession } from '@/hooks/useFasting';
import { formatDate, formatTimeOfDay, formatDuration } from '@/lib/time';
import { estimateFatBurned } from '@/lib/fatEstimate';
import { getReachedMilestones, getMilestoneColor } from '@/lib/milestones';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Check, X, Flame, Clock, Target, Calendar, Zap, Pencil, Trash2, Utensils, Activity } from 'lucide-react';
import { ConfirmDialog } from './ConfirmDialog';

interface SessionDetailProps {
  session: FastingSession | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate?: (sessionId: string, updates: Partial<Omit<FastingSession, 'id'>>) => void;
  onDelete?: (sessionId: string) => void;
  latestWeight?: { weight: number; fatPercentage?: number };
}

const MEAL_LABELS = {
  light: 'Light',
  normal: 'Normal',
  heavy: 'Heavy',
};

const ACTIVITY_LABELS = {
  sedentary: 'Sedentary',
  light: 'Light',
  moderate: 'Moderate',
  high: 'High',
};

export const SessionDetail = ({ session, open, onOpenChange, onUpdate, onDelete, latestWeight }: SessionDetailProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [editStartDate, setEditStartDate] = useState('');
  const [editStartTime, setEditStartTime] = useState('');
  const [editEndDate, setEditEndDate] = useState('');
  const [editEndTime, setEditEndTime] = useState('');

  if (!session) return null;

  const duration = session.endTime! - session.startTime;
  const hours = duration / (1000 * 60 * 60);

  // Use new fat estimate with meal type and activity level
  const fatEstimate = estimateFatBurned(
    duration,
    session.lastMealType,
    session.activityLevel,
    latestWeight ? {
      weightKg: latestWeight.weight,
      bodyFatPct: latestWeight.fatPercentage,
    } : undefined
  );

  const milestones = getReachedMilestones(hours);

  // Format fat burned display
  const formatFatBurned = () => {
    const lower = Math.round(fatEstimate.lowerGrams);
    const upper = Math.round(fatEstimate.upperGrams);

    if (lower === 0 && upper === 0) return '0g';
    if (lower === upper) return `~${lower}g`;
    return `~${lower}-${upper}g`;
  };

  const handleStartEdit = () => {
    const start = new Date(session.startTime);
    const end = new Date(session.endTime!);

    setEditStartDate(start.toISOString().split('T')[0]);
    setEditStartTime(start.toTimeString().slice(0, 5));
    setEditEndDate(end.toISOString().split('T')[0]);
    setEditEndTime(end.toTimeString().slice(0, 5));
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (!onUpdate) return;

    const newStartTime = new Date(`${editStartDate}T${editStartTime}`).getTime();
    const newEndTime = new Date(`${editEndDate}T${editEndTime}`).getTime();

    if (newEndTime <= newStartTime) return;

    onUpdate(session.id, {
      startTime: newStartTime,
      endTime: newEndTime,
    });
    setIsEditing(false);
  };

  const handleDelete = () => {
    if (!onDelete) return;
    onDelete(session.id);
    setDeleteConfirmOpen(false);
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md mx-auto bg-card border-border max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Fast Details
              </div>
              <div className="flex gap-1">
                {!isEditing && onUpdate && (
                  <Button variant="ghost" size="sm" onClick={handleStartEdit}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                )}
                {onDelete && (
                  <Button variant="ghost" size="sm" onClick={() => setDeleteConfirmOpen(true)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                )}
              </div>
            </DialogTitle>
          </DialogHeader>

          {isEditing ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={editStartDate}
                    onChange={(e) => setEditStartDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Start Time</Label>
                  <Input
                    type="time"
                    value={editStartTime}
                    onChange={(e) => setEditStartTime(e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={editEndDate}
                    onChange={(e) => setEditEndDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label>End Time</Label>
                  <Input
                    type="time"
                    value={editEndTime}
                    onChange={(e) => setEditEndTime(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="glass" onClick={() => setIsEditing(false)} className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleSaveEdit} className="flex-1">
                  Save
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Duration & Status */}
              <div className="glass rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-display font-bold text-foreground">
                      {formatDuration(duration)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Goal: {session.goalHours}h
                    </p>
                  </div>
                  {session.completed ? (
                    <div className="flex items-center gap-2 text-success">
                      <Check className="w-5 h-5" />
                      <span className="font-medium">Completed</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <X className="w-5 h-5" />
                      <span>Ended Early</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Time Details */}
              <div className="grid grid-cols-2 gap-3">
                <div className="glass rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-4 h-4 text-primary" />
                    <span className="text-xs text-muted-foreground">Started</span>
                  </div>
                  <p className="font-medium text-foreground">
                    {formatTimeOfDay(session.startTime)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(session.startTime)}
                  </p>
                </div>
                <div className="glass rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Target className="w-4 h-4 text-primary" />
                    <span className="text-xs text-muted-foreground">Ended</span>
                  </div>
                  <p className="font-medium text-foreground">
                    {formatTimeOfDay(session.endTime!)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatDate(session.endTime!)}
                  </p>
                </div>
              </div>

              {/* Meal & Activity */}
              <div className="grid grid-cols-2 gap-3">
                <div className="glass rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Utensils className="w-4 h-4 text-primary" />
                    <span className="text-xs text-muted-foreground">Last Meal</span>
                  </div>
                  <p className="font-medium text-foreground">
                    {MEAL_LABELS[session.lastMealType]}
                  </p>
                </div>
                <div className="glass rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Activity className="w-4 h-4 text-primary" />
                    <span className="text-xs text-muted-foreground">Activity</span>
                  </div>
                  <p className="font-medium text-foreground">
                    {ACTIVITY_LABELS[session.activityLevel]}
                  </p>
                </div>
              </div>

              {/* Fat Burned Estimate */}
              <div className="glass rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Flame className="w-4 h-4 text-warning" />
                  <span className="text-sm text-muted-foreground">Estimated Fat Burned</span>
                </div>
                <p className="text-2xl font-display font-bold text-foreground">
                  {formatFatBurned()}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {fatEstimate.caloriesBurned} kcal • {fatEstimate.adjustedHours}h adjusted fasting time
                </p>
              </div>

              {/* Milestones Reached */}
              {milestones.length > 0 && (
                <div className="glass rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Zap className="w-4 h-4 text-primary" />
                    <span className="text-sm text-muted-foreground">
                      Milestones ({milestones.length})
                    </span>
                  </div>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {milestones.slice().reverse().map((milestone) => (
                      <div
                        key={milestone.hours}
                        className="flex items-center gap-3 py-1"
                      >
                        <div
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: getMilestoneColor(milestone.icon) }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {milestone.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {milestone.hours}h
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Delete Fast Record?"
        description="This will permanently delete this fasting session. This action cannot be undone."
        confirmText="Delete"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </>
  );
};