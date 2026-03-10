
import { Alert } from "@/types/AlertTypes";
import { findNearbyRiskAreas } from "./locationUtils";

// Function to generate safety recommendations based on alert type and user's location
export const generateSafetyRecommendations = (
  alert: Alert,
  userLocation?: { latitude: number; longitude: number }
): string[] => {
  const recommendations: string[] = [];
  
  // Basic recommendations based on alert type
  switch (alert.type?.toLowerCase()) {
    case 'flooding':
      recommendations.push(
        "Move to higher ground immediately",
        "Avoid crossing flooded areas on foot or in vehicles",
        "Follow evacuation orders from authorities",
        "Keep emergency supplies and important documents in waterproof containers"
      );
      break;
    case 'landslide':
      recommendations.push(
        "Evacuate hillside areas immediately",
        "Listen for unusual sounds like trees cracking or boulders knocking",
        "Watch for changes in landscape, water drainage, or new cracks in the ground",
        "Contact local emergency officials if you suspect imminent landslide risk"
      );
      break;
    case 'fire outbreak':
      recommendations.push(
        "Evacuate immediately if authorities advise",
        "Prepare an emergency kit with important documents",
        "Create a family communication plan",
        "Close all windows and doors when evacuating",
        "Stay informed through local media for evacuation routes"
      );
      break;
    case 'disease outbreak':
      recommendations.push(
        "Practice good hygiene and frequent handwashing",
        "Use mosquito repellent and bed nets",
        "Ensure water is boiled or treated before consumption",
        "Avoid contact with those showing symptoms",
        "Seek medical attention if symptoms develop"
      );
      break;
    default:
      recommendations.push(
        "Stay informed about changing conditions",
        "Prepare emergency supplies and evacuation plan",
        "Register for local emergency alerts",
        "Identify safe areas in your location",
        "Follow directions from emergency authorities"
      );
  }
  
  // Add location-specific recommendations if location is available
  if (userLocation?.latitude && userLocation?.longitude) {
    const nearbyAreas = findNearbyRiskAreas(userLocation.latitude, userLocation.longitude);
    if (nearbyAreas.length > 0) {
      const nearestArea = nearbyAreas[0];
      
      if (nearestArea.name === "Kroo Bay" || nearestArea.name === "Susan's Bay") {
        recommendations.push(
          `${nearestArea.name} is highly vulnerable to flooding - consider relocating to higher ground during heavy rains`,
          "This area has limited evacuation routes - identify escape paths before emergency occurs"
        );
      } else if (nearestArea.name === "Regent" || nearestArea.name === "Hill Station") {
        recommendations.push(
          `${nearestArea.name} is at risk for landslides - be alert for warning signs like tilting trees or soil movement`,
          "The hillside terrain requires special preparation - secure loose items that could slide"
        );
      }
      
      // Add historical context
      const relevantEvents = nearestArea.historicalEvents.filter(
        event => event.type.toLowerCase() === alert.type?.toLowerCase()
      );
      
      if (relevantEvents.length > 0) {
        const mostRecentEvent = relevantEvents.sort((a, b) => b.year - a.year)[0];
        recommendations.push(
          `${nearestArea.name} experienced a similar ${mostRecentEvent.type} in ${mostRecentEvent.year} - learn from past experiences`
        );
      }
    }
  }
  
  return recommendations;
};

// Function to broadcast an alert to appropriate channels - modified to not show toasts
export const broadcastAlert = (alert: Alert) => {
  // Toast notifications removed as per user request
  // Just log to console for debugging
  console.log('Alert would have been broadcast:', alert);
  
  return true;
};

// Function to log alerts for analytics
export const logAlertToAnalytics = (alert: Alert) => {
  try {
    console.log('Alert logged for analytics:', alert);
    // In a real implementation, this would send the alert to an analytics service
    return true;
  } catch (error) {
    console.error('Failed to log alert to analytics:', error);
    return false;
  }
};

// Function to analyze and adjust alert severity based on AI analysis
export const analyzeAlertSeverity = (alert: Alert): Alert => {
  // Make a copy of the alert to avoid mutating the original
  const analyzedAlert = { ...alert };
  
  // Check if we need to upgrade severity based on specific conditions
  if (alert.weatherData) {
    // If precipitation is extremely high, increase severity
    if (alert.weatherData.precipitation > 40 && alert.severity !== 'high') {
      analyzedAlert.severity = 'high';
      analyzedAlert.description = `[UPGRADED ALERT] ${analyzedAlert.description}`;
    }
    
    // If temperature is extremely high, possibly increase severity
    if (alert.weatherData.temperature > 37 && alert.type === 'disease outbreak' && alert.severity === 'low') {
      analyzedAlert.severity = 'medium';
      analyzedAlert.description = `[ELEVATED RISK] ${analyzedAlert.description}`;
    }
  }
  
  return analyzedAlert;
};
