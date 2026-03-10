
import { ClimateAdaptationTip } from './climateAdaptationTips';

/**
 * Selects 10 tips for the current day based on the date
 * This ensures the same 10 tips are shown throughout the entire day
 * but different tips are shown on different days
 */
export function getDailyTips(allTips: ClimateAdaptationTip[], tipsPerDay: number = 10): ClimateAdaptationTip[] {
  // Get current date as YYYY-MM-DD to ensure consistency throughout the day
  const today = new Date();
  // Use local date to avoid UTC timezone shifts at midnight
  const dateString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  
  // Create a simple hash from the date string to use as seed
  let hash = 0;
  for (let i = 0; i < dateString.length; i++) {
    const char = dateString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Use the hash to create a pseudo-random but deterministic selection
  const totalTips = allTips.length;
  const selectedTips: ClimateAdaptationTip[] = [];
  const usedIndices = new Set<number>();
  
  // Generate deterministic "random" indices based on the date hash
  let currentSeed = Math.abs(hash);
  
  while (selectedTips.length < Math.min(tipsPerDay, totalTips)) {
    // Simple linear congruential generator for deterministic randomness
    currentSeed = (currentSeed * 1103515245 + 12345) & 0x7fffffff;
    const index = currentSeed % totalTips;
    
    if (!usedIndices.has(index)) {
      usedIndices.add(index);
      selectedTips.push(allTips[index]);
    }
  }
  
  return selectedTips;
}

/**
 * Gets the date string for display purposes
 */
export function getCurrentDateString(): string {
  const today = new Date();
  return today.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });
}
