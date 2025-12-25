import { useState, useEffect, useCallback } from 'react';

export interface FastingSession {
  id: string;
  startTime: number;
  endTime: number | null;
  goalHours: number;
  completed: boolean;
}

interface FastingState {
  isActive: boolean;
  startTime: number | null;
  goalHours: number;
  sessions: FastingSession[];
}

const STORAGE_KEY = 'fasting-tracker-state';

const getStoredState = (): FastingState => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Error reading from localStorage:', e);
  }
  return {
    isActive: false,
    startTime: null,
    goalHours: 16,
    sessions: [],
  };
};

const saveState = (state: FastingState) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Error saving to localStorage:', e);
  }
};

export const useFasting = () => {
  const [state, setState] = useState<FastingState>(getStoredState);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Calculate elapsed time
  useEffect(() => {
    if (!state.isActive || !state.startTime) {
      setElapsedTime(0);
      return;
    }

    const updateElapsed = () => {
      setElapsedTime(Date.now() - state.startTime!);
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);
    return () => clearInterval(interval);
  }, [state.isActive, state.startTime]);

  // Persist state
  useEffect(() => {
    saveState(state);
  }, [state]);

  const startFasting = useCallback((goalHours: number) => {
    setState(prev => ({
      ...prev,
      isActive: true,
      startTime: Date.now(),
      goalHours,
    }));
  }, []);

  const stopFasting = useCallback(() => {
    if (!state.startTime) return;

    const session: FastingSession = {
      id: crypto.randomUUID(),
      startTime: state.startTime,
      endTime: Date.now(),
      goalHours: state.goalHours,
      completed: elapsedTime >= state.goalHours * 60 * 60 * 1000,
    };

    setState(prev => ({
      ...prev,
      isActive: false,
      startTime: null,
      sessions: [session, ...prev.sessions],
    }));
  }, [state.startTime, state.goalHours, elapsedTime]);

  const setGoal = useCallback((hours: number) => {
    setState(prev => ({ ...prev, goalHours: hours }));
  }, []);

  const clearHistory = useCallback(() => {
    setState(prev => ({ ...prev, sessions: [] }));
  }, []);

  const progress = state.isActive && state.startTime
    ? Math.min((elapsedTime / (state.goalHours * 60 * 60 * 1000)) * 100, 100)
    : 0;

  return {
    isActive: state.isActive,
    startTime: state.startTime,
    goalHours: state.goalHours,
    sessions: state.sessions,
    elapsedTime,
    progress,
    startFasting,
    stopFasting,
    setGoal,
    clearHistory,
  };
};
