import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Clock, Target, Utensils } from 'lucide-react';
import { MealType } from '@/hooks/useFasting';

interface GoalInputProps {
  onStart: (goalHours: number, lastMealTime: Date, lastMealType: MealType) => void;
  disabled?: boolean;
}

const MEAL_OPTIONS: { value: MealType; label: string; description: string }[] = [
  { value: 'light', label: 'Light', description: 'Salad, snack, small portion' },
  { value: 'normal', label: 'Normal', description: 'Regular balanced meal' },
  { value: 'heavy', label: 'Heavy', description: 'Large, high carb/fat meal' },
];

export const GoalInput = ({ onStart, disabled }: GoalInputProps) => {
  const [goalHours, setGoalHours] = useState('16');
  const [lastMealDate, setLastMealDate] = useState('');
  const [lastMealTime, setLastMealTime] = useState('');
  const [lastMealType, setLastMealType] = useState<MealType>('normal');

  // Set default to now
  useEffect(() => {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().slice(0, 5);
    setLastMealDate(dateStr);
    setLastMealTime(timeStr);
  }, []);

  const handleStart = () => {
    const goal = parseFloat(goalHours);
    if (isNaN(goal) || goal <= 0 || goal > 168) return;

    const mealTime = new Date(`${lastMealDate}T${lastMealTime}`);
    if (isNaN(mealTime.getTime())) return;

    onStart(goal, mealTime, lastMealType);
  };

  const isValid = () => {
    const goal = parseFloat(goalHours);
    if (isNaN(goal) || goal <= 0 || goal > 168) return false;

    const mealTime = new Date(`${lastMealDate}T${lastMealTime}`);
    if (isNaN(mealTime.getTime())) return false;
    if (mealTime > new Date()) return false;

    return true;
  };

  return (
    <div className="w-full space-y-4">
      <p className="text-sm text-muted-foreground text-center">Configure your fast</p>

      <div className="glass rounded-xl p-4 space-y-4">
        {/* Goal Hours */}
        <div className="space-y-2">
          <Label htmlFor="goalHours" className="flex items-center gap-2">
            <Target className="w-4 h-4 text-primary" />
            Fasting Goal (hours)
          </Label>
          <Input
            id="goalHours"
            type="number"
            min="1"
            max="168"
            step="1"
            value={goalHours}
            onChange={(e) => setGoalHours(e.target.value)}
            disabled={disabled}
            placeholder="e.g., 16"
            className="text-center text-lg font-display"
          />
          <p className="text-xs text-muted-foreground text-center">
            Common goals: 12, 16, 18, 20, 24, 36, 48, 72 hours
          </p>
        </div>

        {/* Last Meal Time */}
        <div className="space-y-2">
          <Label htmlFor="lastMealTime" className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            Last Meal Time
          </Label>
          <div className="flex gap-2">
            <Input
              id="lastMealDate"
              type="date"
              value={lastMealDate}
              onChange={(e) => setLastMealDate(e.target.value)}
              disabled={disabled}
              className="flex-1"
            />
            <Input
              id="lastMealTime"
              type="time"
              value={lastMealTime}
              onChange={(e) => setLastMealTime(e.target.value)}
              disabled={disabled}
              className="flex-1"
            />
          </div>
          <p className="text-xs text-muted-foreground text-center">
            When did you finish your last meal?
          </p>
        </div>

        {/* Last Meal Type */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Utensils className="w-4 h-4 text-primary" />
            Last Meal Size
          </Label>
          <div className="grid grid-cols-3 gap-2">
            {MEAL_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setLastMealType(option.value)}
                disabled={disabled}
                className={`p-2 rounded-lg border text-center transition-all ${lastMealType === option.value
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-card hover:border-primary/50'
                  }`}
              >
                <span className="block text-sm font-medium">{option.label}</span>
                <span className="block text-xs text-muted-foreground mt-0.5">
                  {option.description}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <Button
        variant="glow"
        size="xl"
        className="w-full"
        onClick={handleStart}
        disabled={disabled || !isValid()}
      >
        Start Fasting
      </Button>
    </div>
  );
};