
import { LocationWeatherAlert } from './types';

// Calculate user-specific risk based on location and current conditions
export const calculateUserRisk = (
  latitude: number, 
  longitude: number, 
  currentWeather: any
): LocationWeatherAlert['userSpecificRisk'] => {
  // Check if user is in high risk flood zone
  const isInFloodZone = 
    // Kroo Bay coordinates (approximate)
    (latitude > 8.47 && latitude < 8.49 && longitude > -13.24 && longitude < -13.22) ||
    // Susan's Bay coordinates (approximate)
    (latitude > 8.48 && latitude < 8.50 && longitude > -13.22 && longitude < -13.20);
  
  // Check if rain probability is high
  const highRainProbability = currentWeather.rainProbability > 60;
  
  // Determine risk level
  let riskLevel: 'critical' | 'high' | 'moderate' | 'low' = 'low';
  const riskFactors: string[] = [];
  
  if (isInFloodZone && highRainProbability) {
    riskLevel = 'critical';
    riskFactors.push('You are currently in a high-risk flood zone with high precipitation forecast');
    riskFactors.push('Historical data shows frequent flooding in your current location');
  } else if (isInFloodZone) {
    riskLevel = 'high';
    riskFactors.push('You are currently in a high-risk flood zone');
    riskFactors.push('This area has experienced flooding in the past during similar weather conditions');
  } else if (highRainProbability) {
    riskLevel = 'moderate';
    riskFactors.push('Heavy rainfall is expected in your area');
    riskFactors.push('Low-lying areas near you may experience flooding');
  }
  
  // Personalized safety recommendations
  const safetyRecommendations = [];
  if (riskLevel === 'critical' || riskLevel === 'high') {
    safetyRecommendations.push('Consider moving to higher ground immediately');
    safetyRecommendations.push('Be prepared to evacuate on short notice');
    safetyRecommendations.push('Avoid flooded areas and moving water');
  } else if (riskLevel === 'moderate') {
    safetyRecommendations.push('Stay informed about changing weather conditions');
    safetyRecommendations.push('Prepare emergency supplies in case conditions worsen');
  } else {
    safetyRecommendations.push('No immediate action required, but stay alert to weather changes');
  }
  
  return {
    riskLevel,
    riskFactors,
    safetyRecommendations
  };
};
