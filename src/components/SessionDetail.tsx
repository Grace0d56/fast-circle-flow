import { FastingSession } from '@/hooks/useFasting';
import { formatDate, formatTimeOfDay, formatDuration } from '@/lib/time';
import { estimateFatBurned } from '@/lib/fatEstimate';
import { getReachedMilestones, getMilestoneColor } from '@/lib/milestones';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Check, X, Flame, Clock, Target, Calendar, Zap } from 'lucide-react';

interface SessionDetailProps {
  session: FastingSession | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SessionDetail = ({ session, open, onOpenChange }: SessionDetailProps) => {
  if (!session) return null;

  const duration = session.endTime! - session.startTime;
  const hours = duration / (1000 * 60 * 60);
  const fatEstimate = estimateFatBurned(duration);
  const milestones = getReachedMilestones(hours);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md mx-auto bg-card border-border">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Fast Details
          </DialogTitle>
        </DialogHeader>

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

          {/* Fat Burned Estimate */}
          <div className="glass rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Flame className="w-4 h-4 text-warning" />
              <span className="text-sm text-muted-foreground">Estimated Fat Burned</span>
            </div>
            <p className="text-2xl font-display font-bold text-foreground">
              ~{fatEstimate.totalGrams}g
            </p>
            {fatEstimate.ketosisHours > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                {fatEstimate.ketosisHours.toFixed(1)}h in ketosis
              </p>
            )}
          </div>

          {/* Milestones Reached */}
          {milestones.length > 0 && (
            <div className="glass rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-4 h-4 text-primary" />
                <span className="text-sm text-muted-foreground">
                  Milestones Reached ({milestones.length})
                </span>
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {milestones.slice().reverse().map((milestone, index) => (
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
                        {milestone.hours}h • {milestone.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
