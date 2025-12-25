// Fasting milestones based on scientific research
// Sources: Healthline (medically reviewed), Dr. Kiltz with peer-reviewed citations
// Key references: PMID 29700718, PMC8839325, PMC7400818

export interface FastingMilestone {
  hours: number;
  title: string;
  description: string;
  icon: 'blood-sugar' | 'ketosis' | 'autophagy' | 'fat-burning' | 'hgh' | 'brain' | 'stem-cell';
}

export const FASTING_MILESTONES: FastingMilestone[] = [
  {
    hours: 0,
    title: 'Fast Started',
    description: 'Fed state - body digesting food',
    icon: 'blood-sugar',
  },
  {
    hours: 4,
    title: 'Anabolic Phase Ends',
    description: 'Blood sugar stabilizing, insulin dropping',
    icon: 'blood-sugar',
  },
  {
    hours: 8,
    title: 'Glycogen Depletion',
    description: 'Liver glycogen being used for energy',
    icon: 'fat-burning',
  },
  {
    hours: 12,
    title: 'Metabolic Switch',
    description: 'Body transitioning to fat burning',
    icon: 'fat-burning',
  },
  {
    hours: 14,
    title: 'Early Ketosis',
    description: 'Ketone production begins',
    icon: 'ketosis',
  },
  {
    hours: 16,
    title: 'Ketosis Active',
    description: 'Fat being converted to ketones',
    icon: 'ketosis',
  },
  {
    hours: 18,
    title: 'Autophagy Begins',
    description: 'Cellular cleanup process activated',
    icon: 'autophagy',
  },
  {
    hours: 20,
    title: 'Enhanced Fat Burning',
    description: 'Lipolysis intensified',
    icon: 'fat-burning',
  },
  {
    hours: 24,
    title: 'HGH Surge',
    description: 'Growth hormone increases 5x',
    icon: 'hgh',
  },
  {
    hours: 36,
    title: 'Deep Autophagy',
    description: 'Cellular renewal at peak',
    icon: 'autophagy',
  },
  {
    hours: 48,
    title: 'BDNF Boost',
    description: 'Brain-derived factor increases',
    icon: 'brain',
  },
  {
    hours: 54,
    title: 'Insulin Baseline',
    description: 'Insulin at lowest levels',
    icon: 'blood-sugar',
  },
  {
    hours: 60,
    title: 'Peak Fat Oxidation',
    description: 'Maximum fat burning rate',
    icon: 'fat-burning',
  },
  {
    hours: 72,
    title: 'Stem Cell Activation',
    description: 'IGF-1 drops, stem cells regenerate',
    icon: 'stem-cell',
  },
];

export const getMilestoneColor = (icon: FastingMilestone['icon']): string => {
  switch (icon) {
    case 'blood-sugar':
      return 'hsl(var(--primary))';
    case 'ketosis':
      return 'hsl(168 84% 44%)';
    case 'autophagy':
      return 'hsl(280 70% 60%)';
    case 'fat-burning':
      return 'hsl(35 90% 55%)';
    case 'hgh':
      return 'hsl(200 80% 55%)';
    case 'brain':
      return 'hsl(320 70% 60%)';
    case 'stem-cell':
      return 'hsl(140 70% 45%)';
    default:
      return 'hsl(var(--primary))';
  }
};

export const getReachedMilestones = (elapsedHours: number): FastingMilestone[] => {
  return FASTING_MILESTONES.filter(m => elapsedHours >= m.hours);
};

export const getNextMilestone = (elapsedHours: number): FastingMilestone | null => {
  return FASTING_MILESTONES.find(m => m.hours > elapsedHours) || null;
};
