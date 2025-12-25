// Conservative fat burning estimation for fasting
// Based on research from: Nature Communications (2024), Cambridge studies
// For normal-weight females in healthy conditions
// 
// Scientific basis:
// - Resting metabolic rate (RMR): ~1400 kcal/day for average female
// - During fasting after ketosis (~16h), ~60-80% of energy from fat
// - 1g fat = 9 kcal
// - Conservative estimate: ~0.5-1g fat/hour during active ketosis
// 
// We use CONSERVATIVE estimates (lower bound) to keep users motivated

export interface FatBurnEstimate {
  totalGrams: number;
  ketosisHours: number;
  estimationType: 'none' | 'light' | 'moderate' | 'heavy';
}

// Conservative fat burning rates (grams per hour)
// Based on normal-weight female, healthy conditions
const FAT_BURN_RATES = {
  preKetosis: 0.1,      // 0-12h: minimal fat burning, mostly glycogen
  earlyKetosis: 0.3,    // 12-16h: transitioning to fat burning
  activeKetosis: 0.5,   // 16-24h: active fat burning
  deepKetosis: 0.6,     // 24-48h: enhanced fat oxidation
  peakKetosis: 0.7,     // 48h+: peak fat burning
};

export const estimateFatBurned = (durationMs: number): FatBurnEstimate => {
  const hours = durationMs / (1000 * 60 * 60);
  
  if (hours < 4) {
    return { totalGrams: 0, ketosisHours: 0, estimationType: 'none' };
  }
  
  let totalGrams = 0;
  
  // Calculate fat burned in each phase
  if (hours >= 4) {
    // Pre-ketosis phase (4-12h)
    const preKetosisHours = Math.min(hours, 12) - 4;
    if (preKetosisHours > 0) {
      totalGrams += preKetosisHours * FAT_BURN_RATES.preKetosis;
    }
  }
  
  if (hours >= 12) {
    // Early ketosis (12-16h)
    const earlyKetosisHours = Math.min(hours, 16) - 12;
    if (earlyKetosisHours > 0) {
      totalGrams += earlyKetosisHours * FAT_BURN_RATES.earlyKetosis;
    }
  }
  
  if (hours >= 16) {
    // Active ketosis (16-24h)
    const activeKetosisHours = Math.min(hours, 24) - 16;
    if (activeKetosisHours > 0) {
      totalGrams += activeKetosisHours * FAT_BURN_RATES.activeKetosis;
    }
  }
  
  if (hours >= 24) {
    // Deep ketosis (24-48h)
    const deepKetosisHours = Math.min(hours, 48) - 24;
    if (deepKetosisHours > 0) {
      totalGrams += deepKetosisHours * FAT_BURN_RATES.deepKetosis;
    }
  }
  
  if (hours >= 48) {
    // Peak ketosis (48h+)
    const peakKetosisHours = hours - 48;
    totalGrams += peakKetosisHours * FAT_BURN_RATES.peakKetosis;
  }
  
  // Calculate ketosis hours (time after 16h mark)
  const ketosisHours = Math.max(0, hours - 16);
  
  // Determine estimation type
  let estimationType: FatBurnEstimate['estimationType'] = 'none';
  if (totalGrams >= 10) estimationType = 'heavy';
  else if (totalGrams >= 5) estimationType = 'moderate';
  else if (totalGrams > 0) estimationType = 'light';
  
  return {
    totalGrams: Math.round(totalGrams * 10) / 10,
    ketosisHours: Math.round(ketosisHours * 10) / 10,
    estimationType,
  };
};

// Calculate total fat burned from all sessions
export const calculateTotalFatBurned = (
  sessions: { startTime: number; endTime: number | null }[]
): number => {
  return sessions.reduce((total, session) => {
    if (!session.endTime) return total;
    const duration = session.endTime - session.startTime;
    return total + estimateFatBurned(duration).totalGrams;
  }, 0);
};
