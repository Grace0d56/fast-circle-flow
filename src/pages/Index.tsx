import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useFasting, MealType, ActivityLevel } from '@/hooks/useFasting';
import { CircularProgress } from '@/components/CircularProgress';
import { GoalInput } from '@/components/GoalInput';
import { StatsView } from '@/components/StatsView';
import { FastingHistory } from '@/components/FastingHistory';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Square, Timer, BarChart3, History, Sofa, Footprints, Bike, Flame } from 'lucide-react';

const ACTIVITY_OPTIONS: { value: ActivityLevel; label: string; description: string; icon: React.ReactNode }[] = [
  { value: 'sedentary', label: 'Sedentary', description: 'Mostly sitting, minimal movement', icon: <Sofa className="w-5 h-5" /> },
  { value: 'light', label: 'Light', description: 'Some walking, light chores', icon: <Footprints className="w-5 h-5" /> },
  { value: 'moderate', label: 'Moderate', description: 'Regular walking, active work', icon: <Bike className="w-5 h-5" /> },
  { value: 'high', label: 'High', description: 'Exercise, physical labor', icon: <Flame className="w-5 h-5" /> },
];

const Index = () => {
  const {
    isActive,
    startTime,
    goalHours,
    sessions,
    weightEntries,
    elapsedTime,
    progress,
    startFasting,
    stopFasting,
    clearHistory,
    deleteSession,
    updateSession,
    addWeightEntry,
    updateWeightEntry,
    deleteWeightEntry,
    clearWeightEntries,
  } = useFasting();

  const [stopDialogOpen, setStopDialogOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<ActivityLevel>('sedentary');

  const handleStopClick = () => {
    setSelectedActivity('sedentary');
    setStopDialogOpen(true);
  };

  const handleConfirmStop = () => {
    stopFasting(selectedActivity);
    setStopDialogOpen(false);
  };

  const handleStartFasting = (goal: number, lastMealTime: Date, lastMealType: MealType) => {
    startFasting(goal, lastMealTime, lastMealType);
  };

  return (
    <>
      <Helmet>
        <title>FastTrack - Intermittent Fasting Tracker</title>
        <meta name="description" content="Track your fasting journey with FastTrack. Set goals, monitor progress, and achieve a healthier lifestyle with intermittent fasting." />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <meta name="theme-color" content="#0f1419" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </Helmet>

      <main className="min-h-screen bg-background flex flex-col relative">
        {/* Theme Switcher */}
        <ThemeSwitcher />

        {/* Header */}
        <header className="pt-safe px-4 py-4">
          <div className="flex items-center justify-center gap-2">
            <Timer className="w-5 h-5 text-primary" />
            <h1 className="font-display text-lg font-bold gradient-text">FastTrack</h1>
          </div>
        </header>

        {/* Main content */}
        <div className="flex-1 px-3 sm:px-4 pb-4 flex flex-col">
          <Tabs defaultValue="timer" className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-3 bg-secondary/50 p-1 rounded-xl mb-4">
              <TabsTrigger
                value="timer"
                className="rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-md flex items-center justify-center gap-1.5 text-xs sm:text-sm py-2"
              >
                <Timer className="w-4 h-4" />
                <span>Timer</span>
              </TabsTrigger>
              <TabsTrigger
                value="stats"
                className="rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-md flex items-center justify-center gap-1.5 text-xs sm:text-sm py-2"
              >
                <BarChart3 className="w-4 h-4" />
                <span>Stats</span>
              </TabsTrigger>
              <TabsTrigger
                value="history"
                className="rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-md flex items-center justify-center gap-1.5 text-xs sm:text-sm py-2"
              >
                <History className="w-4 h-4" />
                <span>History</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="timer" className="flex-1 flex flex-col items-center mt-0">
              {isActive ? (
                <>
                  {/* Circular Timer */}
                  <div className="flex-1 flex items-center justify-center py-4">
                    <CircularProgress
                      progress={progress}
                      elapsedTime={elapsedTime}
                      goalHours={goalHours}
                      isActive={isActive}
                      startTime={startTime}
                    />
                  </div>

                  {/* Stop Button - with more space from circle */}
                  <div className="w-full max-w-sm pb-safe mt-6">
                    <Button
                      variant="destructive"
                      size="lg"
                      className="w-full h-12 text-base font-medium"
                      onClick={handleStopClick}
                    >
                      <Square className="w-4 h-4 mr-2" />
                      End Fast
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  {/* Idle State Circle */}
                  <div className="flex-1 flex items-center justify-center py-4">
                    <CircularProgress
                      progress={0}
                      elapsedTime={0}
                      goalHours={16}
                      isActive={false}
                    />
                  </div>

                  {/* Goal Input */}
                  <div className="w-full max-w-sm pb-safe">
                    <GoalInput
                      onStart={handleStartFasting}
                      disabled={isActive}
                    />
                  </div>
                </>
              )}
            </TabsContent>

            <TabsContent value="stats" className="flex-1 mt-0 overflow-auto -mx-1 px-1">
              <StatsView
                sessions={sessions}
                weightEntries={weightEntries}
                onAddWeightEntry={addWeightEntry}
                onUpdateWeightEntry={updateWeightEntry}
                onDeleteWeightEntry={deleteWeightEntry}
                onClearHistory={clearHistory}
                onClearWeightEntries={clearWeightEntries}
              />
            </TabsContent>

            <TabsContent value="history" className="flex-1 mt-0 overflow-auto -mx-1 px-1">
              <FastingHistory
                sessions={sessions}
                weightEntries={weightEntries}
                onUpdateSession={updateSession}
                onDeleteSession={deleteSession}
              />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* End Fast Dialog with Activity Level Selection */}
      <Dialog open={stopDialogOpen} onOpenChange={setStopDialogOpen}>
        <DialogContent className="bg-card border-border max-w-sm">
          <DialogHeader>
            <DialogTitle>End Fast</DialogTitle>
            <DialogDescription>
              How active were you during this fast?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            {ACTIVITY_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setSelectedActivity(option.value)}
                className={`w-full p-3 rounded-lg border text-left transition-all flex items-center gap-3 ${selectedActivity === option.value
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-card hover:border-primary/50'
                  }`}
              >
                <div className={`${selectedActivity === option.value ? 'text-primary' : 'text-muted-foreground'}`}>
                  {option.icon}
                </div>
                <div>
                  <span className={`block text-sm font-medium ${selectedActivity === option.value ? 'text-primary' : 'text-foreground'}`}>
                    {option.label}
                  </span>
                  <span className="block text-xs text-muted-foreground">
                    {option.description}
                  </span>
                </div>
              </button>
            ))}
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              variant="glass"
              onClick={() => setStopDialogOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmStop}
              className="flex-1"
            >
              End Fast
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Index;