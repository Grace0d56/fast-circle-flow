import { useState, useEffect, useCallback } from 'react';
import { WeightEntry } from '@/components/WeightTracker';

export type MealType = 'light' | 'normal' | 'heavy';
export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'high';

export interface FastingSession {
  id: string;
  startTime: number;
  endTime: number | null;
  goalHours: number;
  completed: boolean;
  lastMealType: MealType;
  activityLevel: ActivityLevel;
}

interface FastingState {
  isActive: boolean;
  startTime: number | null;
  goalHours: number;
  lastMealType: MealType;
  sessions: FastingSession[];
  weightEntries: WeightEntry[];
}

const STORAGE_KEY = 'fasting-tracker-state';

const getStoredState = (): FastingState => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Ensure backward compatibility
      const sessions = (parsed.sessions || []).map((s: any) => ({
        ...s,
        lastMealType: s.lastMealType || 'heavy',
        activityLevel: s.activityLevel || 'sedentary',
      }));
      return {
        ...parsed,
        lastMealType: parsed.lastMealType || 'normal',
        weightEntries: parsed.weightEntries || [],
        sessions,
      };
    }
  } catch (e) {
    console.error('Error reading from localStorage:', e);
  }
  return {
    isActive: false,
    startTime: null,
    goalHours: 16,
    lastMealType: 'normal',
    sessions: [],
    weightEntries: [],
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

  // Start fasting with a custom last meal time and meal type
  const startFasting = useCallback((goalHours: number, lastMealTime: Date, lastMealType: MealType) => {
    const startTime = lastMealTime ? lastMealTime.getTime() : Date.now();
    setState(prev => ({
      ...prev,
      isActive: true,
      startTime,
      goalHours,
      lastMealType,
    }));
  }, []);

  // Stop fasting with activity level
  const stopFasting = useCallback((activityLevel: ActivityLevel) => {
    if (!state.startTime) return;

    const endTime = Date.now();
    const duration = endTime - state.startTime;

    const session: FastingSession = {
      id: crypto.randomUUID(),
      startTime: state.startTime,
      endTime,
      goalHours: state.goalHours,
      completed: duration >= state.goalHours * 60 * 60 * 1000,
      lastMealType: state.lastMealType,
      activityLevel,
    };

    setState(prev => ({
      ...prev,
      isActive: false,
      startTime: null,
      sessions: [session, ...prev.sessions],
    }));
  }, [state.startTime, state.goalHours, state.lastMealType]);

  const setGoal = useCallback((hours: number) => {
    setState(prev => ({ ...prev, goalHours: hours }));
  }, []);

  const clearHistory = useCallback(() => {
    setState(prev => ({ ...prev, sessions: [] }));
  }, []);

  const deleteSession = useCallback((sessionId: string) => {
    setState(prev => ({
      ...prev,
      sessions: prev.sessions.filter(s => s.id !== sessionId),
    }));
  }, []);

  const updateSession = useCallback((sessionId: string, updates: Partial<Omit<FastingSession, 'id'>>) => {
    setState(prev => ({
      ...prev,
      sessions: prev.sessions.map(s =>
        s.id === sessionId
          ? {
            ...s, ...updates, completed: updates.endTime && updates.startTime !== undefined
              ? (updates.endTime - (updates.startTime ?? s.startTime)) >= s.goalHours * 60 * 60 * 1000
              : s.completed
          }
          : s
      ),
    }));
  }, []);

  const addWeightEntry = useCallback((entry: Omit<WeightEntry, 'id' | 'date'>) => {
    const newEntry: WeightEntry = {
      id: crypto.randomUUID(),
      date: Date.now(),
      ...entry,
    };
    setState(prev => ({
      ...prev,
      weightEntries: [newEntry, ...prev.weightEntries],
    }));
  }, []);

  const updateWeightEntry = useCallback((entryId: string, updates: Partial<Omit<WeightEntry, 'id'>>) => {
    setState(prev => ({
      ...prev,
      weightEntries: prev.weightEntries.map(e =>
        e.id === entryId ? { ...e, ...updates } : e
      ),
    }));
  }, []);

  const deleteWeightEntry = useCallback((entryId: string) => {
    setState(prev => ({
      ...prev,
      weightEntries: prev.weightEntries.filter(e => e.id !== entryId),
    }));
  }, []);

  const clearWeightEntries = useCallback(() => {
    setState(prev => ({ ...prev, weightEntries: [] }));
  }, []);

  // Progress is calculated but we allow it to go beyond 100%
  // For display, we cap at 100 for the circle, but show actual time
  const rawProgress = state.isActive && state.startTime
    ? (elapsedTime / (state.goalHours * 60 * 60 * 1000)) * 100
    : 0;

  // Capped progress for the visual circle (max 100%)
  const progress = Math.min(rawProgress, 100);

  return {
    isActive: state.isActive,
    startTime: state.startTime,
    goalHours: state.goalHours,
    lastMealType: state.lastMealType,
    sessions: state.sessions,
    weightEntries: state.weightEntries,
    elapsedTime,
    progress,
    rawProgress,
    startFasting,
    stopFasting,
    setGoal,
    clearHistory,
    deleteSession,
    updateSession,
    addWeightEntry,
    updateWeightEntry,
    deleteWeightEntry,
    clearWeightEntries,
  };
};