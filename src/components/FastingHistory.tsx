import { useState } from 'react';
import { FastingSession } from '@/hooks/useFasting';
import { formatDate, formatTimeOfDay, formatDuration } from '@/lib/time';
import { SessionDetail } from '@/components/SessionDetail';
import { Check, X, ChevronRight } from 'lucide-react';

interface FastingHistoryProps {
  sessions: FastingSession[];
  onUpdateSession?: (sessionId: string, updates: Partial<Omit<FastingSession, 'id'>>) => void;
  onDeleteSession?: (sessionId: string) => void;
}

export const FastingHistory = ({ sessions, onUpdateSession, onDeleteSession }: FastingHistoryProps) => {
  const [selectedSession, setSelectedSession] = useState<FastingSession | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const handleSessionClick = (session: FastingSession) => {
    setSelectedSession(session);
    setDetailOpen(true);
  };

  if (sessions.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No fasting sessions yet</p>
        <p className="text-sm text-muted-foreground/70 mt-1">Start your first fast to see history</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-2">
        {sessions.slice(0, 30).map((session) => {
          const duration = session.endTime! - session.startTime;
          
          return (
            <div
              key={session.id}
              onClick={() => handleSessionClick(session)}
              className="glass rounded-xl p-3 sm:p-4 animate-fade-in-up cursor-pointer hover:bg-secondary/50 transition-colors active:scale-[0.98]"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">
                    {formatDuration(duration)}
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground truncate">
                    {formatDate(session.startTime)} • {formatTimeOfDay(session.startTime)}
                  </p>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                  <span className="text-xs sm:text-sm text-muted-foreground hidden sm:inline">
                    {session.goalHours}h goal
                  </span>
                  {session.completed ? (
                    <div className="w-6 h-6 rounded-full bg-success/20 flex items-center justify-center">
                      <Check className="w-3 h-3 sm:w-4 sm:h-4 text-success" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-destructive/20 flex items-center justify-center">
                      <X className="w-3 h-3 sm:w-4 sm:h-4 text-destructive" />
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
        onUpdate={onUpdateSession}
        onDelete={onDeleteSession}
      />
    </>
  );
};
