import { useMemo, useState } from 'react';
import { formatTime } from '@/lib/time';
import { FASTING_MILESTONES, getMilestoneColor, FastingMilestone } from '@/lib/milestones';
import { MilestoneDialog } from './MilestoneDialog';

interface CircularProgressProps {
  progress: number;
  elapsedTime: number;
  goalHours: number;
  isActive: boolean;
}

export const CircularProgress = ({ 
  progress, 
  elapsedTime, 
  goalHours, 
  isActive 
}: CircularProgressProps) => {
  const { hours, minutes, seconds } = useMemo(() => formatTime(elapsedTime), [elapsedTime]);
  const elapsedHours = elapsedTime / (1000 * 60 * 60);
  const [selectedMilestone, setSelectedMilestone] = useState<FastingMilestone | null>(null);
  const [milestoneDialogOpen, setMilestoneDialogOpen] = useState(false);
  
  const radius = 130;
  const strokeWidth = 10;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const isCompleted = progress >= 100;

  // Filter milestones that fit within the goal timeframe
  const relevantMilestones = useMemo(() => {
    // For display, show milestones up to goal + 50% or 72h, whichever is higher
    const maxHours = Math.max(goalHours * 1.5, 72);
    return FASTING_MILESTONES.filter(m => m.hours <= maxHours && m.hours > 0);
  }, [goalHours]);

  // Calculate milestone positions on the circle
  const getMilestonePosition = (milestoneHours: number) => {
    const maxHours = Math.max(goalHours * 1.5, 72);
    const angle = (milestoneHours / maxHours) * 360 - 90; // -90 to start from top
    const radians = (angle * Math.PI) / 180;
    const dotRadius = normalizedRadius;
    const x = radius + dotRadius * Math.cos(radians);
    const y = radius + dotRadius * Math.sin(radians);
    return { x, y, angle };
  };

  const handleMilestoneClick = (milestone: FastingMilestone, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedMilestone(milestone);
    setMilestoneDialogOpen(true);
  };

  return (
    <>
      <div className="relative flex items-center justify-center">
        {/* Glow effect behind the circle - uses primary color */}
        <div 
          className={`absolute w-[280px] h-[280px] rounded-full transition-opacity duration-1000 ${
            isActive ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            background: 'radial-gradient(circle, hsl(var(--primary) / 0.25) 0%, transparent 70%)',
            filter: 'blur(30px)',
          }}
        />
        
        {/* Pulsing ring when active - uses primary color */}
        {isActive && (
          <div 
            className="absolute w-[270px] h-[270px] rounded-full border border-primary/30 animate-pulse-glow"
          />
        )}

        <svg
          height={radius * 2}
          width={radius * 2}
          className="transform -rotate-90"
        >
          {/* Background circle */}
          <circle
            stroke="hsl(var(--secondary))"
            fill="transparent"
            strokeWidth={strokeWidth}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
          />
          
          {/* Progress circle - uses primary/success color from theme */}
          <circle
            stroke={isCompleted ? "hsl(var(--success))" : "hsl(var(--primary))"}
            fill="transparent"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference + ' ' + circumference}
            style={{ 
              strokeDashoffset,
              transition: 'stroke-dashoffset 1s ease-out, stroke 0.5s ease',
            }}
            r={normalizedRadius}
            cx={radius}
            cy={radius}
            className={isActive ? 'drop-shadow-[0_0_8px_hsl(var(--primary))]' : ''}
          />

          {/* Milestone dots - clickable */}
          {isActive && relevantMilestones.map((milestone) => {
            const { x, y } = getMilestonePosition(milestone.hours);
            const isReached = elapsedHours >= milestone.hours;
            const color = getMilestoneColor(milestone.icon);
            
            return (
              <g key={milestone.hours} transform={`rotate(90, ${radius}, ${radius})`}>
                <circle
                  cx={x}
                  cy={y}
                  r={isReached ? 7 : 4}
                  fill={isReached ? color : 'hsl(var(--secondary))'}
                  stroke={isReached ? color : 'hsl(var(--muted-foreground) / 0.3)'}
                  strokeWidth={isReached ? 0 : 1}
                  style={{
                    transition: 'all 0.3s ease',
                    cursor: 'pointer',
                    filter: isReached ? `drop-shadow(0 0 4px ${color})` : 'none',
                  }}
                  onClick={(e) => handleMilestoneClick(milestone, e)}
                />
              </g>
            );
          })}
        </svg>

        {/* Center content */}
        <div className="absolute flex flex-col items-center justify-center px-4">
          {isActive ? (
            <>
              <div className="flex items-baseline gap-0.5 font-display">
                <span className="text-4xl sm:text-5xl font-bold text-foreground tabular-nums">{hours}</span>
                <span className="text-xl sm:text-2xl text-muted-foreground">:</span>
                <span className="text-4xl sm:text-5xl font-bold text-foreground tabular-nums">{minutes}</span>
                <span className="text-xl sm:text-2xl text-muted-foreground">:</span>
                <span className="text-4xl sm:text-5xl font-bold text-foreground tabular-nums">{seconds}</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground text-center">
                {isCompleted ? (
                  <span className="text-success font-medium">Goal reached! Keep going 🔥</span>
                ) : (
                  `of ${goalHours}h goal`
                )}
              </p>
              <p className="mt-1 text-xs text-muted-foreground/60">
                Tap dots for info
              </p>
            </>
          ) : (
            <>
              <p className="text-base text-muted-foreground mb-1">Ready to fast?</p>
              <p className="text-xs text-muted-foreground/60">Configure below</p>
            </>
          )}
        </div>
      </div>

      <MilestoneDialog
        milestone={selectedMilestone}
        isReached={selectedMilestone ? elapsedHours >= selectedMilestone.hours : false}
        open={milestoneDialogOpen}
        onOpenChange={setMilestoneDialogOpen}
      />
    </>
  );
};
