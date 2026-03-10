
import { useMemo } from 'react';
import { ClimateFact, climateFacts } from './climateFacts';
import { useRealtimeDateTime } from '@/contexts/RealtimeDateTimeContext';

export const useDailyFacts = () => {
  const { currentDateTime } = useRealtimeDateTime();
  
  return useMemo(() => {
    // Get a seed based on the current date (year, month, day)
    const dayOfYear = Math.floor(currentDateTime.getTime() / (1000 * 60 * 60 * 24));
    const factsCount = climateFacts.length;
    
    // Make sure we have enough facts
    if (factsCount < 5) {
      console.warn('Not enough climate facts available. Need at least 5 facts.');
      return climateFacts;
    }
    
    // Calculate the starting index for today's facts
    // This will change each day but remain consistent throughout the day
    const startIndex = dayOfYear % (factsCount - 4);
    
    console.log('Daily facts calculation:', { 
      date: currentDateTime.toLocaleDateString(),
      dayOfYear, 
      factsCount, 
      startIndex,
      totalFactsAvailable: climateFacts.length
    });
    
    // Select exactly 5 facts for today
    const dailyFacts = climateFacts.slice(startIndex, startIndex + 5);
    
    return dailyFacts;
  }, [currentDateTime]);
};
