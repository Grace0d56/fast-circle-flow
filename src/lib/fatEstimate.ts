// Conservative Fat Oxidation Estimation
// Based on friend's formula with range output
// Lower bound: sedentary activity
// Upper bound: user-selected activity level

import { MealType, ActivityLevel } from '@/hooks/useFasting';

export interface FatBurnEstimate {
  lowerGrams: number;
  upperGrams: number;
  caloriesBurned: number;
  ketosisHours: number;
  adjustedHours: number;
}

export interface FatBurnOptions {
  weightKg?: number;
  bodyFatPct?: number;
}

// Default values if no weight logged
const DEFAULT_WEIGHT_KG = 58;
const DEFAULT_BODY_FAT_PCT = 25;

// Meal offset hours (decays to 0 by 24h)
const MEAL_OFFSETS: Record<MealType, number> = {
  light: 0,
  normal: 2,
  heavy: 6,
};

// Activity multipliers
const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.00,
  light: 1.10,
  moderate: 1.20,
  high: 1.30,
};

// Calculate meal offset with decay
const getMealOffset = (t: number, mealType: MealType): number => {
  const O0 = MEAL_OFFSETS[mealType];
  return O0 * Math.max(0, 1 - t / 24);
};

// Calculate adjusted fasting time
const getAdjustedTime = (t: number, mealType: MealType): number => {
  const offset = getMealOffset(t, mealType);
  return Math.max(0, t - offset);
};

// Conservative fat fraction based on adjusted hours
const getFatFraction = (tAdj: number): number => {
  if (tAdj < 12) {
    return 0.30;
  } else if (tAdj < 24) {
    return 0.30 + (tAdj - 12) * (0.20 / 12);
  } else if (tAdj < 48) {
    return 0.50 + (tAdj - 24) * (0.15 / 24);
  } else {
    return 0.65;
  }
};

// Calculate RMR using Katch-McArdle formula
const calculateRMR = (weightKg: number, bodyFatPct: number): number => {
  const lbmKg = weightKg * (1 - bodyFatPct / 100);
  return 370 + 21.6 * lbmKg;
};

export const estimateFatBurned = (
  durationMs: number,
  lastMealType: MealType,
  activityLevel: ActivityLevel,
  options?: FatBurnOptions
): FatBurnEstimate => {
  const hours = durationMs / (1000 * 60 * 60);

  if (hours <= 0) {
    return {
      lowerGrams: 0,
      upperGrams: 0,
      caloriesBurned: 0,
      ketosisHours: 0,
      adjustedHours: 0,
    };
  }

  const weightKg = options?.weightKg || DEFAULT_WEIGHT_KG;
  const bodyFatPct = Math.min(Math.max(options?.bodyFatPct || DEFAULT_BODY_FAT_PCT, 0), 70);

  // Step 1-3: Calculate adjusted fasting time
  const tAdj = getAdjustedTime(hours, lastMealType);

  // Step 4: Get activity multipliers (lower = sedentary, upper = user selection)
  const aLower = ACTIVITY_MULTIPLIERS.sedentary;
  const aUpper = ACTIVITY_MULTIPLIERS[activityLevel];

  // Step 5: Calculate RMR and total energy
  const rmrDay = calculateRMR(weightKg, bodyFatPct);
  const eTotalLower = rmrDay * (hours / 24) * aLower;
  const eTotalUpper = rmrDay * (hours / 24) * aUpper;

  // Step 6: Get fat fraction based on adjusted time
  const f = getFatFraction(tAdj);

  // Step 7: Calculate fat oxidized (using 9.0 kcal/g)
  const fatLower = (eTotalLower * f) / 9.0;
  const fatUpper = (eTotalUpper * f) / 9.0;

  // Calculate ketosis hours (time after 12h adjusted mark)
  const ketosisHours = Math.max(0, tAdj - 12);

  // Use upper bound for calories display
  const caloriesBurned = Math.round(eTotalUpper);

  return {
    lowerGrams: Math.round(fatLower * 10) / 10,
    upperGrams: Math.round(fatUpper * 10) / 10,
    caloriesBurned,
    ketosisHours: Math.round(ketosisHours * 10) / 10,
    adjustedHours: Math.round(tAdj * 10) / 10,
  };
};

// Calculate total fat burned from all sessions (returns range)
export const calculateTotalFatBurned = (
  sessions: {
    startTime: number;
    endTime: number | null;
    lastMealType: MealType;
    activityLevel: ActivityLevel;
  }[],
  options?: FatBurnOptions
): { lower: number; upper: number } => {
  return sessions.reduce(
    (total, session) => {
      if (!session.endTime) return total;
      const duration = session.endTime - session.startTime;
      const estimate = estimateFatBurned(
        duration,
        session.lastMealType,
        session.activityLevel,
        options
      );
      return {
        lower: total.lower + estimate.lowerGrams,
        upper: total.upper + estimate.upperGrams,
      };
    },
    { lower: 0, upper: 0 }
  );
};