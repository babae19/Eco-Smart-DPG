import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, ChevronRight, AlertTriangle, Shield, Info, 
  Sparkles, Globe, Zap, TrendingUp, RefreshCw, Clock
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useDailyFacts } from './useDailyFacts';
import { ClimateFact } from './climateFacts';

interface FuturisticClimateFactsProps {
  maxFacts?: number;
  onFactsLoaded?: (facts: ClimateFact[]) => void;
}

const FuturisticClimateFacts: React.FC<FuturisticClimateFactsProps> = ({ 
  maxFacts = 5, 
  onFactsLoaded 
}) => {
  const dailyFacts = useDailyFacts();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  
  const factsToShow = dailyFacts.slice(0, maxFacts);
  const currentFact = factsToShow[currentIndex];

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying || factsToShow.length === 0) return;
    
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          setCurrentIndex(current => (current + 1) % factsToShow.length);
          return 0;
        }
        return prev + 2;
      });
    }, 100);

    return () => clearInterval(progressInterval);
  }, [isAutoPlaying, factsToShow.length, currentIndex]);

  // Notify parent when facts are loaded
  useEffect(() => {
    if (onFactsLoaded && factsToShow.length > 0) {
      onFactsLoaded(factsToShow);
    }
  }, [factsToShow, onFactsLoaded]);

  const goToNext = useCallback(() => {
    setCurrentIndex(current => (current + 1) % factsToShow.length);
    setProgress(0);
  }, [factsToShow.length]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex(current => (current - 1 + factsToShow.length) % factsToShow.length);
    setProgress(0);
  }, [factsToShow.length]);

  const getAlertConfig = (alertLevel?: 'warning' | 'danger' | 'info') => {
    switch (alertLevel) {
      case 'danger':
        return {
          icon: AlertTriangle,
          gradient: 'from-red-600 via-rose-500 to-orange-500',
          bgGlow: 'bg-red-500/20',
          iconBg: 'bg-red-500',
          textColor: 'text-red-600 dark:text-red-400',
          borderColor: 'border-red-500/30',
          badge: 'Critical Alert',
          badgeBg: 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700'
        };
      case 'warning':
        return {
          icon: Shield,
          gradient: 'from-amber-500 via-yellow-500 to-orange-400',
          bgGlow: 'bg-amber-500/20',
          iconBg: 'bg-amber-500',
          textColor: 'text-amber-600 dark:text-amber-400',
          borderColor: 'border-amber-500/30',
          badge: 'Warning',
          badgeBg: 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-700'
        };
      default:
        return {
          icon: Info,
          gradient: 'from-emerald-600 via-green-500 to-teal-500',
          bgGlow: 'bg-emerald-500/20',
          iconBg: 'bg-emerald-500',
          textColor: 'text-emerald-600 dark:text-emerald-400',
          borderColor: 'border-emerald-500/30',
          badge: 'Climate Insight',
          badgeBg: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700'
        };
    }
  };

  const getCategoryIcon = (category?: string) => {
    switch (category) {
      case 'climate':
        return Globe;
      case 'environment':
        return TrendingUp;
      case 'ecology':
        return Sparkles;
      default:
        return Globe;
    }
  };

  if (factsToShow.length === 0) {
    return (
      <section className="mb-8">
        <Card className="p-8 bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-900">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin text-emerald-500 mr-3" />
            <span className="text-muted-foreground">Loading climate insights...</span>
          </div>
        </Card>
      </section>
    );
  }

  const config = getAlertConfig(currentFact?.alertLevel);
  const IconComponent = config.icon;
  const CategoryIcon = getCategoryIcon(currentFact?.category);

  return (
    <section className="mb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <motion.div 
            className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25"
            whileHover={{ scale: 1.05, rotate: 5 }}
          >
            <Zap className="h-6 w-6 text-white" />
          </motion.div>
          <div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
              Climate Insights
              <Sparkles className="h-5 w-5 text-amber-500" />
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
              <Clock className="h-3 w-3" />
              Updated daily • {factsToShow.length} insights
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsAutoPlaying(!isAutoPlaying)}
          className={cn(
            "rounded-xl transition-all",
            isAutoPlaying 
              ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/50 dark:text-emerald-300" 
              : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400"
          )}
        >
          {isAutoPlaying ? 'Auto' : 'Manual'}
        </Button>
      </div>

      {/* Main Card */}
      <Card className="relative overflow-hidden border-0 shadow-xl">
        {/* Animated Background */}
        <div className={cn(
          "absolute inset-0 bg-gradient-to-br opacity-90",
          config.gradient
        )} />
        
        {/* Floating Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-3 h-3 bg-white/10 rounded-full"
              style={{
                left: `${10 + i * 12}%`,
                top: `${15 + (i % 4) * 20}%`,
              }}
              animate={{
                y: [-15, 15, -15],
                x: [-5, 5, -5],
                opacity: [0.2, 0.5, 0.2],
                scale: [0.8, 1.2, 0.8],
              }}
              transition={{
                duration: 4 + i * 0.5,
                repeat: Infinity,
                delay: i * 0.3,
              }}
            />
          ))}
          
          {/* Glowing orbs */}
          <motion.div 
            className="absolute -top-20 -right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"
            animate={{ 
              scale: [1, 1.3, 1],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{ duration: 6, repeat: Infinity }}
          />
          <motion.div 
            className="absolute -bottom-16 -left-16 w-48 h-48 bg-white/10 rounded-full blur-2xl"
            animate={{ 
              scale: [1.2, 1, 1.2],
              opacity: [0.2, 0.4, 0.2]
            }}
            transition={{ duration: 5, repeat: Infinity }}
          />
        </div>

        {/* Content */}
        <div className="relative p-6">
          {/* Top Row */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Badge className={cn("text-xs font-bold border", config.badgeBg)}>
                <IconComponent className="h-3 w-3 mr-1" />
                {config.badge}
              </Badge>
              <Badge variant="outline" className="bg-white/20 text-white border-white/30 text-xs backdrop-blur-sm">
                <CategoryIcon className="h-3 w-3 mr-1" />
                {currentFact?.category || 'climate'}
              </Badge>
            </div>
            <span className="text-white/80 text-sm font-medium">
              {currentIndex + 1} / {factsToShow.length}
            </span>
          </div>

          {/* Fact Content with Animation */}
          <AnimatePresence exitBeforeEnter>
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="min-h-[140px]"
            >
              <h3 className="text-2xl font-bold text-white mb-3 drop-shadow-lg">
                {currentFact?.title}
              </h3>
              <p className="text-white/90 text-base leading-relaxed drop-shadow-md">
                {currentFact?.description}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Progress Bar */}
          <div className="mt-6 mb-4">
            <Progress 
              value={progress} 
              className="h-1.5 bg-white/20"
            />
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={goToPrevious}
              className="h-10 w-10 rounded-xl bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm border border-white/20"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>

            {/* Dot Indicators */}
            <div className="flex items-center gap-2">
              {factsToShow.map((_, idx) => (
                <motion.button
                  key={idx}
                  onClick={() => {
                    setCurrentIndex(idx);
                    setProgress(0);
                  }}
                  className={cn(
                    "rounded-full transition-all",
                    idx === currentIndex 
                      ? "w-8 h-3 bg-white" 
                      : "w-3 h-3 bg-white/40 hover:bg-white/60"
                  )}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                />
              ))}
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={goToNext}
              className="h-10 w-10 rounded-xl bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm border border-white/20"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Bottom Info */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-3 text-center"
      >
        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center justify-center gap-2">
          <Sparkles className="h-3 w-3 text-emerald-500" />
          New insights every day • Swipe or click to explore
          <Sparkles className="h-3 w-3 text-emerald-500" />
        </p>
      </motion.div>
    </section>
  );
};

export default FuturisticClimateFacts;
