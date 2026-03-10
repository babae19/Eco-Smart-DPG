import React from 'react';
import { Leaf, ArrowRight, Zap, Droplets, Recycle, Wind, Sun, Shield } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getDailyTips, getCurrentDateString } from '@/utils/dailyTipsSelector';
import { climateAdaptationTips } from '@/utils/climateAdaptationTips';
import { useNavigate } from 'react-router-dom';

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'water':
      return <Droplets className="h-4 w-4" />;
    case 'energy':
      return <Zap className="h-4 w-4" />;
    case 'resilience':
      return <Shield className="h-4 w-4" />;
    case 'agriculture':
      return <Sun className="h-4 w-4" />;
    case 'health':
      return <Wind className="h-4 w-4" />;
    default:
      return <Recycle className="h-4 w-4" />;
  }
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'water':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
    case 'energy':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
    case 'resilience':
      return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
    case 'agriculture':
      return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-300';
    case 'health':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
  }
};

const DailyEnvironmentalTips: React.FC = () => {
  const navigate = useNavigate();
  // Get exactly 6 daily tips
  const dailyTips = React.useMemo(() => getDailyTips(climateAdaptationTips, 6), []);

  const handleViewMore = () => {
    navigate('/environmental-tips');
  };

  return (
    <section className="mb-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-2.5 rounded-xl">
            <Leaf size={24} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">
              Daily Environmental Tips
            </h2>
            <p className="text-sm text-muted-foreground">
              {getCurrentDateString()} • 6 tips for today
            </p>
          </div>
        </div>
        <Button
          onClick={handleViewMore}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          View More
          <ArrowRight size={16} />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {dailyTips.map((tip, index) => (
          <Card key={tip.id} className="h-full transition-all duration-200 hover:shadow-md">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-muted rounded-lg">
                    {getCategoryIcon(tip.category)}
                  </div>
                  <Badge variant="secondary" className={getCategoryColor(tip.category)}>
                    {tip.category}
                  </Badge>
                </div>
                <span className="text-xs text-muted-foreground font-medium">
                  #{index + 1}
                </span>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-foreground leading-relaxed">
                {tip.tip}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-4 p-3 bg-muted rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Leaf size={16} className="text-green-600" />
            <span className="text-sm font-medium text-foreground">
              Fresh daily tips selected for sustainable living
            </span>
          </div>
          <Button
            onClick={handleViewMore}
            variant="ghost"
            size="sm"
            className="text-xs"
          >
            Explore All Tips
          </Button>
        </div>
      </div>
    </section>
  );
};

export default DailyEnvironmentalTips;