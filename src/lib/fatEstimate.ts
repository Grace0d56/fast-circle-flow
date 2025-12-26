// Katch-McArdle based fat burning estimation for fasting
// Based on: https://docs.lovable.dev formula spec
// Using conservative estimates for motivation

export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'very_plus';

export interface FatBurnEstimate {
  totalGrams: number;
  caloriesBurned: number;
  ketosisHours: number;
  estimationType: 'none' | 'light' | 'moderate' | 'heavy';
  range?: {
    low: number;
    high: number;
  };
}

// Constants
const K_FAT_KCAL_PER_KG = 7700;
const E_RMR = 0.10; // ±10% uncertainty

// Activity multipliers during fast
const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.00,
  light: 1.15,
  moderate: 1.30,
  very_plus: 1.45,
};

// Fasting fat fraction based on hours
const getFastingFatFraction = (hours: number): number => {
  if (hours < 12) return 0.55;
  if (hours < 24) return 0.70;
  if (hours < 36) return 0.80;
  if (hours < 60) return 0.85;
  return 0.90;
};

// Default values for normal-weight female if not provided
const DEFAULT_WEIGHT_KG = 58;
const DEFAULT_BODY_FAT_PCT = 25;

export interface FatBurnOptions {
  weightKg?: number;
  bodyFatPct?: number;
  activityLevel?: ActivityLevel;
}

export const estimateFatBurned = (
  durationMs: number,
  options?: FatBurnOptions
): FatBurnEstimate => {
  const hours = durationMs / (1000 * 60 * 60);
  
  if (hours <= 0) {
    return { totalGrams: 0, caloriesBurned: 0, ketosisHours: 0, estimationType: 'none' };
  }

  const weightKg = options?.weightKg || DEFAULT_WEIGHT_KG;
  const bodyFatPct = Math.min(Math.max(options?.bodyFatPct || DEFAULT_BODY_FAT_PCT, 0), 70);
  const activityLevel = options?.activityLevel || 'sedentary';

  // Calculate Lean Body Mass
  const lbmKg = weightKg * (1 - bodyFatPct / 100);

  // Get activity multiplier
  const m = ACTIVITY_MULTIPLIERS[activityLevel];

  // Calculate RMR using Katch-McArdle formula
  const rmrDayKcal = 370 + 21.6 * lbmKg;

  // Get fasting fat fraction
  const fFast = getFastingFatFraction(hours);

  // Calculate calories burned during the fasting window
  const caloriesKcal = rmrDayKcal * m * (hours / 24);

  // Calculate fat burned
  const fatKcal = caloriesKcal * fFast;
  const fatKg = fatKcal / K_FAT_KCAL_PER_KG;
  const fatGrams = fatKg * 1000;

  // Calculate range with ±10% RMR uncertainty
  const caloriesLow = (rmrDayKcal * (1 - E_RMR)) * m * (hours / 24);
  const caloriesHigh = (rmrDayKcal * (1 + E_RMR)) * m * (hours / 24);
  const fatGramsLow = (caloriesLow * fFast / K_FAT_KCAL_PER_KG) * 1000;
  const fatGramsHigh = (caloriesHigh * fFast / K_FAT_KCAL_PER_KG) * 1000;

  // Calculate ketosis hours (time after 12h mark when fat burning increases)
  const ketosisHours = Math.max(0, hours - 12);

  // Determine estimation type
  let estimationType: FatBurnEstimate['estimationType'] = 'none';
  if (fatGrams >= 30) estimationType = 'heavy';
  else if (fatGrams >= 15) estimationType = 'moderate';
  else if (fatGrams > 0) estimationType = 'light';

  return {
    totalGrams: Math.round(fatGrams * 10) / 10,
    caloriesBurned: Math.round(caloriesKcal),
    ketosisHours: Math.round(ketosisHours * 10) / 10,
    estimationType,
    range: {
      low: Math.round(fatGramsLow * 10) / 10,
      high: Math.round(fatGramsHigh * 10) / 10,
    },
  };
};

// Calculate total fat burned from all sessions
export const calculateTotalFatBurned = (
  sessions: { startTime: number; endTime: number | null }[],
  options?: FatBurnOptions
): number => {
  return sessions.reduce((total, session) => {
    if (!session.endTime) return total;
    const duration = session.endTime - session.startTime;
    return total + estimateFatBurned(duration, options).totalGrams;
  }, 0);
};
