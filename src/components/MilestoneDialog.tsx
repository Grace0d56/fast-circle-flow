import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FastingMilestone, getMilestoneColor } from '@/lib/milestones';
import { Check, Clock } from 'lucide-react';

interface MilestoneDialogProps {
  milestone: FastingMilestone | null;
  isReached: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const MilestoneDialog = ({ 
  milestone, 
  isReached, 
  open, 
  onOpenChange 
}: MilestoneDialogProps) => {
  if (!milestone) return null;

  const color = getMilestoneColor(milestone.icon);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-card border-border max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: `${color}20`, border: `2px solid ${color}` }}
            >
              {isReached ? (
                <Check className="w-5 h-5" style={{ color }} />
              ) : (
                <Clock className="w-5 h-5" style={{ color }} />
              )}
            </div>
            <div>
              <span className="text-lg font-display">{milestone.title}</span>
              <p className="text-sm font-normal text-muted-foreground mt-0.5">
                {milestone.hours} hours
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 pt-2">
          <div className="glass rounded-lg p-4">
            <p className="text-foreground">{milestone.description}</p>
          </div>
          
          <div className="flex items-center gap-2 text-sm">
            {isReached ? (
              <span className="text-success flex items-center gap-1">
                <Check className="w-4 h-4" />
                Milestone reached!
              </span>
            ) : (
              <span className="text-muted-foreground">
                Keep going to reach this milestone
              </span>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
