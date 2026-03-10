
import { DisasterProneArea } from '@/types/DisasterProneAreaTypes';

export const extendedDisasterProneAreas: DisasterProneArea[] = [
  {
    id: 11,
    name: "Leicester Peak",
    risks: ["Landslides", "Deforestation", "Water Source Contamination", "Wildlife Disruption"],
    weatherRisks: ["Heavy Rainfall", "Soil Erosion", "Flash Floods", "Wind Damage"],
    coordinates: {
      latitude: 8.423,
      longitude: -13.167
    },
    description: "Critical watershed area providing 80% of Freetown's water supply. Deforestation and illegal mining activities increase landslide risk and threaten water quality for the entire city.",
    vulnerabilityLevel: "critical",
    safetyTips: [
      "Avoid mountainous areas completely during heavy rain and storm warnings",
      "Report illegal logging, mining, or construction activities to forestry authorities immediately",
      "Boil all water for at least 3 minutes during contamination alerts",
      "Use water purification tablets or filters if municipal water appears cloudy",
      "Support reforestation efforts and avoid purchasing illegally harvested timber",
      "Monitor local news for water quality updates and restrictions",
      "Store emergency water supplies for at least 72 hours",
      "Report dead fish or unusual water colors to environmental authorities"
    ],
    historicalEvents: [
      { type: "Water Contamination", year: 2020, severity: "high", description: "Mining activities contaminated water supply for thousands" },
      { type: "Deforestation", year: 2019, severity: "high", description: "Illegal logging increased erosion and landslide risk" }
    ]
  },
  {
    id: 12,
    name: "Murray Town",
    risks: ["Urban Flooding", "Overcrowding", "Infrastructure Collapse", "Traffic Congestion"],
    weatherRisks: ["Heavy Rainfall", "Poor Drainage", "Storm Damage"],
    coordinates: {
      latitude: 8.494,
      longitude: -13.246
    },
    description: "Historic residential area with colonial-era infrastructure struggling under modern population pressure. High density living and aging drainage systems create significant flood risks.",
    vulnerabilityLevel: "high",
    safetyTips: [
      "Conduct regular maintenance of personal and community drainage systems",
      "Monitor building structural integrity - report cracks or sagging to authorities",
      "Participate in community flood preparedness planning and drills",
      "Keep emergency supplies accessible on upper floors",
      "Identify higher ground evacuation areas (Tower Hill, Signal Hill)",
      "Use alternative routes during flooding (via Circular Road or Kissy Road)",
      "Install sump pumps where possible in flood-prone buildings",
      "Form neighborhood watch groups for emergency response coordination",
      "Report dangerous building conditions to City Council immediately"
    ],
    historicalEvents: [
      { type: "Urban Flooding", year: 2021, severity: "medium", description: "Major flooding disrupted transport and damaged historic buildings" },
      { type: "Infrastructure Damage", year: 2020, severity: "medium", description: "Heavy rains exposed weaknesses in aging infrastructure" }
    ]
  },
  {
    id: 14,
    name: "Goderich",
    risks: ["Coastal Erosion", "Storm Surge", "Beach Infrastructure Damage", "Saltwater Intrusion"],
    weatherRisks: ["High Tides", "Strong Winds", "Storm Surge", "Atlantic Storms"],
    coordinates: {
      latitude: 8.412,
      longitude: -13.298
    },
    description: "Upscale coastal residential area popular with expatriates and wealthy Sierra Leoneans. Accelerating beach erosion threatens expensive waterfront properties and exclusive recreational facilities.",
    vulnerabilityLevel: "high",
    safetyTips: [
      "Install sea walls and coastal protection measures around waterfront properties",
      "Monitor tide schedules and storm warnings daily during Atlantic storm season",
      "Secure or relocate outdoor furniture, vehicles, and equipment before storms",
      "Have evacuation plan to inland areas (Hill Station or Wilberforce)",
      "Install surge protection and drainage systems for beachfront homes",
      "Keep emergency supplies for potential isolation during severe storms",
      "Report coastal erosion and infrastructure damage to authorities",
      "Consider flood and storm insurance for valuable coastal properties",
      "Avoid beach areas during red flag weather conditions"
    ],
    historicalEvents: [
      { type: "Coastal Erosion", year: 2022, severity: "high", description: "Rapid erosion threatened several luxury homes" },
      { type: "Storm Surge", year: 2021, severity: "medium", description: "Atlantic storm surge damaged beachfront infrastructure" }
    ]
  },
  {
    id: 15,
    name: "Congo Town",
    risks: ["Urban Flooding", "Traffic Disruption", "Market Flooding", "Economic Losses"],
    weatherRisks: ["Heavy Rainfall", "Flash Floods", "Poor Infrastructure"],
    coordinates: {
      latitude: 8.487,
      longitude: -13.236
    },
    description: "Major commercial hub with central markets serving the entire city. Flooding disrupts commerce, creates significant economic losses, and affects food distribution throughout Freetown.",
    vulnerabilityLevel: "high",
    safetyTips: [
      "Use waterproof storage containers for goods and important business documents",
      "Identify alternative market locations and trading areas",
      "Install early warning systems and communication networks for traders",
      "Elevate valuable merchandise above potential flood levels",
      "Keep emergency business contacts and supply chain alternatives ready",
      "Monitor weather forecasts and flood warnings before market days",
      "Maintain drainage around market stalls and clear gutters regularly",
      "Form trader associations for coordinated emergency response",
      "Keep emergency transportation contacts for goods evacuation"
    ],
    historicalEvents: [
      { type: "Market Flooding", year: 2021, severity: "high", description: "Major flooding caused millions in losses to traders" },
      { type: "Flash Flood", year: 2020, severity: "medium", description: "Rapid flooding disrupted city-wide food distribution" }
    ]
  },
  {
    id: 31,
    name: "Wilberforce",
    risks: ["Hillside Erosion", "Infrastructure Damage", "Tree Falls", "Power Outages"],
    weatherRisks: ["Heavy Rainfall", "Strong Winds", "Lightning Strikes"],
    coordinates: {
      latitude: 8.463,
      longitude: -13.195
    },
    description: "Established residential hillside area with mature vegetation and steep access roads. Combination of aging trees, steep terrain, and intensive development creates multiple hazards during storms.",
    vulnerabilityLevel: "medium",
    safetyTips: [
      "Conduct regular tree maintenance and professional inspection of large trees",
      "Secure alternative transportation routes in case main roads become blocked",
      "Monitor slope stability after heavy rains - look for cracks or settling",
      "Install lightning protection for homes with metal roofing",
      "Keep emergency generators or alternative power sources ready",
      "Trim tree branches away from power lines and buildings",
      "Have emergency contacts for tree removal and road clearing services",
      "Install drainage systems to prevent water accumulation on slopes",
      "Report dangerous trees or unstable slopes to City Council"
    ],
    historicalEvents: [
      { type: "Tree Falls", year: 2021, severity: "medium", description: "Multiple tree falls blocked roads and damaged homes" },
      { type: "Slope Erosion", year: 2020, severity: "medium", description: "Heavy rains caused erosion damage to hillside properties" }
    ]
  },
  {
    id: 32,
    name: "Juba",
    risks: ["Flash Floods", "Bridge Damage", "Transportation Disruption", "Isolation"],
    weatherRisks: ["Heavy Rainfall", "River Overflow", "Infrastructure Stress"],
    coordinates: {
      latitude: 8.451,
      longitude: -13.189
    },
    description: "Strategic area with critical transportation infrastructure including bridges connecting eastern and western parts of Freetown. Flooding frequently isolates communities and disrupts city-wide mobility.",
    vulnerabilityLevel: "critical",
    safetyTips: [
      "Know and regularly practice using alternative transportation routes",
      "Monitor bridge conditions during storms - avoid crossing if water is high",
      "Keep emergency transportation contacts and evacuation services ready",
      "Maintain communication with family/work in case of isolation",
      "Stock emergency supplies for potential multi-day isolation",
      "Monitor local radio for bridge closures and route updates",
      "Report bridge damage or water level concerns to authorities immediately",
      "Have backup plans for work, school, and medical appointments",
      "Consider temporary relocation during peak flood season if vulnerable"
    ],
    historicalEvents: [
      { type: "Bridge Damage", year: 2021, severity: "high", description: "Flooding damaged key bridge, isolating thousands for days" },
      { type: "Transportation Disruption", year: 2020, severity: "high", description: "Major flooding cut off access to eastern areas" }
    ]
  },
  {
    id: 33,
    name: "Brookfields",
    risks: ["Urban Sprawl", "Inadequate Services", "Seasonal Flooding", "Infrastructure Strain"],
    weatherRisks: ["Heavy Rainfall", "Poor Infrastructure", "Service Disruption"],
    coordinates: {
      latitude: 8.441,
      longitude: -13.178
    },
    description: "Rapidly expanding residential area experiencing uncontrolled growth. Limited infrastructure struggles to serve growing population, creating vulnerability to flooding and service disruptions.",
    vulnerabilityLevel: "medium",
    safetyTips: [
      "Organize community groups for emergency response and infrastructure advocacy",
      "Practice proper waste disposal to prevent drain blockage and flooding",
      "Advocate with local authorities for improved drainage and emergency services",
      "Create neighborhood communication networks for emergency coordination",
      "Install private drainage systems where public infrastructure is inadequate",
      "Monitor development and report illegal construction to authorities",
      "Participate in community planning meetings and disaster preparedness",
      "Keep emergency supplies ready due to limited emergency services",
      "Support infrastructure development projects and proper urban planning"
    ],
    historicalEvents: [
      { type: "Seasonal Flooding", year: 2021, severity: "medium", description: "Poor drainage caused widespread flooding in new developments" },
      { type: "Service Disruption", year: 2020, severity: "medium", description: "Rapid growth overwhelmed existing infrastructure" }
    ]
  }
];
