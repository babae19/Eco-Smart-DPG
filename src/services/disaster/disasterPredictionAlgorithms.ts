
import { AIAlertPrediction, WeatherData } from "@/types/AlertTypes";
import { findNearbyRiskAreas } from "./locationUtils";

// Enhanced AI algorithm to predict disaster risk based on location, weather and historical data
export const predictDisasterRisk = (
  userLatitude: number,
  userLongitude: number,
  weatherData: WeatherData
): AIAlertPrediction[] => {
  const predictions: AIAlertPrediction[] = [];
  const nearbyAreas = findNearbyRiskAreas(userLatitude, userLongitude);
  
  // No nearby risk areas found
  if (nearbyAreas.length === 0) {
    return [{
      riskScore: 10,
      confidenceLevel: 0.9,
      predictedDisasterType: "none",
      timeframe: "next 24 hours",
      recommendedActions: ["No immediate risks identified."],
      alertLevel: "low",
      triggeringFactors: ["Location not in a known high-risk area"]
    }];
  }
  
  // Get current month for seasonal factors
  const currentMonth = new Date().getMonth();
  const isRainySeason = currentMonth >= 4 && currentMonth <= 9; // May to October
  
  // Check each nearby area for potential risks with improved accuracy
  nearbyAreas.forEach(area => {
    // Calculate base risk modifiers based on area's historical events
    const historicalRiskFactor = area.historicalEvents.length * 0.05; // More events = higher risk
    const recentEventFactor = area.historicalEvents.some(e => e.year >= new Date().getFullYear() - 3) ? 0.1 : 0;
    
    // Analyze for flood risk - enhanced with seasonal factors
    if (area.risks.includes("flooding")) {
      // Base risk variables
      let riskScore = 0;
      let triggeringFactors = [];
      
      // Rainfall factor - more significant in rainy season
      if (weatherData.precipitation > 0) {
        const rainfallFactor = isRainySeason ? 
          40 + (weatherData.precipitation * 1.5) : // Higher base risk in rainy season
          20 + (weatherData.precipitation * 1.2);  // Lower base risk in dry season
        
        riskScore += Math.min(rainfallFactor, 60); // Cap at 60 points from rainfall alone
        
        if (weatherData.precipitation > 15) {
          triggeringFactors.push(`Heavy rainfall (${weatherData.precipitation.toFixed(1)}mm)`);
        } else {
          triggeringFactors.push(`Rainfall (${weatherData.precipitation.toFixed(1)}mm)`);
        }
      }
      
      // Humidity factor
      if (weatherData.humidity > 75) {
        riskScore += (weatherData.humidity - 75) * 0.5;
        triggeringFactors.push(`High humidity (${weatherData.humidity.toFixed(1)}%)`);
      }
      
      // Add historical and area factors
      riskScore += 15 * historicalRiskFactor;
      riskScore += recentEventFactor * 20;
      triggeringFactors.push(`Area with flood history (${area.name})`);
      
      // Only add if risk is significant
      if (riskScore > 40) {
        predictions.push({
          riskScore: Math.min(riskScore, 100),
          confidenceLevel: 0.65 + (weatherData.precipitation / 150) + historicalRiskFactor,
          predictedDisasterType: "flooding",
          timeframe: riskScore > 70 ? "next 6-12 hours" : "next 12-24 hours",
          recommendedActions: [
            "Move to higher ground",
            "Avoid flood-prone areas",
            "Prepare emergency supplies",
            "Monitor local alerts"
          ],
          alertLevel: riskScore > 75 ? "high" : riskScore > 50 ? "medium" : "low",
          triggeringFactors
        });
      }
    }
    
    // Analyze for landslide risk - enhanced with terrain + rainfall combination factors
    if (area.risks.includes("landslide")) {
      let riskScore = 0;
      let triggeringFactors = [];
      
      // Rainfall is a major factor for landslides
      if (weatherData.precipitation > 0) {
        // More severe risk assessment with accumulation factor
        const rainfallFactor = isRainySeason ? 
          (weatherData.precipitation * 2.5) : // Higher impact in rainy season  
          (weatherData.precipitation * 1.5);  // Lower impact in dry season
          
        riskScore += Math.min(rainfallFactor, 70); // Higher cap for landslides
        
        if (weatherData.precipitation > 20) {
          triggeringFactors.push(`Heavy sustained rainfall (${weatherData.precipitation.toFixed(1)}mm)`);
        } else if (weatherData.precipitation > 10) {
          triggeringFactors.push(`Moderate rainfall (${weatherData.precipitation.toFixed(1)}mm)`);
        }
      }
      
      // Soil saturation from humidity is relevant
      if (weatherData.humidity > 80) {
        riskScore += (weatherData.humidity - 80) * 0.8;
        triggeringFactors.push(`Soil saturation from high humidity (${weatherData.humidity.toFixed(1)}%)`);
      }
      
      // Add historical and area factors
      riskScore += 20 * historicalRiskFactor;
      riskScore += recentEventFactor * 25; // Recent events more impactful for landslides
      triggeringFactors.push(`Hillside location (${area.name})`);
      
      if (riskScore > 45) {
        predictions.push({
          riskScore: Math.min(riskScore, 100),
          confidenceLevel: 0.6 + (weatherData.precipitation / 150) + historicalRiskFactor,
          predictedDisasterType: "landslide",
          timeframe: riskScore > 75 ? "immediate concern" : "next 24-48 hours",
          recommendedActions: [
            "Evacuate hillside areas immediately",
            "Move to solid ground",
            "Watch for signs of ground movement",
            "Contact emergency services if you notice soil movement"
          ],
          alertLevel: riskScore > 80 ? "high" : riskScore > 55 ? "medium" : "low",
          triggeringFactors
        });
      }
    }
    
    // Analyze for disease outbreak risk - enhanced with seasonal and temperature factors
    if (area.risks.includes("disease outbreak")) {
      let riskScore = 0;
      let triggeringFactors = [];
      
      // Temperature factor
      if (weatherData.temperature > 28) {
        riskScore += (weatherData.temperature - 28) * 5;
        triggeringFactors.push(`High temperature (${weatherData.temperature.toFixed(1)}°C)`);
      }
      
      // Humidity factor - critical for mosquito breeding
      if (weatherData.humidity > 70) {
        riskScore += (weatherData.humidity - 70) * 0.8;
        triggeringFactors.push(`High humidity (${weatherData.humidity.toFixed(1)}%)`);
      }
      
      // Standing water from rainfall
      if (weatherData.precipitation > 5) {
        riskScore += weatherData.precipitation * 1.2;
        triggeringFactors.push(`Standing water from recent rains (${weatherData.precipitation.toFixed(1)}mm)`);
      }
      
      // Seasonal factor - higher risk in warm, wet months
      if (isRainySeason) {
        riskScore += 15;
        triggeringFactors.push(`Rainy season increases vector breeding`);
      }
      
      // Add historical and area factors
      riskScore += 15 * historicalRiskFactor;
      riskScore += recentEventFactor * 15;
      triggeringFactors.push(`Area with history of outbreaks (${area.name})`);
      
      if (riskScore > 40) {
        predictions.push({
          riskScore: Math.min(riskScore, 100),
          confidenceLevel: 0.5 + (historicalRiskFactor * 0.3),
          predictedDisasterType: "disease outbreak",
          timeframe: "coming weeks",
          recommendedActions: [
            "Practice good hygiene",
            "Use mosquito repellent",
            "Eliminate standing water sources",
            "Drink clean, treated water",
            "Sleep under mosquito nets"
          ],
          alertLevel: riskScore > 75 ? "high" : riskScore > 50 ? "medium" : "low",
          triggeringFactors
        });
      }
    }
    
    // Analyze for fire outbreak risk - enhanced with temperature and humidity factors
    if (area.risks.includes("fire outbreak")) {
      let riskScore = 0;
      let triggeringFactors = [];
      
      // Temperature is a major factor for fires
      if (weatherData.temperature > 30) {
        riskScore += (weatherData.temperature - 30) * 6;
        triggeringFactors.push(`High temperature (${weatherData.temperature.toFixed(1)}°C)`);
      }
      
      // Low humidity increases fire risk
      if (weatherData.humidity < 70) {
        riskScore += (70 - weatherData.humidity) * 1.2;
        triggeringFactors.push(`Low humidity (${weatherData.humidity.toFixed(1)}%)`);
      }
      
      // Wind increases fire spread
      if (weatherData.windSpeed > 10) {
        riskScore += (weatherData.windSpeed - 10) * 2;
        triggeringFactors.push(`High winds (${weatherData.windSpeed.toFixed(1)} km/h)`);
      }
      
      // Seasonal factor - higher risk in dry season
      if (!isRainySeason) {
        riskScore += 20;
        triggeringFactors.push(`Dry season increases fire risk`);
      }
      
      // Add historical and area factors
      riskScore += 15 * historicalRiskFactor;
      riskScore += recentEventFactor * 15;
      triggeringFactors.push(`Urban density in ${area.name}`);
      
      if (riskScore > 40) {
        predictions.push({
          riskScore: Math.min(riskScore, 100),
          confidenceLevel: 0.6 + (historicalRiskFactor * 0.2),
          predictedDisasterType: "fire outbreak",
          timeframe: "immediate",
          recommendedActions: [
            "Be cautious with open flames",
            "Report any smoke or fire immediately",
            "Keep emergency contacts ready",
            "Identify evacuation routes",
            "Keep flammable materials away from heat sources"
          ],
          alertLevel: riskScore > 75 ? "high" : riskScore > 55 ? "medium" : "low",
          triggeringFactors
        });
      }
    }
  });
  
  // If no specific risks were identified but we're in high-risk areas, add a general alert
  if (predictions.length === 0 && nearbyAreas.length > 0) {
    const primaryRisk = nearbyAreas[0].risks[0];
    
    predictions.push({
      riskScore: 30,
      confidenceLevel: 0.6,
      predictedDisasterType: primaryRisk,
      timeframe: "next few days",
      recommendedActions: [
        "Stay alert to changing conditions",
        "Monitor local alerts",
        "Be prepared for potential evacuation"
      ],
      alertLevel: "low",
      triggeringFactors: [
        `Location in ${nearbyAreas[0].name}`,
        `History of ${nearbyAreas[0].risks.join(", ")}`,
        "Current conditions below warning threshold"
      ]
    });
  }
  
  // Sort predictions by risk score (highest first)
  return predictions.sort((a, b) => b.riskScore - a.riskScore);
};
