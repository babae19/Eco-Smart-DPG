
import React, { useState, useEffect, useRef } from 'react';
import { Leaf, RefreshCw, ChevronRight, Sun, Moon, Cloud, CloudRain, Sprout, RecycleIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { getDailyTip, EnvironmentalTip, getAllTips } from '@/services/environmental';
import { useToast } from '@/hooks/use-toast';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { useWeatherForecast } from '@/hooks/useWeatherForecast';
import { useIsMobile } from '@/hooks/use-mobile';

const getWeatherIcon = (condition?: string) => {
  switch (condition?.toLowerCase()) {
    case 'sunny':
      return <Sun className="text-amber-500" size={20} />;
    case 'cloudy':
      return <Cloud className="text-gray-500" size={20} />;
    case 'rainy':
      return <CloudRain className="text-blue-500" size={20} />;
    default:
      return <Sun className="text-amber-500" size={20} />;
  }
};

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'Energy Conservation':
      return <Sun className="text-amber-500" />;
    case 'Water Conservation':
      return <CloudRain className="text-blue-500" />;
    case 'Waste Reduction':
      return <RecycleIcon className="text-purple-500" />;
    default:
      return <Sprout className="text-green-500" />;
  }
};

const getCategoryStyles = (category: string) => {
  switch (category) {
    case 'Energy Conservation':
      return {
        iconBg: 'bg-amber-100',
        iconText: 'text-amber-600',
        badgeBg: 'bg-amber-50',
        badgeText: 'text-amber-700',
      };
    case 'Water Conservation':
      return {
        iconBg: 'bg-blue-100',
        iconText: 'text-blue-600',
        badgeBg: 'bg-blue-50',
        badgeText: 'text-blue-700',
      };
    case 'Waste Reduction':
      return {
        iconBg: 'bg-purple-100',
        iconText: 'text-purple-600',
        badgeBg: 'bg-purple-50',
        badgeText: 'text-purple-700',
      };
    default:
      return {
        iconBg: 'bg-green-100',
        iconText: 'text-green-600',
        badgeBg: 'bg-green-50',
        badgeText: 'text-green-700',
      };
  }
};

const DailyEnvironmentalTip: React.FC = () => {
  const [tips, setTips] = useState<EnvironmentalTip[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const carouselRef = useRef<any>(null);
  const { weeklyForecast } = useWeatherForecast();
  const { isMobile } = useIsMobile();
  
  const currentWeather = weeklyForecast[0];

  const fetchTips = async () => {
    try {
      setLoading(true);
      const allTips = await getAllTips();
      setTips(allTips.slice(0, isMobile ? 5 : 10)); // Show fewer tips on mobile
    } catch (error) {
      console.error('Error fetching environmental tips:', error);
      toast({
        title: "Error",
        description: "Failed to load environmental tips",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTips();
  }, [isMobile]);

  const handleRefresh = async () => {
    if (refreshing) return;
    setRefreshing(true);
    await fetchTips();
    setRefreshing(false);
    toast({
      title: "New Tips Loaded",
      description: "Here are fresh environmental tips for you!",
    });
  };

  useEffect(() => {
    const slideInterval = setInterval(() => {
      if (tips.length > 0) {
        const api = carouselRef.current?.api;
        if (api) {
          const current = api.selectedScrollSnap();
          const next = (current + 1) % tips.length;
          api.scrollTo(next);
        }
      }
    }, isMobile ? 4000 : 5000); // Faster rotation on mobile

    return () => clearInterval(slideInterval);
  }, [tips, isMobile]);

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-xl shadow-md p-6 animate-pulse">
        <div className="h-6 bg-green-200 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-green-100 rounded w-full mb-3"></div>
        <div className="h-4 bg-green-100 rounded w-5/6 mb-3"></div>
        <div className="h-4 bg-green-100 rounded w-4/6"></div>
      </div>
    );
  }

  if (tips.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-3 text-center">
        <p className="text-gray-600 text-sm">Unable to load daily tips</p>
        <Button variant="outline" size="sm" onClick={fetchTips} className="mt-2">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden mb-8">
      {/* Decorative background elements */}
      <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-green-300/20 rounded-full blur-3xl"></div>
      <div className="absolute -top-10 -left-10 w-40 h-40 bg-emerald-300/20 rounded-full blur-3xl"></div>
      
      <div className="backdrop-blur-sm bg-white/60 rounded-2xl p-5 border border-green-100 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="bg-gradient-to-br from-green-400 to-emerald-500 p-2.5 rounded-xl shadow-lg mr-3 transform -rotate-3">
              <Leaf size={isMobile ? 18 : 22} className="text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-green-600 to-emerald-500 bg-clip-text text-transparent">
                Daily Eco Tips
              </h3>
              <p className="text-xs text-emerald-700 font-medium">Small changes, big impact</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleRefresh} 
            disabled={refreshing}
            className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
          >
            <RefreshCw size={isMobile ? 14 : 16} className={`${refreshing ? 'animate-spin' : ''} mr-1`} />
            <span className={`${isMobile ? 'hidden' : 'inline'} text-sm`}>Refresh</span>
          </Button>
        </div>
        
        <Carousel className="w-full" ref={carouselRef}>
          <CarouselContent>
            {tips.map((tip, index) => {
              const styles = getCategoryStyles(tip.category);
              return (
                <CarouselItem key={index}>
                  <div className="bg-gradient-to-br from-white to-green-50/80 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-green-100">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className={`w-12 h-12 ${styles.iconBg} rounded-xl flex items-center justify-center ${styles.iconText} shadow-sm`}>
                          {getCategoryIcon(tip.category)}
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-lg text-gray-800 mb-2">
                          {tip.title}
                        </h4>
                        <p className={`text-gray-600 mb-3 ${isMobile ? 'text-sm line-clamp-3' : 'line-clamp-4'}`}>
                          {tip.content}
                        </p>
                        <div className="flex items-center justify-between">
                          <span className={`text-xs px-3 py-1 rounded-full font-medium ${styles.badgeBg} ${styles.badgeText}`}>
                            {tip.category}
                          </span>
                          {!isMobile && <span className="text-xs text-gray-500 italic">Source: {tip.source}</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                </CarouselItem>
              );
            })}
          </CarouselContent>
          <div className="flex items-center justify-center gap-2 mt-3">
            <CarouselPrevious className={`relative -left-0 ${isMobile ? 'h-8 w-8' : 'h-9 w-9'} rounded-full bg-green-100 text-green-600 hover:bg-green-200 border-green-200`} />
            <div className="flex space-x-1">
              {tips.slice(0, Math.min(5, tips.length)).map((_, i) => (
                <div key={i} className={`w-2 h-2 rounded-full ${i === (carouselRef.current?.api?.selectedScrollSnap() || 0) ? 'bg-green-500' : 'bg-green-200'}`}></div>
              ))}
            </div>
            <CarouselNext className={`relative -right-0 ${isMobile ? 'h-8 w-8' : 'h-9 w-9'} rounded-full bg-green-100 text-green-600 hover:bg-green-200 border-green-200`} />
          </div>
        </Carousel>
        
        <div className="mt-4 pt-2 border-t border-green-100 flex justify-between items-center">
          <span className="text-xs text-green-700 font-medium flex items-center">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></span>
            Updated daily
          </span>
          <button 
            className="text-sm text-green-600 hover:text-green-700 flex items-center transition-colors font-medium"
            onClick={() => navigate('/tips')}
          >
            View all eco tips <ChevronRight size={isMobile ? 14 : 16} className="ml-1" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DailyEnvironmentalTip;
