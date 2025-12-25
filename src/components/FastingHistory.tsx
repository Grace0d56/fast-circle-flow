import { useState } from 'react';
import { FastingSession } from '@/hooks/useFasting';
import { formatDate, formatTimeOfDay, formatDuration } from '@/lib/time';
import { SessionDetail } from '@/components/SessionDetail';
import { Check, X, ChevronRight } from 'lucide-react';

interface FastingHistoryProps {
  sessions: FastingSession[];
}

export const FastingHistory = ({ sessions }: FastingHistoryProps) => {
  const [selectedSession, setSelectedSession] = useState<FastingSession | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const handleSessionClick = (session: FastingSession) => {
    setSelectedSession(session);
    setDetailOpen(true);
  };

  if (sessions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No fasting sessions yet</p>
        <p className="text-sm text-muted-foreground/70 mt-1">Start your first fast to see history</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {sessions.slice(0, 20).map((session) => {
          const duration = session.endTime! - session.startTime;
          
          return (
            <div
              key={session.id}
              onClick={() => handleSessionClick(session)}
              className="glass rounded-xl p-4 animate-fade-in-up cursor-pointer hover:bg-secondary/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="font-medium text-foreground">
                    {formatDuration(duration)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(session.startTime)} • {formatTimeOfDay(session.startTime)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
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
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <SessionDetail
        session={selectedSession}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />
    </>
  );
};
