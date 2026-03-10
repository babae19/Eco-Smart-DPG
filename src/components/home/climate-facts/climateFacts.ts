
export interface ClimateFact {
  title: string;
  description: string;
  category: 'climate' | 'environment' | 'ecology';
  alertLevel?: 'warning' | 'danger' | 'info';
}

export const climateFacts: ClimateFact[] = [
  {
    title: "Freetown's Green Cover",
    description: "Freetown has lost over 40% of its tree cover since 1986. The city's remaining forests play a crucial role in preventing landslides and flooding.",
    category: "environment"
  },
  {
    title: "Annual Rainfall",
    description: "Freetown receives an average of 3,657mm of rainfall annually, with the heaviest precipitation occurring between July and September.",
    category: "climate",
    alertLevel: "warning"
  },
  {
    title: "Coastal Ecosystems",
    description: "Freetown's mangrove ecosystems provide natural protection against coastal erosion and serve as crucial breeding grounds for marine life.",
    category: "ecology"
  },
  {
    title: "Temperature Trends",
    description: "The city experiences average temperatures between 23°C and 31°C, with April and May being the hottest months.",
    category: "climate",
    alertLevel: "info"
  },
  {
    title: "Urban Heat Island Effect",
    description: "Dense urban areas in Freetown can be up to 3°C warmer than surrounding areas due to the urban heat island effect.",
    category: "climate",
    alertLevel: "warning"
  },
  {
    title: "Biodiversity Hotspot",
    description: "The Western Area Peninsula Forest Reserve near Freetown hosts over 300 species of birds and numerous endangered species.",
    category: "ecology"
  },
  {
    title: "Coastal Flooding Risk",
    description: "Rising sea levels pose an increasing threat to Freetown's coastal communities, with potential flooding risks during high tides.",
    category: "environment",
    alertLevel: "danger"
  },
  {
    title: "Air Quality Impact",
    description: "Vehicle emissions and waste burning contribute to declining air quality in Freetown, particularly during the dry season.",
    category: "environment",
    alertLevel: "warning"
  },
  {
    title: "Drought Periods",
    description: "Despite high annual rainfall, Freetown experiences seasonal drought periods that affect water availability.",
    category: "climate",
    alertLevel: "warning"
  },
  {
    title: "Landslide Risk Zones",
    description: "Steep hillsides combined with heavy rainfall make certain areas of Freetown particularly vulnerable to landslides.",
    category: "environment",
    alertLevel: "danger"
  },
  {
    title: "Marine Ecosystem Health",
    description: "Freetown's coastal waters support diverse marine life, but face challenges from pollution and overfishing.",
    category: "ecology"
  },
  {
    title: "Tropical Rainforest Climate",
    description: "Freetown has a tropical rainforest climate, characterized by high temperatures and significant rainfall throughout the year.",
    category: "climate",
    alertLevel: "info"
  },
  {
    title: "Sierra Leone's Climate Vulnerability",
    description: "Sierra Leone is ranked among the top 10 countries most vulnerable to climate change impacts, with Freetown being particularly at risk.",
    category: "environment",
    alertLevel: "warning"
  },
  {
    title: "Water Resources Pressure",
    description: "Rapid urbanization and climate change are putting increasing pressure on Freetown's water resources, affecting both quality and availability.",
    category: "environment",
    alertLevel: "danger"
  },
  {
    title: "Deforestation Challenges",
    description: "Sierra Leone loses approximately 1.9% of its forest cover annually, with significant implications for biodiversity and climate resilience.",
    category: "ecology",
    alertLevel: "warning"
  },
  {
    title: "Sea Level Rise Risks",
    description: "Freetown's low-lying coastal areas are at high risk from sea-level rise, potentially displacing thousands of residents in the coming decades.",
    category: "environment",
    alertLevel: "danger"
  },
  {
    title: "Extreme Weather Patterns",
    description: "Climate change is increasing the frequency and intensity of extreme weather events in Freetown, including heavy rainfall and prolonged dry spells.",
    category: "climate",
    alertLevel: "warning"
  },
  {
    title: "Agricultural Adaptation",
    description: "Changing rainfall patterns are challenging agricultural practices in the regions surrounding Freetown, threatening food security.",
    category: "environment",
    alertLevel: "danger"
  },
  {
    title: "Wetland Preservation",
    description: "The wetlands around Freetown play a crucial role in flood mitigation and serve as important habitats for diverse wildlife.",
    category: "ecology"
  },
  {
    title: "Carbon Sink Potential",
    description: "The forests around Freetown act as significant carbon sinks, helping to mitigate global climate change impacts.",
    category: "ecology",
    alertLevel: "info"
  },
  {
    title: "Urban Resilience Efforts",
    description: "Freetown is implementing green infrastructure and climate adaptation strategies to reduce vulnerability to environmental challenges.",
    category: "environment",
    alertLevel: "info"
  },
  // New climate facts added
  {
    title: "Changing Precipitation Patterns",
    description: "Climate models predict Freetown will experience more intense but less frequent rainfall events, increasing both drought and flash flood risks.",
    category: "climate",
    alertLevel: "warning"
  },
  {
    title: "Heat-Related Health Impacts",
    description: "Rising temperatures in Freetown are leading to increased heat-related illnesses, particularly among vulnerable populations like the elderly and children.",
    category: "climate",
    alertLevel: "danger"
  },
  {
    title: "Native Plant Importance",
    description: "Native plant species in Sierra Leone are more resilient to local climate conditions and support more biodiversity than introduced species.",
    category: "ecology",
    alertLevel: "info"
  },
  {
    title: "Coastal Erosion Acceleration",
    description: "Freetown's coastline is eroding at an average rate of 1-2 meters per year in vulnerable areas, threatening coastal infrastructure.",
    category: "environment",
    alertLevel: "danger"
  },
  {
    title: "Traditional Knowledge Systems",
    description: "Indigenous climate knowledge in Sierra Leone has proven valuable for identifying early warning signs of environmental changes and extreme weather events.",
    category: "climate",
    alertLevel: "info"
  },
  {
    title: "Soil Degradation Concerns",
    description: "Unsustainable land practices around Freetown have led to significant soil degradation, reducing agricultural productivity and increasing erosion risks.",
    category: "environment",
    alertLevel: "warning"
  },
  {
    title: "Solar Energy Potential",
    description: "Freetown receives approximately 2,200 hours of sunshine annually, representing significant untapped potential for solar energy development.",
    category: "climate",
    alertLevel: "info"
  },
  {
    title: "Groundwater Vulnerability",
    description: "Climate change and urban development are affecting Freetown's groundwater tables, with saltwater intrusion becoming a growing concern in coastal areas.",
    category: "environment",
    alertLevel: "danger"
  },
  {
    title: "Endemic Species Threats",
    description: "Sierra Leone is home to several endemic species found nowhere else on Earth, many of which face extinction due to habitat loss and climate change.",
    category: "ecology",
    alertLevel: "danger"
  },
  {
    title: "Climate-Resilient Crops",
    description: "Local farmers near Freetown are increasingly experimenting with drought-resistant crop varieties to adapt to changing rainfall patterns.",
    category: "environment",
    alertLevel: "info"
  },
  {
    title: "Urban Farming Benefits",
    description: "Urban farming initiatives in Freetown are helping to improve food security, reduce heat island effects, and manage stormwater runoff.",
    category: "ecology",
    alertLevel: "info"
  },
  {
    title: "Natural Cooling Mechanisms",
    description: "Freetown's tree canopy can reduce local temperatures by up to 5°C, highlighting the importance of urban green spaces for climate adaptation.",
    category: "climate",
    alertLevel: "info"
  },
  {
    title: "Water Conservation Practices",
    description: "Traditional rainwater harvesting methods are being revitalized in Freetown communities as a sustainable response to increasing water scarcity.",
    category: "environment",
    alertLevel: "info"
  },
  {
    title: "Pollinator Decline",
    description: "Climate change and habitat loss are causing pollinator populations to decline around Freetown, threatening food production and ecosystem health.",
    category: "ecology",
    alertLevel: "warning"
  },
  {
    title: "Climate Migration Trends",
    description: "Environmental pressures have led to increased rural-to-urban migration in Sierra Leone, putting additional stress on Freetown's infrastructure.",
    category: "environment",
    alertLevel: "warning"
  }
];
