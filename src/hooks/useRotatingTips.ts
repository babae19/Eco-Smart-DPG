
import { useState, useEffect } from 'react';
import { ClimateAdaptationTip } from '@/utils/climateAdaptationTips';

export function useRotatingTips(
  tips: ClimateAdaptationTip[], 
  intervalMs: number = 10000
) {
  const [currentTip, setCurrentTip] = useState<ClimateAdaptationTip | null>(tips[0] || null);
  const [tipIndex, setTipIndex] = useState(0);
  
  useEffect(() => {
    if (tips.length === 0) return;
    
    // Set initial tip
    setCurrentTip(tips[0]);
    
    // Set up rotation interval
    const interval = setInterval(() => {
      setTipIndex(prevIndex => {
        const nextIndex = (prevIndex + 1) % tips.length;
        setCurrentTip(tips[nextIndex]);
        return nextIndex;
      });
    }, intervalMs);
    
    // Clean up interval on unmount
    return () => clearInterval(interval);
  }, [tips, intervalMs]);
  
  return { currentTip, tipIndex };
}
