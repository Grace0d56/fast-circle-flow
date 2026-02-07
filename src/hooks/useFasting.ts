import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
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

const ACTIVE_FAST_KEY = 'fasting-tracker-active';

// Only store the active fast locally (so timer survives page refresh)
const getActiveFast = (): { isActive: boolean; startTime: number | null; goalHours: number; lastMealType: MealType } => {
  try {
    const stored = localStorage.getItem(ACTIVE_FAST_KEY);
    if (stored) return JSON.parse(stored);
  } catch (e) {
    console.error('Error reading active fast:', e);
  }
  return { isActive: false, startTime: null, goalHours: 16, lastMealType: 'normal' };
};

const saveActiveFast = (data: { isActive: boolean; startTime: number | null; goalHours: number; lastMealType: MealType }) => {
  try {
    localStorage.setItem(ACTIVE_FAST_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Error saving active fast:', e);
  }
};

// Convert database row (snake_case) to app format (camelCase)
const dbToSession = (row: any): FastingSession => ({
  id: row.id,
  startTime: row.start_time,
  endTime: row.end_time,
  goalHours: row.goal_hours,
  completed: row.completed,
  lastMealType: row.last_meal_type,
  activityLevel: row.activity_level,
});

const dbToWeightEntry = (row: any): WeightEntry => ({
  id: row.id,
  date: row.date,
  weight: row.weight,
  fatPercentage: row.fat_percentage,
});

export const useFasting = () => {
  const activeFast = getActiveFast();
  const [state, setState] = useState<FastingState>({
    isActive: activeFast.isActive,
    startTime: activeFast.startTime,
    goalHours: activeFast.goalHours,
    lastMealType: activeFast.lastMealType,
    sessions: [],
    weightEntries: [],
  });
  const [elapsedTime, setElapsedTime] = useState(0);
  const [dataLoaded, setDataLoaded] = useState(false);

  // Load sessions and weight entries from Supabase on mount
  useEffect(() => {
    const loadData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [sessionsResult, weightResult] = await Promise.all([
        supabase
          .from('fasting_sessions')
          .select('*')
          .eq('user_id', user.id)
          .order('start_time', { ascending: false }),
        supabase
          .from('weight_entries')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false }),
      ]);

      setState(prev => ({
        ...prev,
        sessions: (sessionsResult.data || []).map(dbToSession),
        weightEntries: (weightResult.data || []).map(dbToWeightEntry),
      }));
      setDataLoaded(true);
    };

    loadData();
  }, []);

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

  // Persist active fast to localStorage (only the timer state)
  useEffect(() => {
    saveActiveFast({
      isActive: state.isActive,
      startTime: state.startTime,
      goalHours: state.goalHours,
      lastMealType: state.lastMealType,
    });
  }, [state.isActive, state.startTime, state.goalHours, state.lastMealType]);

  // Start fasting
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

  // Stop fasting — save to Supabase
  const stopFasting = useCallback(async (activityLevel: ActivityLevel) => {
    if (!state.startTime) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const endTime = Date.now();
    const duration = endTime - state.startTime;
    const completed = duration >= state.goalHours * 60 * 60 * 1000;

    const { data, error } = await supabase
      .from('fasting_sessions')
      .insert({
        user_id: user.id,
        start_time: state.startTime,
        end_time: endTime,
        goal_hours: state.goalHours,
        completed,
        last_meal_type: state.lastMealType,
        activity_level: activityLevel,
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving session:', error);
      return;
    }

    const newSession = dbToSession(data);

    setState(prev => ({
      ...prev,
      isActive: false,
      startTime: null,
      sessions: [newSession, ...prev.sessions],
    }));
  }, [state.startTime, state.goalHours, state.lastMealType]);

  const setGoal = useCallback((hours: number) => {
    setState(prev => ({ ...prev, goalHours: hours }));
  }, []);

  // Clear all sessions from Supabase
  const clearHistory = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('fasting_sessions')
      .delete()
      .eq('user_id', user.id);

    if (!error) {
      setState(prev => ({ ...prev, sessions: [] }));
    }
  }, []);

  // Delete a single session
  const deleteSession = useCallback(async (sessionId: string) => {
    const { error } = await supabase
      .from('fasting_sessions')
      .delete()
      .eq('id', sessionId);

    if (!error) {
      setState(prev => ({
        ...prev,
        sessions: prev.sessions.filter(s => s.id !== sessionId),
      }));
    }
  }, []);

  // Update a session
  const updateSession = useCallback(async (sessionId: string, updates: Partial<Omit<FastingSession, 'id'>>) => {
    // Convert camelCase updates to snake_case for database
    const dbUpdates: any = {};
    if (updates.startTime !== undefined) dbUpdates.start_time = updates.startTime;
    if (updates.endTime !== undefined) dbUpdates.end_time = updates.endTime;
    if (updates.goalHours !== undefined) dbUpdates.goal_hours = updates.goalHours;
    if (updates.completed !== undefined) dbUpdates.completed = updates.completed;
    if (updates.lastMealType !== undefined) dbUpdates.last_meal_type = updates.lastMealType;
    if (updates.activityLevel !== undefined) dbUpdates.activity_level = updates.activityLevel;

    // Recalculate completed status if times changed
    if (updates.endTime && updates.startTime !== undefined) {
      const session = state.sessions.find(s => s.id === sessionId);
      if (session) {
        dbUpdates.completed = (updates.endTime - (updates.startTime ?? session.startTime)) >= session.goalHours * 60 * 60 * 1000;
      }
    }

    const { error } = await supabase
      .from('fasting_sessions')
      .update(dbUpdates)
      .eq('id', sessionId);

    if (!error) {
      setState(prev => ({
        ...prev,
        sessions: prev.sessions.map(s =>
          s.id === sessionId
            ? { ...s, ...updates, completed: dbUpdates.completed ?? s.completed }
            : s
        ),
      }));
    }
  }, [state.sessions]);

  // Add weight entry to Supabase
  const addWeightEntry = useCallback(async (entry: Omit<WeightEntry, 'id' | 'date'>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('weight_entries')
      .insert({
        user_id: user.id,
        date: Date.now(),
        weight: entry.weight,
        fat_percentage: entry.fatPercentage,
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving weight entry:', error);
      return;
    }

    const newEntry = dbToWeightEntry(data);
    setState(prev => ({
      ...prev,
      weightEntries: [newEntry, ...prev.weightEntries],
    }));
  }, []);

  // Update weight entry
  const updateWeightEntry = useCallback(async (entryId: string, updates: Partial<Omit<WeightEntry, 'id'>>) => {
    const dbUpdates: any = {};
    if (updates.weight !== undefined) dbUpdates.weight = updates.weight;
    if (updates.fatPercentage !== undefined) dbUpdates.fat_percentage = updates.fatPercentage;
    if (updates.date !== undefined) dbUpdates.date = updates.date;

    const { error } = await supabase
      .from('weight_entries')
      .update(dbUpdates)
      .eq('id', entryId);

    if (!error) {
      setState(prev => ({
        ...prev,
        weightEntries: prev.weightEntries.map(e =>
          e.id === entryId ? { ...e, ...updates } : e
        ),
      }));
    }
  }, []);

  // Delete weight entry
  const deleteWeightEntry = useCallback(async (entryId: string) => {
    const { error } = await supabase
      .from('weight_entries')
      .delete()
      .eq('id', entryId);

    if (!error) {
      setState(prev => ({
        ...prev,
        weightEntries: prev.weightEntries.filter(e => e.id !== entryId),
      }));
    }
  }, []);

  // Clear all weight entries
  const clearWeightEntries = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('weight_entries')
      .delete()
      .eq('user_id', user.id);

    if (!error) {
      setState(prev => ({ ...prev, weightEntries: [] }));
    }
  }, []);

  const rawProgress = state.isActive && state.startTime
    ? (elapsedTime / (state.goalHours * 60 * 60 * 1000)) * 100
    : 0;

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
    dataLoaded,
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