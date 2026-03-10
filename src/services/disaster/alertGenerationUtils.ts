
import { Alert, AIAlertPrediction } from "@/types/AlertTypes";

// Convert AI predictions to user-facing alerts
export const generateAlertsFromPredictions = (
  predictions: AIAlertPrediction[],
  userLocation: string,
  coordinates: {latitude: number, longitude: number}
): Alert[] => {
  return predictions.map((prediction, index) => {
    const now = new Date();
    
    return {
      id: `ai-pred-${now.getTime()}-${index}`,
      title: `${prediction.alertLevel.toUpperCase()} RISK: ${prediction.predictedDisasterType.toUpperCase()}`,
      description: `${prediction.triggeringFactors.join(". ")}. ${prediction.recommendedActions.join(". ")}`,
      location: userLocation,
      severity: prediction.alertLevel,
      date: now.toLocaleDateString(),
      isNew: true,
      type: prediction.predictedDisasterType,
      aiPredictionScore: prediction.riskScore,
      predictedImpact: `Potential impact: ${prediction.timeframe}`,
      historicalPattern: prediction.triggeringFactors.find(f => f.includes("history")) || "Based on historical patterns",
      weatherFactor: prediction.triggeringFactors.find(f => f.includes("rainfall") || f.includes("temperature") || f.includes("humidity")) || "Weather is a contributing factor",
      coordinates
    };
  });
};
