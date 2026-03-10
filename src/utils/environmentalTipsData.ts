export interface EnvironmentalTipItem {
  id: number;
  title: string;
  description: string;
  category: 'energy' | 'water' | 'waste' | 'eco-practices';
  impact: 'high' | 'medium' | 'low';
  difficulty: 'easy' | 'moderate' | 'advanced';
  estimatedSavings?: string;
  timeToImplement?: string;
}

export const environmentalTipsData: EnvironmentalTipItem[] = [
  // Energy Saving Tips
  {
    id: 1,
    title: "Switch to LED Bulbs",
    description: "LED light bulbs use up to 75% less energy and last 25 times longer than incandescent lighting, significantly reducing both energy consumption and replacement costs.",
    category: "energy",
    impact: "medium",
    difficulty: "easy",
    estimatedSavings: "$75/year",
    timeToImplement: "5 minutes"
  },
  {
    id: 2,
    title: "Unplug Electronics When Not in Use",
    description: "Many devices consume phantom power even when turned off. Unplugging chargers, TVs, and appliances can reduce energy waste by up to 10%.",
    category: "energy",
    impact: "low",
    difficulty: "easy",
    estimatedSavings: "$25/year",
    timeToImplement: "Daily habit"
  },
  {
    id: 3,
    title: "Install a Programmable Thermostat",
    description: "Automatically adjust heating and cooling based on your schedule. Can save up to 10% on heating and cooling costs annually.",
    category: "energy",
    impact: "high",
    difficulty: "moderate",
    estimatedSavings: "$180/year",
    timeToImplement: "1-2 hours"
  },
  {
    id: 4,
    title: "Use Cold Water for Laundry",
    description: "Washing clothes in cold water can reduce energy consumption by up to 90% per load while keeping clothes looking newer longer.",
    category: "energy",
    impact: "medium",
    difficulty: "easy",
    estimatedSavings: "$60/year",
    timeToImplement: "Instant"
  },
  {
    id: 5,
    title: "Seal Air Leaks",
    description: "Weatherstrip doors and windows, and seal gaps around pipes and vents to prevent energy loss and reduce heating/cooling costs.",
    category: "energy",
    impact: "high",
    difficulty: "moderate",
    estimatedSavings: "$200/year",
    timeToImplement: "2-4 hours"
  },

  // Water Conservation Tips
  {
    id: 6,
    title: "Fix Water Leaks Immediately",
    description: "A single dripping faucet can waste over 3,000 gallons per year. Check all faucets, toilets, and pipes regularly for leaks.",
    category: "water",
    impact: "medium",
    difficulty: "easy",
    estimatedSavings: "$35/year",
    timeToImplement: "30 minutes"
  },
  {
    id: 7,
    title: "Install Low-Flow Showerheads",
    description: "Low-flow showerheads can reduce water usage by 40% without compromising water pressure, saving both water and energy costs.",
    category: "water",
    impact: "high",
    difficulty: "easy",
    estimatedSavings: "$70/year",
    timeToImplement: "15 minutes"
  },
  {
    id: 8,
    title: "Collect Rainwater",
    description: "Install rain barrels to collect water for gardening and outdoor use. Can reduce outdoor water usage by up to 40%.",
    category: "water",
    impact: "medium",
    difficulty: "moderate",
    estimatedSavings: "$50/year",
    timeToImplement: "2 hours"
  },
  {
    id: 9,
    title: "Run Dishwasher Only When Full",
    description: "Wait until you have a full load before running the dishwasher. This can save up to 320 gallons of water per month.",
    category: "water",
    impact: "low",
    difficulty: "easy",
    estimatedSavings: "$15/year",
    timeToImplement: "Daily habit"
  },
  {
    id: 10,
    title: "Plant Drought-Resistant Gardens",
    description: "Choose native plants that require less watering. Xeriscaping can reduce outdoor water use by 50-75%.",
    category: "water",
    impact: "high",
    difficulty: "advanced",
    estimatedSavings: "$120/year",
    timeToImplement: "Weekend project"
  },

  // Waste Management Tips
  {
    id: 11,
    title: "Start Composting",
    description: "Compost kitchen scraps and yard waste to reduce landfill waste by 30% while creating nutrient-rich soil for gardening.",
    category: "waste",
    impact: "high",
    difficulty: "moderate",
    estimatedSavings: "$40/year",
    timeToImplement: "1 hour setup"
  },
  {
    id: 12,
    title: "Use Reusable Shopping Bags",
    description: "Replace single-use plastic bags with reusable ones. One reusable bag can eliminate up to 1,000 plastic bags over its lifetime.",
    category: "waste",
    impact: "medium",
    difficulty: "easy",
    estimatedSavings: "$10/year",
    timeToImplement: "Instant"
  },
  {
    id: 13,
    title: "Buy Products with Minimal Packaging",
    description: "Choose items with less packaging or buy in bulk to reduce waste. This can reduce household waste by 15-20%.",
    category: "waste",
    impact: "medium",
    difficulty: "easy",
    estimatedSavings: "$25/year",
    timeToImplement: "Shopping habit"
  },
  {
    id: 14,
    title: "Recycle Electronics Properly",
    description: "Take old electronics to certified e-waste recycling centers to prevent toxic materials from entering landfills.",
    category: "waste",
    impact: "high",
    difficulty: "easy",
    estimatedSavings: "Environmental benefit",
    timeToImplement: "As needed"
  },
  {
    id: 15,
    title: "Repurpose Glass Jars",
    description: "Use glass jars for food storage, organizing small items, or DIY projects instead of throwing them away.",
    category: "waste",
    impact: "low",
    difficulty: "easy",
    estimatedSavings: "$20/year",
    timeToImplement: "5 minutes"
  },

  // Eco-Friendly Practices
  {
    id: 16,
    title: "Use Public Transportation",
    description: "Taking public transit instead of driving can reduce your carbon footprint by 40% and save on fuel and parking costs.",
    category: "eco-practices",
    impact: "high",
    difficulty: "easy",
    estimatedSavings: "$1,200/year",
    timeToImplement: "Daily choice"
  },
  {
    id: 17,
    title: "Plant Native Trees",
    description: "Native trees require less water and maintenance while providing habitat for wildlife and improving air quality.",
    category: "eco-practices",
    impact: "high",
    difficulty: "moderate",
    estimatedSavings: "Property value increase",
    timeToImplement: "Half day"
  },
  {
    id: 18,
    title: "Choose Eco-Friendly Cleaning Products",
    description: "Use biodegradable, non-toxic cleaning products to reduce water pollution and improve indoor air quality.",
    category: "eco-practices",
    impact: "medium",
    difficulty: "easy",
    estimatedSavings: "$30/year",
    timeToImplement: "Next shopping trip"
  },
  {
    id: 19,
    title: "Reduce Meat Consumption",
    description: "Eating less meat, especially beef, can significantly reduce your carbon footprint and improve health outcomes.",
    category: "eco-practices",
    impact: "high",
    difficulty: "moderate",
    estimatedSavings: "$400/year",
    timeToImplement: "Dietary change"
  },
  {
    id: 20,
    title: "Support Local and Organic Farmers",
    description: "Buy locally grown, organic produce to reduce transportation emissions and support sustainable farming practices.",
    category: "eco-practices",
    impact: "medium",
    difficulty: "easy",
    estimatedSavings: "Health benefits",
    timeToImplement: "Shopping choice"
  },
  {
    id: 21,
    title: "Use Solar Outdoor Lighting",
    description: "Replace electric outdoor lights with solar-powered alternatives to reduce energy consumption and eliminate wiring needs.",
    category: "energy",
    impact: "low",
    difficulty: "easy",
    estimatedSavings: "$40/year",
    timeToImplement: "30 minutes"
  },
  {
    id: 22,
    title: "Install Water-Saving Toilet Flappers",
    description: "Dual-flush toilet systems or water-saving flappers can reduce toilet water usage by up to 40%.",
    category: "water",
    impact: "medium",
    difficulty: "moderate",
    estimatedSavings: "$90/year",
    timeToImplement: "1 hour"
  },
  {
    id: 23,
    title: "Create a Recycling Station",
    description: "Set up clearly labeled bins for different recyclables to make recycling easier and more effective for your household.",
    category: "waste",
    impact: "medium",
    difficulty: "easy",
    estimatedSavings: "$15/year",
    timeToImplement: "1 hour"
  },
  {
    id: 24,
    title: "Use Bamboo Products",
    description: "Replace plastic items with bamboo alternatives like toothbrushes, utensils, and cutting boards for biodegradable options.",
    category: "eco-practices",
    impact: "low",
    difficulty: "easy",
    estimatedSavings: "$25/year",
    timeToImplement: "As items need replacement"
  }
];