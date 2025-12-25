import { FastingSession } from '@/hooks/useFasting';
import { formatDate, formatTimeOfDay, formatDuration } from '@/lib/time';
import { Check, X } from 'lucide-react';

interface FastingHistoryProps {
  sessions: FastingSession[];
}

export const FastingHistory = ({ sessions }: FastingHistoryProps) => {
  if (sessions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No fasting sessions yet</p>
        <p className="text-sm text-muted-foreground/70 mt-1">Start your first fast to see history</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {sessions.slice(0, 10).map((session) => {
        const duration = session.endTime! - session.startTime;
        
        return (
          <div
            key={session.id}
            className="glass rounded-xl p-4 animate-fade-in-up"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">
                  {formatDuration(duration)}
                </p>
                <p className="text-sm text-muted-foreground">
                  {formatDate(session.startTime)} • {formatTimeOfDay(session.startTime)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {session.goalHours}h goal
                </span>
                {session.completed ? (
                  <div className="w-6 h-6 rounded-full bg-success/20 flex items-center justify-center">
                    <Check className="w-4 h-4 text-success" />
                  </div>
                ) : (
                  <div className="w-6 h-6 rounded-full bg-destructive/20 flex items-center justify-center">
                    <X className="w-4 h-4 text-destructive" />
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
