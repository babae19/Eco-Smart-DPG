
export interface ClimateAdaptationTip {
  id: number;
  tip: string;
  category: 'energy' | 'water' | 'health' | 'agriculture' | 'resilience' | 'general';
}

export const climateAdaptationTips: ClimateAdaptationTip[] = [
  {
    id: 1,
    tip: "Plant drought-resistant vegetation to conserve water and prevent soil erosion.",
    category: "water"
  },
  {
    id: 2,
    tip: "Install rainwater harvesting systems to collect water during heavy rainfall events.",
    category: "water"
  },
  {
    id: 3,
    tip: "Create cool zones in your home by using light-colored curtains and natural ventilation.",
    category: "energy"
  },
  {
    id: 4,
    tip: "Diversify crops in your garden to increase resilience against changing climate patterns.",
    category: "agriculture"
  },
  {
    id: 5,
    tip: "Keep emergency supplies ready for extreme weather events including water, food, and medicine.",
    category: "resilience"
  },
  {
    id: 6,
    tip: "Stay hydrated and avoid outdoor activities during the hottest parts of the day.",
    category: "health"
  },
  {
    id: 7,
    tip: "Check on vulnerable community members during extreme weather events.",
    category: "general"
  },
  {
    id: 8,
    tip: "Insulate your home properly to maintain comfortable temperatures and reduce energy use.",
    category: "energy"
  },
  {
    id: 9,
    tip: "Use water-efficient appliances and fix leaks promptly to conserve water resources.",
    category: "water"
  },
  {
    id: 10,
    tip: "Participate in community tree planting initiatives to improve local microclimate.",
    category: "resilience"
  }
];
