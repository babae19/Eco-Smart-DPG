
import { WeatherPrediction, FloodingData, LocationWeatherAlert } from './types';
import { getCurrentTime, generateAIConfidence, isNearFreetown } from './utils';
import { calculateUserRisk } from './riskAssessmentService';

// Generate mock current weather data
export const generateMockCurrentWeather = () => {
  return {
    temperature: Math.round(28 + Math.random() * 4),
    conditions: "Partly cloudy with possibility of rain",
    rainProbability: 65 + Math.round(Math.random() * 20),
    humidity: 80 + Math.round(Math.random() * 10),
    windSpeed: 5 + Math.round(Math.random() * 15),
    lastUpdated: getCurrentTime()
  };
};

// Generate mock Freetown-specific weather data
export const generateMockFreetownWeatherData = (
  latitude: number, 
  longitude: number, 
  currentWeather: any
): LocationWeatherAlert => {
  return {
    currentWeather,
    predictions: [
      {
        date: "Today",
        prediction: "Heavy rainfall expected in coastal areas",
        severity: "high",
        probability: 85,
        aiConfidence: generateAIConfidence()
      },
      {
        date: "Tomorrow",
        prediction: "Continued heavy rain with increased risk of flooding",
        severity: "high",
        probability: 90,
        aiConfidence: generateAIConfidence()
      },
      {
        date: "Day after tomorrow",
        prediction: "Rain expected to decrease, moderate flood risk remains",
        severity: "medium",
        probability: 70,
        aiConfidence: generateAIConfidence()
      }
    ],
    floodingData: {
      historicalEvents: [
        {
          date: "August 14, 2017",
          description: "Major mudslide and flooding in Regent area",
          severity: "Catastrophic"
        },
        {
          date: "September 2015",
          description: "Widespread urban flooding across Freetown",
          severity: "Severe"
        },
        {
          date: "July 2019",
          description: "Flash floods in coastal communities",
          severity: "Moderate"
        }
      ],
      riskZones: [
        "Low-lying coastal areas",
        "Kroo Bay",
        "Susan's Bay",
        "Colbot community",
        "Areas near Lumley Beach"
      ],
      safetyTips: [
        "Move to higher ground immediately if flooding occurs",
        "Prepare emergency kits with essential supplies",
        "Monitor local news and weather alerts",
        "Avoid crossing flooded areas on foot or by vehicle",
        "Reinforce homes in risk zones with sandbags when heavy rain is predicted"
      ]
    },
    userSpecificRisk: calculateUserRisk(latitude, longitude, currentWeather),
    dataSource: "AI-Enhanced Weather Prediction System v2.1"
  };
};

// Generate mock generic weather data for non-Freetown locations
export const generateMockGenericWeatherData = (
  latitude: number, 
  longitude: number, 
  currentWeather: any
): LocationWeatherAlert => {
  return {
    currentWeather,
    predictions: [
      {
        date: "Today",
        prediction: "Weather conditions normal for your location",
        severity: "low",
        probability: 10,
        aiConfidence: generateAIConfidence()
      }
    ],
    floodingData: {
      historicalEvents: [],
      riskZones: [],
      safetyTips: [
        "Monitor local weather forecasts regularly",
        "Have an emergency plan for your household"
      ]
    },
    userSpecificRisk: {
      riskLevel: "low",
      riskFactors: ["No significant risk factors detected for your current location"],
      safetyRecommendations: ["Continue to monitor weather updates"]
    },
    dataSource: "AI-Enhanced Weather Prediction System v2.1"
  };
};
