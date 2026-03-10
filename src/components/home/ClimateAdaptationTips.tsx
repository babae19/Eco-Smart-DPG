
import React from 'react';
import { Leaf, Lightbulb, ArrowRight, Recycle, Droplets, Sun } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRotatingTips } from '@/hooks/useRotatingTips';
import { climateAdaptationTips } from '@/utils/climateAdaptationTips';
import { getDailyTips, getCurrentDateString } from '@/utils/dailyTipsSelector';
import { motion, AnimatePresence } from 'framer-motion';

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'water':
      return <Droplets className="h-5 w-5 text-blue-500" />;
    case 'energy':
      return <Sun className="h-5 w-5 text-amber-500" />;
    case 'resilience':
      return <Leaf className="h-5 w-5 text-green-500" />;
    case 'agriculture':
      return <Recycle className="h-5 w-5 text-emerald-500" />;
    default:
      return <Lightbulb className="h-5 w-5 text-purple-500" />;
  }
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'water':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'energy':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'resilience':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'agriculture':
      return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    default:
      return 'bg-purple-100 text-purple-800 border-purple-200';
  }
};

const ClimateAdaptationTips: React.FC = () => {
  // Get today's 10 selected tips
  const dailyTips = React.useMemo(() => getDailyTips(climateAdaptationTips, 10), []);
  const { currentTip, tipIndex } = useRotatingTips(dailyTips, 8000);
  const [showAllTips, setShowAllTips] = React.useState(false);

  if (!currentTip || dailyTips.length === 0) return null;

  return (
    <section className="mb-8 px-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-50/50 via-emerald-50/30 to-blue-50/50 dark:from-green-900/10 dark:via-emerald-900/5 dark:to-blue-900/10 rounded-3xl -z-10" />
      <div className="absolute top-4 right-8 w-32 h-32 bg-gradient-to-br from-green-200/20 to-emerald-300/20 dark:from-green-700/10 dark:to-emerald-600/10 rounded-full blur-2xl -z-10" />
      <div className="absolute bottom-8 left-8 w-24 h-24 bg-gradient-to-tr from-blue-200/20 to-green-300/20 dark:from-blue-700/10 dark:to-green-600/10 rounded-full blur-xl -z-10" />
      
      <div className="relative pt-6 pb-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 dark:from-green-600 dark:to-emerald-700 p-3 rounded-2xl shadow-lg">
                <Leaf size={28} className="text-white drop-shadow-sm" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse" />
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-green-700 to-emerald-700 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent">
                Daily Climate Tips
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                {getCurrentDateString()} • 🌱 {dailyTips.length} fresh tips today
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAllTips(!showAllTips)}
            className="text-sm gap-2 border-green-200 dark:border-green-800 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all duration-300 hover:shadow-md"
          >
            {showAllTips ? 'Show Less' : 'View All'}
            <ArrowRight size={16} className={`transition-transform duration-300 ${showAllTips ? 'rotate-90' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Featured Tip Card */}
      <Card className="mb-6 relative overflow-hidden border-0 bg-gradient-to-br from-white via-green-50/80 to-emerald-50 dark:from-gray-900 dark:via-green-900/20 dark:to-emerald-900/30 shadow-xl">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-green-200/30 to-transparent dark:from-green-700/20 rounded-full blur-xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-emerald-200/20 to-transparent dark:from-emerald-700/10 rounded-full blur-2xl" />
        
        <CardHeader className="pb-4 relative z-10">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-bold text-green-800 dark:text-green-200 flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-800 dark:to-emerald-800 rounded-xl shadow-sm">
                {getCategoryIcon(currentTip.category)}
              </div>
              ✨ Featured Climate Tip
            </CardTitle>
            <Badge className={`${getCategoryColor(currentTip.category)} font-semibold px-3 py-1 shadow-sm`}>
              {currentTip.category}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="relative z-10 pb-6">
          <AnimatePresence>
            <motion.div
              key={tipIndex}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -30, scale: 0.95 }}
              transition={{ 
                duration: 0.6,
                type: "spring",
                stiffness: 200,
                damping: 20
              }}
              className="mb-6"
            >
              <div className="p-4 bg-white/70 dark:bg-gray-800/70 rounded-2xl backdrop-blur-sm border border-green-100/50 dark:border-green-800/50 shadow-inner">
                <p className="text-gray-800 dark:text-gray-200 text-lg leading-relaxed font-medium">
                  {currentTip.tip}
                </p>
              </div>
            </motion.div>
          </AnimatePresence>
          
          {/* Enhanced Progress Indicator */}
          <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-100/80 to-emerald-100/80 dark:from-green-900/40 dark:to-emerald-900/40 rounded-xl backdrop-blur-sm">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm font-semibold">Tip {tipIndex + 1} of {dailyTips.length}</span>
            </div>
            <div className="flex-1 bg-green-200/60 dark:bg-green-800/60 h-2 rounded-full overflow-hidden shadow-inner">
              <motion.div 
                className="bg-gradient-to-r from-green-500 to-emerald-500 h-full rounded-full shadow-sm"
                initial={{ width: 0 }}
                animate={{ width: `${((tipIndex + 1) / dailyTips.length) * 100}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
            <span className="text-xs text-green-600 dark:text-green-400 font-medium">
              {Math.round(((tipIndex + 1) / dailyTips.length) * 100)}%
            </span>
          </div>
        </CardContent>
      </Card>

      {/* All Tips Grid - Expandable */}
      <AnimatePresence>
        {showAllTips && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {dailyTips.map((tip, index) => (
                <motion.div
                  key={tip.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-md transition-shadow border-gray-200 dark:border-gray-700">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-1">
                          {getCategoryIcon(tip.category)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className={getCategoryColor(tip.category)}>
                              {tip.category}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                            {tip.tip}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Actions */}
      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="flex items-center gap-2 mb-2">
          <Lightbulb size={16} className="text-blue-600 dark:text-blue-400" />
          <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
            Daily Environmental Actions
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="text-xs">10 new tips daily</Badge>
          <Badge variant="secondary" className="text-xs">Rotating every 8 seconds</Badge>
          <Badge variant="secondary" className="text-xs">Climate protection focus</Badge>
          <Badge variant="secondary" className="text-xs">Fresh content daily</Badge>
        </div>
      </div>
    </section>
  );
};

export default ClimateAdaptationTips;
