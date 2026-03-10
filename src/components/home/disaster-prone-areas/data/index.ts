
import { DisasterProneArea } from '@/types/DisasterProneAreaTypes';
import { extendedDisasterProneAreas } from './extendedAreas';

// Core disaster-prone areas in Freetown
export const disasterProneAreas: DisasterProneArea[] = [
  {
    id: 1,
    name: "Kroo Bay",
    risks: ["Flooding", "Sea Level Rise", "Storm Surge", "Tidal Inundation"],
    weatherRisks: ["Heavy Rainfall", "High Tides", "Coastal Storms"],
    coordinates: {
      latitude: 8.4657,
      longitude: -13.2317
    },
    description: "Low-lying coastal slum area built on reclaimed swampland, highly vulnerable to flooding and sea level rise. Home to over 6,000 residents with extremely limited infrastructure and drainage systems.",
    vulnerabilityLevel: "critical",
    safetyTips: [
      "Monitor weather alerts and tide schedules daily during rainy season (May-October)",
      "Store emergency supplies (water, food, medicines) in waterproof containers on highest available ground",
      "Identify and practice evacuation routes to Fourah Bay College or Hill Station areas",
      "Keep important documents in waterproof bags",
      "Form neighborhood watch groups for early flood warning",
      "Never attempt to cross flooded areas - water can be deeper than it appears",
      "Have emergency contacts and meeting points established with family",
      "Install drainage around homes where possible and keep gutters clear"
    ],
    historicalEvents: [
      { type: "Major Flooding", year: 2019, severity: "high", description: "Severe flooding displaced hundreds of families" },
      { type: "Storm Surge", year: 2021, severity: "medium", description: "Tidal surge damaged homes and infrastructure" },
      { type: "Flash Flood", year: 2022, severity: "high", description: "Rapid flooding trapped residents in homes" }
    ]
  },
  {
    id: 2,
    name: "Susan's Bay",
    risks: ["Urban Flooding", "Fire Hazards", "Overcrowding", "Structural Collapse"],
    weatherRisks: ["Flash Floods", "Strong Winds", "Lightning Strikes"],
    coordinates: {
      latitude: 8.4701,
      longitude: -13.2342
    },
    description: "Dense informal settlement with over 40,000 residents in extremely cramped conditions. Narrow pathways and wooden structures create high fire risk, while poor drainage leads to frequent flooding.",
    vulnerabilityLevel: "critical",
    safetyTips: [
      "Clear and maintain drainage channels around homes weekly",
      "Install and regularly check fire safety equipment (extinguishers, smoke detectors)",
      "Know at least three different evacuation routes from your area",
      "Keep emergency fire and flood kits readily accessible",
      "Avoid using open flames during windy weather",
      "Report electrical hazards and damaged wiring immediately",
      "Participate in community fire drills and flood preparedness meetings",
      "Store cooking fuel safely away from living areas",
      "Create firebreaks by removing flammable materials between structures",
      "Establish community emergency response teams"
    ],
    historicalEvents: [
      { type: "Major Fire", year: 2021, severity: "high", description: "Fire destroyed over 500 homes, leaving thousands homeless" },
      { type: "Flash Flood", year: 2020, severity: "medium", description: "Flooding affected thousands of residents" },
      { type: "Wind Damage", year: 2022, severity: "medium", description: "Strong winds damaged roofs and structures" }
    ]
  },
  {
    id: 3,
    name: "Kissy",
    risks: ["Flash Floods", "Drainage Issues", "Infrastructure Damage", "Traffic Disruption"],
    weatherRisks: ["Heavy Rainfall", "Poor Drainage", "Waterlogging"],
    coordinates: {
      latitude: 8.4590,
      longitude: -13.2156
    },
    description: "Eastern district with over 80,000 residents facing inadequate drainage systems. Commercial and residential areas frequently flood during heavy rains, disrupting transport and commerce.",
    vulnerabilityLevel: "high",
    safetyTips: [
      "Avoid low-lying areas like Kissy Brook during and after heavy rainfall",
      "Keep sandbags and waterproof barriers ready during rainy season",
      "Report blocked drains and culverts to City Council immediately",
      "Use alternative routes when main roads flood (via Kissy Road or Wellington Road)",
      "Elevate electrical appliances and valuables above potential flood levels",
      "Install drainage systems around your property where possible",
      "Join community clean-up efforts to maintain drainage infrastructure",
      "Monitor local radio for flood warnings and road closures",
      "Keep emergency transportation contacts for evacuation if needed"
    ],
    historicalEvents: [
      { type: "Flash Flood", year: 2021, severity: "high", description: "Major flooding disrupted transport and damaged businesses" },
      { type: "Infrastructure Damage", year: 2020, severity: "medium", description: "Heavy rains damaged roads and drainage systems" }
    ]
  },
  {
    id: 4,
    name: "Mount Aureol",
    risks: ["Landslides", "Soil Erosion", "Infrastructure Instability", "Tree Falls"],
    weatherRisks: ["Heavy Rainfall", "Soil Saturation", "Wind Damage"],
    coordinates: {
      latitude: 8.4167,
      longitude: -13.1833
    },
    description: "Hillside university area with steep slopes and dense vegetation. Home to Fourah Bay College and residential areas vulnerable to landslides, especially during prolonged rainfall periods.",
    vulnerabilityLevel: "high",
    safetyTips: [
      "Monitor slope stability daily after heavy rains - look for cracks, tilting trees, or small rock falls",
      "Avoid steep footpaths and hillside areas during storms",
      "Report cracks in roads, buildings, or retaining walls to authorities immediately",
      "Have evacuation plan to lower, stable ground areas",
      "Secure outdoor furniture and equipment that could become projectiles",
      "Trim trees near buildings to prevent wind damage",
      "Install proper drainage around hillside properties",
      "Never build on steep slopes without proper engineering assessment",
      "Keep emergency supplies ready for potential isolation during landslides"
    ],
    historicalEvents: [
      { type: "Landslide", year: 2018, severity: "medium", description: "Small landslide blocked access roads to university" },
      { type: "Soil Erosion", year: 2020, severity: "medium", description: "Heavy rains caused significant erosion damage" }
    ]
  },
  {
    id: 5,
    name: "Regent",
    risks: ["Landslides", "Mudslides", "Deforestation Impact", "Rock Falls"],
    weatherRisks: ["Heavy Rainfall", "Soil Instability", "Extreme Weather"],
    coordinates: {
      latitude: 8.3833,
      longitude: -13.1667
    },
    description: "Mountainous area tragically affected by the devastating 2017 landslide that killed over 1,000 people. Ongoing deforestation and unstable geology continue to pose extreme risks.",
    vulnerabilityLevel: "critical",
    safetyTips: [
      "EVACUATE IMMEDIATELY if any ground cracks appear or if water becomes muddy",
      "Never ignore warning signs: unusual animal behavior, ground rumbling, or tilting structures",
      "Avoid all steep slopes during heavy rain - even brief walks can be fatal",
      "Have emergency communication plan with family outside the area",
      "Keep emergency bag ready with essentials for immediate evacuation",
      "Know multiple evacuation routes to Grafton or Waterloo areas",
      "Report any illegal logging or construction activities",
      "Participate in community early warning systems",
      "Install rain gauges and monitor precipitation levels",
      "Consider relocating during peak rainy season if possible"
    ],
    historicalEvents: [
      { type: "Catastrophic Landslide", year: 2017, severity: "high", description: "Devastating landslide killed over 1,000 people and destroyed hundreds of homes" },
      { type: "Mudslide", year: 2019, severity: "medium", description: "Smaller mudslide damaged remaining infrastructure" }
    ]
  },
  {
    id: 6,
    name: "Aberdeen",
    risks: ["Coastal Erosion", "Beach Flooding", "Infrastructure Damage", "Storm Surge"],
    weatherRisks: ["Storm Surge", "High Winds", "Coastal Storms"],
    coordinates: {
      latitude: 8.4089,
      longitude: -13.2689
    },
    description: "Popular beach area and residential district experiencing accelerating coastal erosion. Rising sea levels and strong Atlantic storms threaten beachfront properties, hotels, and recreational facilities.",
    vulnerabilityLevel: "high",
    safetyTips: [
      "Monitor weather warnings for Atlantic storms and high tide alerts",
      "Secure or move beachfront property and vehicles before storm season",
      "Stay at least 50 meters away from eroded cliff areas and unstable structures",
      "Install flood barriers around beachfront properties during storm warnings",
      "Have evacuation plan to higher ground in Murray Town or Hill Station",
      "Keep emergency supplies for potential storm isolation",
      "Avoid swimming or beach activities during red flag weather warnings",
      "Report coastal erosion and infrastructure damage to authorities",
      "Consider flood insurance for beachfront properties"
    ],
    historicalEvents: [
      { type: "Coastal Erosion", year: 2020, severity: "medium", description: "Significant erosion threatened beachfront properties" },
      { type: "Storm Surge", year: 2021, severity: "medium", description: "High waves damaged coastal infrastructure" }
    ]
  }
];

// Combined list of all disaster-prone areas
export const allDisasterProneAreas: DisasterProneArea[] = [
  ...disasterProneAreas,
  ...extendedDisasterProneAreas
];
