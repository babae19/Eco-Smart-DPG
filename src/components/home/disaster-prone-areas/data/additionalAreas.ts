import { DisasterProneArea } from '@/types/DisasterProneAreaTypes';

export const additionalDisasterProneAreas: DisasterProneArea[] = [
  {
    id: 16,
    name: "Sackville Street",
    risks: ["Urban Flooding", "Structural Damage"],
    weatherRisks: ["Heavy Rainfall", "Flash Floods"],
    coordinates: {
      latitude: 8.483,
      longitude: -13.233
    },
    description: "Dense urban area with history of flash flooding during heavy rainfall, affecting residential buildings and local businesses.",
    vulnerabilityLevel: "medium",
    safetyTips: [
      "Monitor weather forecasts during rainy season",
      "Keep important documents in waterproof containers",
      "Know your evacuation route"
    ]
  },
  {
    id: 17,
    name: "Congo Cross",
    risks: ["Traffic Congestion", "Urban Flooding", "Air Pollution"],
    weatherRisks: ["Heavy Rainfall", "Poor Drainage"],
    coordinates: {
      latitude: 8.492,
      longitude: -13.238
    },
    description: "Major traffic junction prone to flooding and congestion. High pollution levels affect air quality during dry season.",
    vulnerabilityLevel: "medium",
    safetyTips: [
      "Avoid area during heavy rainfall",
      "Use alternative routes during flooding",
      "Wear masks during high pollution periods"
    ]
  },
  {
    id: 18,
    name: "Mount Aureol",
    risks: ["Landslides", "Rock Falls"],
    weatherRisks: ["Heavy Rainfall", "Strong Winds"],
    coordinates: {
      latitude: 8.477,
      longitude: -13.219
    },
    description: "Elevated area with steep slopes and history of landslides. University buildings and residential areas at risk during severe weather.",
    vulnerabilityLevel: "high",
    safetyTips: [
      "Monitor hillside stability",
      "Report any ground cracks immediately",
      "Follow evacuation orders promptly"
    ]
  },
  {
    id: 19,
    name: "Lumley Beach",
    risks: ["Coastal Erosion", "Storm Surge", "Flooding"],
    weatherRisks: ["High Tides", "Storm Surge", "Sea Level Rise"],
    coordinates: {
      latitude: 8.437,
      longitude: -13.287
    },
    description: "Popular beach area vulnerable to coastal erosion and storm surge. Tourist facilities and coastal communities at risk.",
    vulnerabilityLevel: "medium",
    safetyTips: [
      "Monitor tide warnings",
      "Stay away from beach during storms",
      "Have evacuation plan ready"
    ]
  },
  {
    id: 20,
    name: "Charlotte",
    risks: ["Flash Floods", "Mudslides"],
    weatherRisks: ["Heavy Rainfall", "Poor Drainage"],
    coordinates: {
      latitude: 8.469,
      longitude: -13.209
    },
    description: "Low-lying area prone to flash floods during rainy season. Poor drainage infrastructure contributes to flooding risk.",
    vulnerabilityLevel: "medium",
    safetyTips: [
      "Keep emergency supplies ready",
      "Clear drainage systems regularly",
      "Have an evacuation plan"
    ]
  },
  {
    id: 21,
    name: "Waterloo",
    risks: ["Flash Floods", "Landslides", "Deforestation"],
    weatherRisks: ["Heavy Rainfall", "Soil Erosion"],
    coordinates: {
      latitude: 8.378,
      longitude: -13.078
    },
    description: "Rapidly growing urban area facing challenges from deforestation and poor drainage. Frequent flash floods during rainy season impact residential areas.",
    vulnerabilityLevel: "high",
    safetyTips: [
      "Have emergency supplies ready",
      "Know your evacuation routes",
      "Monitor weather forecasts regularly"
    ]
  },
  {
    id: 22,
    name: "Dunda Street",
    risks: ["Urban Flooding", "Fire Outbreaks"],
    weatherRisks: ["Heavy Rainfall", "Strong Winds"],
    coordinates: {
      latitude: 8.484,
      longitude: -13.234
    },
    description: "Dense urban area prone to flooding during heavy rains. Close proximity of buildings increases fire risk during dry season.",
    vulnerabilityLevel: "medium",
    safetyTips: [
      "Keep drainage channels clear",
      "Install smoke detectors",
      "Store important documents safely"
    ]
  },
  {
    id: 23,
    name: "Akram",
    risks: ["Landslides", "Erosion", "Flash Floods"],
    weatherRisks: ["Heavy Rainfall", "Soil Saturation"],
    coordinates: {
      latitude: 8.475,
      longitude: -13.215
    },
    description: "Hillside community vulnerable to landslides and erosion. Highly prone to flash floods during heavy rainfall, with poor drainage systems contributing to rapid water accumulation and potential flooding risks.",
    vulnerabilityLevel: "high",
    safetyTips: [
      "Watch for signs of land movement",
      "Maintain proper drainage",
      "Be prepared for quick evacuation"
    ]
  },
  {
    id: 24,
    name: "Tengbeh Town",
    risks: ["Landslides", "Rock Falls", "Urban Density"],
    weatherRisks: ["Heavy Rainfall", "Soil Instability"],
    coordinates: {
      latitude: 8.479,
      longitude: -13.252
    },
    description: "Hillside settlement with history of landslides and rock falls. High population density increases vulnerability during disasters.",
    vulnerabilityLevel: "high",
    safetyTips: [
      "Monitor hillside stability",
      "Keep emergency contacts ready",
      "Follow evacuation orders promptly"
    ]
  },
  {
    id: 25,
    name: "Susan's Bay",
    risks: ["Coastal Flooding", "Fire Outbreaks", "Disease Outbreaks"],
    weatherRisks: ["Storm Surges", "High Tides"],
    coordinates: {
      latitude: 8.491,
      longitude: -13.227
    },
    description: "Coastal informal settlement highly vulnerable to flooding and fire outbreaks. Dense population and poor sanitation increase disease risks.",
    vulnerabilityLevel: "high",
    safetyTips: [
      "Keep emergency supplies ready",
      "Monitor tide warnings",
      "Practice good sanitation"
    ]
  },
  {
    id: 26,
    name: "Calaba Town",
    risks: ["Flash Floods", "Urban Overcrowding", "Poor Sanitation"],
    weatherRisks: ["Heavy Rainfall", "Storm Water"],
    coordinates: {
      latitude: 8.486,
      longitude: -13.241
    },
    description: "Dense residential area with inadequate drainage and sanitation systems. Prone to flooding and health risks during rainy season.",
    vulnerabilityLevel: "medium",
    safetyTips: [
      "Maintain clean surroundings",
      "Report blocked drains",
      "Store clean water during floods"
    ]
  },
  {
    id: 27,
    name: "Hastings",
    risks: ["Coastal Erosion", "Flooding", "Airport Hazards"],
    weatherRisks: ["Storm Surge", "High Winds"],
    coordinates: {
      latitude: 8.398,
      longitude: -13.129
    },
    description: "Coastal area near the airport vulnerable to erosion and flooding. Flight operations may be affected during severe weather.",
    vulnerabilityLevel: "medium",
    safetyTips: [
      "Monitor coastal conditions",
      "Check flight status during storms",
      "Avoid coastal areas during high tides"
    ]
  },
  {
    id: 28,
    name: "Hill Station",
    risks: ["Landslides", "Infrastructure Damage", "Water Scarcity"],
    weatherRisks: ["Heavy Rainfall", "Drought"],
    coordinates: {
      latitude: 8.456,
      longitude: -13.201
    },
    description: "Elevated residential area with aging infrastructure. Vulnerable to landslides during wet season and water shortages during dry periods.",
    vulnerabilityLevel: "medium",
    safetyTips: [
      "Conserve water during dry season",
      "Monitor slope stability",
      "Report infrastructure damage"
    ]
  },
  {
    id: 29,
    name: "Kissy Mess Mess",
    risks: ["Industrial Pollution", "Fire Hazards", "Flooding"],
    weatherRisks: ["Chemical Runoff", "Heavy Rainfall"],
    coordinates: {
      latitude: 8.471,
      longitude: -13.203
    },
    description: "Industrial area with potential pollution risks. Chemical storage facilities pose fire and environmental hazards during extreme weather.",
    vulnerabilityLevel: "high",
    safetyTips: [
      "Avoid contact with flood water",
      "Report chemical spills immediately",
      "Have emergency evacuation plan"
    ]
  },
  {
    id: 30,
    name: "Aberdeen",
    risks: ["Coastal Flooding", "Tourism Infrastructure Damage"],
    weatherRisks: ["Storm Surge", "High Tides"],
    coordinates: {
      latitude: 8.431,
      longitude: -13.267
    },
    description: "Tourist area with hotels and restaurants vulnerable to coastal flooding. Infrastructure damage affects local economy.",
    vulnerabilityLevel: "medium",
    safetyTips: [
      "Monitor weather warnings",
      "Secure outdoor equipment",
      "Have alternative accommodation plans"
    ]
  }
];
