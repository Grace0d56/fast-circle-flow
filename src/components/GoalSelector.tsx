import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

interface GoalSelectorProps {
  selectedGoal: number;
  onSelectGoal: (hours: number) => void;
  disabled?: boolean;
}

const FASTING_GOALS = [
  { hours: 12, label: '12:12', description: 'Beginner' },
  { hours: 14, label: '14:10', description: 'Light' },
  { hours: 16, label: '16:8', description: 'Popular' },
  { hours: 18, label: '18:6', description: 'Moderate' },
  { hours: 20, label: '20:4', description: 'Warrior' },
  { hours: 24, label: '24:0', description: 'OMAD' },
  { hours: 36, label: '36h', description: 'Extended' },
  { hours: 48, label: '48h', description: '2-Day' },
  { hours: 72, label: '72h', description: '3-Day' },
];

export const GoalSelector = ({ 
  selectedGoal, 
  onSelectGoal, 
  disabled 
}: GoalSelectorProps) => {
  return (
    <div className="w-full">
      <p className="text-sm text-muted-foreground mb-3 text-center">Select fasting goal</p>
      <div className="grid grid-cols-3 gap-2">
        {FASTING_GOALS.map((goal) => {
          const isSelected = selectedGoal === goal.hours;
          return (
            <Button
              key={goal.hours}
              variant={isSelected ? 'default' : 'glass'}
              size="sm"
              onClick={() => onSelectGoal(goal.hours)}
              disabled={disabled}
              className={`flex flex-col h-auto py-3 ${
                isSelected ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''
              }`}
            >
              <span className="font-display font-bold text-base">{goal.label}</span>
              <span className={`text-xs ${isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                {goal.description}
              </span>
              {isSelected && (
                <Check className="absolute top-1 right-1 w-3 h-3" />
              )}
            </Button>
          );
        })}
      </div>
    </div>
  );
};
