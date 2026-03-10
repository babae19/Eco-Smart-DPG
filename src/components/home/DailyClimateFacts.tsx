
import React, { useEffect, useState } from 'react';
import { useWeatherForecast } from '@/hooks/useWeatherForecast';
import { useToast } from '@/hooks/use-toast';
import ClimateFactCard from './climate-facts/ClimateFactCard';
import ClimateFactsHeader from './climate-facts/ClimateFactsHeader';
import { useDailyFacts } from './climate-facts/useDailyFacts';
import { ClimateFact } from './climate-facts/climateFacts';

interface DailyClimateFacts {
  maxFacts?: number;
  onFactsLoaded?: (facts: ClimateFact[]) => void;
}

const DailyClimateFacts: React.FC<DailyClimateFacts> = ({ 
  maxFacts = 5, 
  onFactsLoaded 
}) => {
  const { weeklyForecast } = useWeatherForecast();
  const { toast } = useToast();
  const [factsLoaded, setFactsLoaded] = useState(false);
  const dailyFacts = useDailyFacts();
  
  // Debug information
  useEffect(() => {
    console.log('DailyClimateFacts rendered with:', {
      factsCount: dailyFacts.length,
      maxFacts,
      weeklyForecastAvailable: Boolean(weeklyForecast?.length),
      factTitles: dailyFacts.map(fact => fact.title),
      // Import from climateFacts directly instead of using require
      totalAvailableFacts: dailyFacts.length
    });
  }, [dailyFacts, maxFacts, weeklyForecast]);
  
  useEffect(() => {
    if (onFactsLoaded && dailyFacts.length > 0) {
      try {
        console.log('Calling onFactsLoaded with', dailyFacts.length, 'facts');
        onFactsLoaded(dailyFacts);
        setFactsLoaded(true);
      } catch (error) {
        console.error('Error in onFactsLoaded callback:', error);
      }
    }
  }, [dailyFacts, onFactsLoaded]);
  
  useEffect(() => {
    if (weeklyForecast?.length > 0 && weeklyForecast[0]) {
      const currentWeather = weeklyForecast[0];
      console.log('Current weather data for alerts:', {
        temp: currentWeather.temp,
        precipChance: currentWeather.precipChance
      });
      
      if (currentWeather.temp > 35) {
        toast({
          title: "Extreme Heat Warning",
          description: "Temperature exceeds 35°C. Stay hydrated and avoid prolonged sun exposure.",
          variant: "destructive",
        });
      }
      
      if (currentWeather.precipChance > 70) {
        toast({
          title: "Heavy Rain Alert",
          description: "High probability of heavy rainfall. Be prepared for potential flooding.",
          variant: "destructive",
        });
      }
    } else if (weeklyForecast !== undefined && weeklyForecast !== null) {
      console.log('Weather forecast is empty or loading, no weather alerts generated');
    }
  }, [weeklyForecast, toast]);

  // Ensure we have facts to display
  if (dailyFacts.length === 0) {
    return (
      <section className="mb-8 relative">
        <ClimateFactsHeader />
        <div className="p-6 bg-gradient-to-br from-violet-50 to-indigo-50 rounded-xl text-gray-600 text-sm flex justify-center items-center h-32">
          <div className="animate-pulse flex space-x-4">
            <div className="flex-1 space-y-4 py-1">
              <div className="h-4 bg-violet-200 rounded w-3/4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-indigo-200 rounded"></div>
                <div className="h-4 bg-indigo-200 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mb-8 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-violet-300/20 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-indigo-300/20 rounded-full blur-3xl"></div>
      
      <div className="backdrop-blur-sm bg-white/60 rounded-2xl p-6 shadow-lg border border-indigo-100">
        <ClimateFactsHeader />
        
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {dailyFacts.slice(0, maxFacts).map((fact, index) => (
            <ClimateFactCard
              key={`${fact.title}-${index}`}
              title={fact.title}
              description={fact.description}
              alertLevel={fact.alertLevel}
            />
          ))}
        </div>
        
        <div className="mt-4 text-xs text-indigo-500 text-center">
          These facts rotate daily - check back tomorrow for new insights!
        </div>
      </div>
      
      {factsLoaded && <div className="hidden">Facts successfully loaded and processed</div>}
    </section>
  );
};

export default DailyClimateFacts;
