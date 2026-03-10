
import { EnvironmentalTip } from './types';
import { localTipsDatabase } from './tipDatabase';

// Collection of original environmental tips for the AI assistant to provide
const environmentalTips: EnvironmentalTip[] = [
  {
    id: 1,
    tip: "Plant trees native to your region to support local biodiversity and improve air quality.",
    title: "Plant Native Trees",
    content: "Plant trees native to your region to support local biodiversity and improve air quality.",
    category: "biodiversity",
    season: "all",
    source: "Environmental Protection Agency",
    imageUrl: "/placeholder.svg"
  },
  {
    id: 2,
    tip: "Use reusable water bottles instead of single-use plastic bottles to reduce plastic waste.",
    title: "Use Reusable Water Bottles",
    content: "Use reusable water bottles instead of single-use plastic bottles to reduce plastic waste.",
    category: "waste",
    season: "all",
    source: "Plastic Pollution Coalition",
    imageUrl: "/placeholder.svg"
  },
  {
    id: 3,
    tip: "During heavy rain, make sure drainage systems around your home are clear to prevent flooding.",
    title: "Clear Drainage Systems",
    content: "During heavy rain, make sure drainage systems around your home are clear to prevent flooding.",
    category: "adaptation",
    season: "rainy",
    source: "Flood Management Authority",
    imageUrl: "/placeholder.svg"
  },
  {
    id: 4,
    tip: "Install rainwater harvesting systems to collect and reuse rainwater for gardens and non-potable uses.",
    title: "Harvest Rainwater",
    content: "Install rainwater harvesting systems to collect and reuse rainwater for gardens and non-potable uses.",
    category: "water",
    season: "rainy",
    source: "Water Conservation Institute",
    imageUrl: "/placeholder.svg"
  },
  {
    id: 5,
    tip: "Keep windows and doors shut during the hottest part of the day to maintain cooler indoor temperatures.",
    title: "Keep Cool Indoors",
    content: "Keep windows and doors shut during the hottest part of the day to maintain cooler indoor temperatures.",
    category: "energy",
    season: "hot",
    source: "Energy Efficiency Center",
    imageUrl: "/placeholder.svg"
  },
  {
    id: 6,
    tip: "Use ceiling fans or portable fans instead of air conditioning to reduce energy consumption.",
    title: "Use Fans Over AC",
    content: "Use ceiling fans or portable fans instead of air conditioning to reduce energy consumption.",
    category: "energy",
    season: "hot",
    source: "Sustainable Energy Association",
    imageUrl: "/placeholder.svg"
  },
  {
    id: 7,
    tip: "Create shade for your home with trees, awnings, or window coverings to reduce cooling needs.",
    title: "Create Natural Shade",
    content: "Create shade for your home with trees, awnings, or window coverings to reduce cooling needs.",
    category: "adaptation",
    season: "hot",
    source: "Green Building Council",
    imageUrl: "/placeholder.svg"
  },
  {
    id: 8,
    tip: "Check on elderly neighbors during extreme heat events as they are more vulnerable to heat-related illness.",
    title: "Check on Neighbors",
    content: "Check on elderly neighbors during extreme heat events as they are more vulnerable to heat-related illness.",
    category: "community",
    season: "hot",
    source: "Public Health Department",
    imageUrl: "/placeholder.svg"
  },
  {
    id: 9,
    tip: "Practice crop rotation in gardens to maintain soil health and reduce pest problems naturally.",
    title: "Rotate Garden Crops",
    content: "Practice crop rotation in gardens to maintain soil health and reduce pest problems naturally.",
    category: "agriculture",
    season: "all",
    source: "Sustainable Agriculture Network",
    imageUrl: "/placeholder.svg"
  },
  {
    id: 10,
    tip: "Use public transportation, carpool, bike, or walk to reduce carbon emissions from vehicles.",
    title: "Reduce Transportation Emissions",
    content: "Use public transportation, carpool, bike, or walk to reduce carbon emissions from vehicles.",
    category: "transportation",
    season: "all",
    source: "Clean Air Coalition",
    imageUrl: "/placeholder.svg"
  }
];

/**
 * Get all available environmental tips
 */
export const getTips = (): EnvironmentalTip[] => {
  return [...environmentalTips, ...convertDatabaseTips()];
};

/**
 * Convert tips from database to the EnvironmentalTip format
 */
const convertDatabaseTips = (): EnvironmentalTip[] => {
  return localTipsDatabase.map((tip, index) => ({
    id: environmentalTips.length + index + 1,
    title: tip.title,
    content: tip.content,
    category: tip.category,
    source: tip.source,
    imageUrl: tip.imageUrl,
    season: "all"
  }));
};

/**
 * Get a random tip or a tip specific to the current weather conditions
 */
export const getRandomTip = (weatherCondition?: string): EnvironmentalTip => {
  let filteredTips = [...environmentalTips, ...convertDatabaseTips()];
  
  // Filter tips based on weather condition if provided
  if (weatherCondition) {
    const condition = weatherCondition.toLowerCase();
    
    if (condition.includes('rain') || condition.includes('storm')) {
      filteredTips = filteredTips.filter(tip => 
        tip.season === 'rainy' || tip.season === 'all'
      );
    } else if (condition.includes('hot') || condition.includes('sunny') || condition.includes('clear')) {
      filteredTips = filteredTips.filter(tip => 
        tip.season === 'hot' || tip.season === 'all'
      );
    }
  }
  
  // Return a random tip from the filtered or all tips
  const randomIndex = Math.floor(Math.random() * filteredTips.length);
  return filteredTips[randomIndex];
};

// Create aliases for functions to maintain backward compatibility
export const getAllTips = getTips;
export const getDailyTip = getRandomTip;
