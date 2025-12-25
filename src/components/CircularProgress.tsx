import { useMemo } from 'react';
import { formatTime } from '@/lib/time';

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
  
  const radius = 140;
  const strokeWidth = 12;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const isCompleted = progress >= 100;

  return (
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
                <span className="text-success font-medium">Goal reached!</span>
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
  );
};
