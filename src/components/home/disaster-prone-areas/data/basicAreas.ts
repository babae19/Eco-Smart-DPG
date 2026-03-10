
import { DisasterProneArea } from '@/types/DisasterProneAreaTypes';

export const basicDisasterProneAreas: DisasterProneArea[] = [
  {
    id: 1,
    name: "Kroo Bay",
    risks: ["Flooding", "Waste Management", "Sanitation Hazards"],
    weatherRisks: ["Heavy Rainfall", "Poor Drainage", "Environmental Pollution"],
    coordinates: {
      latitude: 8.4881,
      longitude: -13.2343
    },
    description: "A densely populated informal settlement characterized by severe environmental challenges, including open drainage systems, waste accumulation, and high flood risks. The area suffers from inadequate infrastructure, exposing residents to health and safety hazards during rainy seasons.",
    vulnerabilityLevel: "critical",
    safetyTips: [
      "Avoid walking through stagnant water",
      "Maintain personal hygiene and clean surroundings",
      "Store drinking water safely to prevent contamination",
      "Report waste management and drainage issues to local authorities"
    ],
    image: "/lovable-uploads/f83ed439-b806-4d1b-9500-78460e710a72.png"
  },
  {
    id: 2,
    name: "Regent",
    risks: ["Landslides", "Soil Erosion"],
    weatherRisks: ["Heavy Rainfall", "Steep Terrain"],
    coordinates: {
      latitude: 8.4208,
      longitude: -13.2070
    },
    description: "Mountainous area with history of deadly landslides, particularly vulnerable during rainy season due to steep terrain and deforestation.",
    vulnerabilityLevel: "critical",
    safetyTips: [
      "Relocate during extreme weather alerts",
      "Avoid hillside housing construction",
      "Report signs of land movement to authorities"
    ],
    image: "https://static.euronews.com/articles/stories/06/78/81/26/1200x675_cmsv2_5418e431-d234-507c-8dd3-ac2fe6b1f349-6788126.jpg"
  },
  {
    id: 3,
    name: "Lumley Beach",
    risks: ["Coastal Erosion", "Waste Pollution", "Environmental Degradation"],
    weatherRisks: ["High Tides", "Storm Surges", "Sea Level Rise"],
    coordinates: {
      latitude: 8.4298,
      longitude: -13.2772
    },
    description: "A coastal area experiencing significant environmental challenges, including severe beach erosion, waste accumulation, and visible infrastructure damage. The shoreline shows signs of degradation with scattered debris and rocky protective barriers.",
    vulnerabilityLevel: "high",
    safetyTips: [
      "Avoid walking near unstable beach areas",
      "Report environmental hazards to local authorities",
      "Participate in beach clean-up initiatives",
      "Maintain safe distance during high tide periods"
    ],
    image: "/lovable-uploads/14d83fd3-13ec-4247-8a17-517ed651250f.png"
  },
  {
    id: 4,
    name: "Kissy",
    risks: ["Industrial Hazards", "Fire Risks"],
    weatherRisks: ["Dry Season Fires"],
    coordinates: {
      latitude: 8.4788,
      longitude: -13.1895
    },
    description: "Industrial area with fuel storage facilities and frequent fire incidents, especially during the dry season.",
    vulnerabilityLevel: "medium",
    safetyTips: [
      "Keep fire extinguishers accessible",
      "Avoid outdoor cooking during dry seasons",
      "Maintain safe distance from industrial sites"
    ],
    image: "https://i0.wp.com/www.switsalone.com/wp-content/uploads/2012/07/Fire-2.jpg?fit=960%2C640&ssl=1"
  },
  {
    id: 5,
    name: "Congo Town",
    risks: ["Environmental Pollution", "Waste Management", "Coastal Degradation"],
    weatherRisks: ["Tidal Flooding", "Poor Drainage", "Water Contamination"],
    coordinates: {
      latitude: 8.4756,
      longitude: -13.2658
    },
    description: "A coastal settlement marked by severe environmental challenges, featuring dilapidated infrastructure, blocked waterways, and extensive waste accumulation. The landscape shows makeshift structures, stagnant water channels filled with debris, and exposed coastal vulnerabilities that heighten flood and health risks during rainy seasons.",
    vulnerabilityLevel: "high",
    safetyTips: [
      "Avoid walking through stagnant or polluted water channels",
      "Properly dispose of waste to prevent water blockage",
      "Maintain personal hygiene to prevent waterborne diseases",
      "Support community clean-up and drainage improvement initiatives",
      "Report infrastructure and waste management issues to local authorities"
    ],
    image: "/lovable-uploads/5a679a66-b6fa-4e88-a964-dc682dc58a8d.png"
  },
  {
    id: 6,
    name: "Grafton",
    risks: ["Deforestation", "Landslides"],
    weatherRisks: ["Soil Erosion", "Heavy Rainfall"],
    coordinates: {
      latitude: 8.4055,
      longitude: -13.1560
    },
    description: "Hillside area affected by deforestation leading to increased risk of landslides during rainy season.",
    vulnerabilityLevel: "medium",
    safetyTips: [
      "Plant trees to reduce erosion risk",
      "Monitor slopes after heavy rainfall",
      "Avoid construction on steep slopes"
    ],
    image: "https://media.premiumtimesng.com/wp-content/files/2017/08/Sierra-Leone-Mudslide.jpg"
  }
];
