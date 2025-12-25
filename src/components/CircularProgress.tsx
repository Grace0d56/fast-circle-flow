import { useMemo } from 'react';
import { formatTime } from '@/lib/time';
import { FASTING_MILESTONES, getMilestoneColor } from '@/lib/milestones';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
  
  const radius = 140;
  const strokeWidth = 12;
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

  return (
    <TooltipProvider>
      <div className="relative flex items-center justify-center">
        {/* Glow effect behind the circle */}
        <div 
          className={`absolute w-[320px] h-[320px] rounded-full transition-opacity duration-1000 ${
            isActive ? 'opacity-100' : 'opacity-0'
          }`}
          style={{
            background: 'radial-gradient(circle, hsl(168 84% 44% / 0.2) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }}
        />
        
        {/* Pulsing ring when active */}
        {isActive && (
          <div 
            className="absolute w-[300px] h-[300px] rounded-full border border-primary/30 animate-pulse-glow"
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
          
          {/* Progress circle */}
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

          {/* Milestone dots */}
          {isActive && relevantMilestones.map((milestone) => {
            const { x, y } = getMilestonePosition(milestone.hours);
            const isReached = elapsedHours >= milestone.hours;
            const color = getMilestoneColor(milestone.icon);
            
            return (
              <g key={milestone.hours} transform="rotate(90, 140, 140)">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <circle
                      cx={x}
                      cy={y}
                      r={isReached ? 6 : 4}
                      fill={isReached ? color : 'hsl(var(--secondary))'}
                      stroke={isReached ? color : 'hsl(var(--muted-foreground))'}
                      strokeWidth={1}
                      style={{
                        transition: 'all 0.3s ease',
                        cursor: 'pointer',
                        opacity: isReached ? 1 : 0.5,
                      }}
                    />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="bg-card border-border">
                    <div className="text-xs">
                      <p className="font-semibold">{milestone.hours}h - {milestone.title}</p>
                      <p className="text-muted-foreground">{milestone.description}</p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </g>
            );
          })}
        </svg>

        {/* Center content */}
        <div className="absolute flex flex-col items-center justify-center">
          {isActive ? (
            <>
              <div className="flex items-baseline gap-1 font-display">
                <span className="text-5xl font-bold text-foreground tabular-nums">{hours}</span>
                <span className="text-2xl text-muted-foreground">:</span>
                <span className="text-5xl font-bold text-foreground tabular-nums">{minutes}</span>
                <span className="text-2xl text-muted-foreground">:</span>
                <span className="text-5xl font-bold text-foreground tabular-nums">{seconds}</span>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                {isCompleted ? (
                  <span className="text-success font-medium">Goal reached! Keep going 🔥</span>
                ) : (
                  `of ${goalHours}h goal`
                )}
              </p>
            </>
          ) : (
            <>
              <p className="text-lg text-muted-foreground mb-1">Ready to fast?</p>
              <p className="text-sm text-muted-foreground/70">Tap start below</p>
            </>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
};
