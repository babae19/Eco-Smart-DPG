
import React from 'react';
import { Lightbulb, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useRealtimeDateTime } from '@/contexts/RealtimeDateTimeContext';
import { useRotatingTips } from '@/hooks/useRotatingTips';
import { climateAdaptationTips } from '@/utils/climateAdaptationTips';
import { getDailyTips } from '@/utils/dailyTipsSelector';

const ClimateTipsBanner: React.FC = () => {
  const { currentDateTime } = useRealtimeDateTime();
  const dateKey = React.useMemo(() => {
    const d = currentDateTime;
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }, [currentDateTime]);
  const dailyTips = React.useMemo(() => getDailyTips(climateAdaptationTips, 10), [dateKey]);
  const [open, setOpen] = React.useState(false);
  const { currentTip, tipIndex } = useRotatingTips(dailyTips, 8000);

  if (!currentTip) return null;

  const progress = ((tipIndex + 1) / dailyTips.length) * 100;

  return (
    <section aria-label="Daily climate tips banner" className="mb-6">
      <div className="relative overflow-hidden rounded-2xl shadow-md text-primary-foreground min-h-[320px] sm:min-h-[360px]">
        <img
          src="/lovable-uploads/982c52ed-835a-4899-9515-b51a4c90cca1.png"
          alt="Nature background for daily climate tips"
          className="absolute inset-0 h-full w-full object-cover"
          loading="eager"
          decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-black/20" aria-hidden />
        {/* Decorative orbs */}
        <div className="pointer-events-none absolute -top-10 -left-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-12 -right-16 h-40 w-40 rounded-full bg-white/10 blur-3xl" />

        <div className="relative z-10 flex h-full flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          {/* Left: Icon + Text */}
          <div className="flex items-start gap-3 sm:items-center bg-success/90 text-success-foreground rounded-xl p-4 sm:p-5 ring-1 ring-success/30 shadow-sm max-w-full sm:max-w-[60ch]">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-success-foreground/20">
              <Lightbulb className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-semibold leading-none drop-shadow-md">Daily Climate Tip</h2>
                <Badge variant="secondary" className="h-6 rounded-full px-2 text-xs sm:text-sm text-foreground">
                  {currentTip.category}
                </Badge>
              </div>
              <p className="mt-2 line-clamp-4 sm:line-clamp-3 text-sm sm:text-base opacity-95 drop-shadow">{currentTip.tip}</p>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="relative z-20 flex items-center gap-3">
            <div className="hidden sm:block text-xs opacity-90">
              Tip {tipIndex + 1} of {dailyTips.length}
            </div>
            <Button
              variant="secondary"
              size="sm"
              aria-label="See more climate tips"
              className="gap-1 text-foreground bg-background/80 backdrop-blur-md ring-1 ring-border hover:bg-background/90"
              onClick={() => setOpen(true)}
            >
              Explore tips
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="relative z-10 h-1 w-full bg-background/60 backdrop-blur-sm">
          <div
            className="h-full bg-primary transition-[width] duration-700 ease-out"
            style={{ width: `${progress}%` }}
            aria-hidden
          />
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Today's 10 Climate Tips</DialogTitle>
            <DialogDescription>These tips refresh every 24 hours.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
            {dailyTips.map((tip, idx) => (
              <div key={tip.id ?? idx} className="rounded-lg border bg-background/80 p-3 sm:p-4 flex items-start gap-3">
                <Badge variant="secondary" className="capitalize shrink-0">{tip.category}</Badge>
                <p className="text-sm sm:text-base leading-relaxed">{tip.tip}</p>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default ClimateTipsBanner;
