import { FastingSession } from '@/hooks/useFasting';
import { getWeekStart, getMonthStart, getYearStart } from './time';

export interface FastingStats {
  totalFasts: number;
  completedFasts: number;
  totalHours: number;
  averageDuration: number;
  longestFast: number;
  currentStreak: number;
}

export const calculateStats = (
  sessions: FastingSession[],
  period: 'week' | 'month' | '3months' | '6months' | 'year' | 'all'
): FastingStats => {
  const now = new Date();
  let startDate: Date;

  switch (period) {
    case 'week':
      startDate = getWeekStart(now);
      break;
    case 'month':
      startDate = getMonthStart(now);
      break;
    case '3months':
      startDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);
      break;
    case '6months':
      startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);
      break;
    case 'year':
      startDate = getYearStart(now);
      break;
    default:
      startDate = new Date(0);
  }

  const filteredSessions = sessions.filter(
    s => s.endTime && s.endTime >= startDate.getTime()
  );

  if (filteredSessions.length === 0) {
    return {
      totalFasts: 0,
      completedFasts: 0,
      totalHours: 0,
      averageDuration: 0,
      longestFast: 0,
      currentStreak: 0,
    };
  }

  const totalFasts = filteredSessions.length;
  const completedFasts = filteredSessions.filter(s => s.completed).length;

  const durations = filteredSessions.map(s => (s.endTime! - s.startTime) / (1000 * 60 * 60));
  const totalHours = durations.reduce((sum, d) => sum + d, 0);
  const averageDuration = totalHours / totalFasts;
  const longestFast = Math.max(...durations);

  // Calculate streak (consecutive completed fasts)
  let currentStreak = 0;
  const sortedSessions = [...sessions]
    .filter(s => s.endTime)
    .sort((a, b) => b.endTime! - a.endTime!);

  for (const session of sortedSessions) {
    if (session.completed) {
      currentStreak++;
    } else {
      break;
    }
  }

  return {
    totalFasts,
    completedFasts,
    totalHours: Math.round(totalHours * 10) / 10,
    averageDuration: Math.round(averageDuration * 10) / 10,
    longestFast: Math.round(longestFast * 10) / 10,
    currentStreak,
  };
};
