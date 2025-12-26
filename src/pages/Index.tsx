import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useFasting } from '@/hooks/useFasting';
import { CircularProgress } from '@/components/CircularProgress';
import { GoalInput } from '@/components/GoalInput';
import { StatsView } from '@/components/StatsView';
import { FastingHistory } from '@/components/FastingHistory';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Square, Timer, BarChart3, History } from 'lucide-react';

const Index = () => {
  const {
    isActive,
    goalHours,
    sessions,
    weightEntries,
    elapsedTime,
    progress,
    startFasting,
    stopFasting,
    clearHistory,
    addWeightEntry,
    clearWeightEntries,
  } = useFasting();

  const [stopConfirmOpen, setStopConfirmOpen] = useState(false);

  const handleStopClick = () => {
    setStopConfirmOpen(true);
  };

  const handleConfirmStop = () => {
    stopFasting();
    setStopConfirmOpen(false);
  };

  const handleStartFasting = (goal: number, lastMealTime: Date) => {
    startFasting(goal, lastMealTime);
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
        <header className="pt-safe px-4 py-6">
          <div className="flex items-center justify-center gap-2">
            <Timer className="w-6 h-6 text-primary" />
            <h1 className="font-display text-xl font-bold gradient-text">FastTrack</h1>
          </div>
        </header>

        {/* Main content */}
        <div className="flex-1 px-4 pb-4">
          <Tabs defaultValue="timer" className="h-full flex flex-col">
            <TabsList className="grid w-full grid-cols-3 bg-secondary/50 p-1 rounded-xl mb-6">
              <TabsTrigger 
                value="timer" 
                className="rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-md flex items-center gap-2"
              >
                <Timer className="w-4 h-4" />
                <span className="hidden sm:inline">Timer</span>
              </TabsTrigger>
              <TabsTrigger 
                value="stats"
                className="rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-md flex items-center gap-2"
              >
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">Stats</span>
              </TabsTrigger>
              <TabsTrigger 
                value="history"
                className="rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-md flex items-center gap-2"
              >
                <History className="w-4 h-4" />
                <span className="hidden sm:inline">History</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="timer" className="flex-1 flex flex-col items-center mt-0">
              {isActive ? (
                <>
                  {/* Circular Timer */}
                  <div className="flex-1 flex items-center justify-center">
                    <CircularProgress
                      progress={progress}
                      elapsedTime={elapsedTime}
                      goalHours={goalHours}
                      isActive={isActive}
                    />
                  </div>

                  {/* Stop Button */}
                  <div className="w-full max-w-sm pb-safe">
                    <Button
                      variant="destructive"
                      size="xl"
                      className="w-full"
                      onClick={handleStopClick}
                    >
                      <Square className="w-5 h-5 mr-2" />
                      End Fast
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  {/* Idle State Circle */}
                  <div className="flex-1 flex items-center justify-center">
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

            <TabsContent value="stats" className="flex-1 mt-0 overflow-auto">
              <StatsView 
                sessions={sessions}
                weightEntries={weightEntries}
                onAddWeightEntry={addWeightEntry}
                onClearHistory={clearHistory}
                onClearWeightEntries={clearWeightEntries}
              />
            </TabsContent>

            <TabsContent value="history" className="flex-1 mt-0 overflow-auto">
              <FastingHistory sessions={sessions} />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* Stop Confirmation Dialog */}
      <ConfirmDialog
        open={stopConfirmOpen}
        onOpenChange={setStopConfirmOpen}
        title="End Fast?"
        description="Are you sure you want to end your current fast? This action cannot be undone."
        confirmText="Yes, End Fast"
        variant="destructive"
        onConfirm={handleConfirmStop}
      />
    </>
  );
};

export default Index;
