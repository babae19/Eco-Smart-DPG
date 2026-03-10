/**
 * Evacuation Routes and Safe Zones Data for Freetown
 */

export interface EvacuationRoute {
  id: string;
  name: string;
  from: string;
  to: string;
  path: Array<{ lat: number; lng: number }>;
  description: string;
  distance: string;
  estimatedTime: string;
  safetyLevel: 'high' | 'medium' | 'low';
}

export interface SafeZone {
  id: string;
  name: string;
  type: 'hospital' | 'school' | 'government' | 'community' | 'shelter' | 'religious';
  coordinates: { lat: number; lng: number };
  capacity: number;
  facilities: string[];
  contactNumber?: string;
  description: string;
}

export interface HistoricalDisaster {
  id: string;
  type: 'flood' | 'landslide' | 'fire' | 'storm';
  location: string;
  coordinates: { lat: number; lng: number };
  year: number;
  month?: number;
  severity: 'low' | 'medium' | 'high' | 'catastrophic';
  casualties?: number;
  displaced?: number;
  description: string;
  affectedArea?: number; // in square km
}

// Safe Zones in Freetown
export const safeZones: SafeZone[] = [
  {
    id: 'sz-1',
    name: 'Connaught Hospital',
    type: 'hospital',
    coordinates: { lat: 8.4767, lng: -13.2345 },
    capacity: 500,
    facilities: ['Emergency Room', 'Medical Supplies', 'Shelter'],
    contactNumber: '+232 22 222 222',
    description: 'Main government hospital with emergency facilities'
  },
  {
    id: 'sz-2',
    name: 'National Stadium',
    type: 'shelter',
    coordinates: { lat: 8.4512, lng: -13.2289 },
    capacity: 10000,
    facilities: ['Open Space', 'Sanitation', 'First Aid'],
    description: 'Large open area for mass evacuation and relief operations'
  },
  {
    id: 'sz-3',
    name: 'Fourah Bay College',
    type: 'school',
    coordinates: { lat: 8.4167, lng: -13.1833 },
    capacity: 3000,
    facilities: ['Classrooms', 'Water Supply', 'Electricity'],
    description: 'Higher ground location safe from coastal flooding'
  },
  {
    id: 'sz-4',
    name: 'Hill Station Community Center',
    type: 'community',
    coordinates: { lat: 8.4234, lng: -13.2156 },
    capacity: 800,
    facilities: ['Community Hall', 'Kitchen', 'First Aid'],
    description: 'Elevated location away from flood zones'
  },
  {
    id: 'sz-5',
    name: 'State House Grounds',
    type: 'government',
    coordinates: { lat: 8.4645, lng: -13.2412 },
    capacity: 2000,
    facilities: ['Security', 'Medical Station', 'Communications'],
    description: 'Government emergency coordination center'
  },
  {
    id: 'sz-6',
    name: 'Signal Hill School',
    type: 'school',
    coordinates: { lat: 8.4523, lng: -13.2534 },
    capacity: 1200,
    facilities: ['Classrooms', 'Water', 'Generator'],
    description: 'Elevated school with emergency supplies'
  },
  {
    id: 'sz-7',
    name: 'Wesley Methodist Church',
    type: 'religious',
    coordinates: { lat: 8.4756, lng: -13.2298 },
    capacity: 600,
    facilities: ['Hall', 'Kitchen', 'Counseling'],
    description: 'Historic church serving as community shelter'
  },
  {
    id: 'sz-8',
    name: 'Wilberforce Barracks',
    type: 'government',
    coordinates: { lat: 8.4589, lng: -13.2023 },
    capacity: 1500,
    facilities: ['Medical', 'Security', 'Supplies', 'Vehicles'],
    description: 'Military facility with emergency response capability'
  }
];

// Evacuation Routes
export const evacuationRoutes: EvacuationRoute[] = [
  {
    id: 'er-1',
    name: 'Kroo Bay to Hill Station',
    from: 'Kroo Bay',
    to: 'Hill Station Community Center',
    path: [
      { lat: 8.4657, lng: -13.2317 },
      { lat: 8.4689, lng: -13.2345 },
      { lat: 8.4623, lng: -13.2267 },
      { lat: 8.4456, lng: -13.2189 },
      { lat: 8.4234, lng: -13.2156 }
    ],
    description: 'Primary evacuation route from coastal flooding to elevated safe zone',
    distance: '4.2 km',
    estimatedTime: '45 min walking',
    safetyLevel: 'high'
  },
  {
    id: 'er-2',
    name: 'Susan\'s Bay to State House',
    from: 'Susan\'s Bay',
    to: 'State House Grounds',
    path: [
      { lat: 8.4701, lng: -13.2342 },
      { lat: 8.4689, lng: -13.2378 },
      { lat: 8.4667, lng: -13.2401 },
      { lat: 8.4645, lng: -13.2412 }
    ],
    description: 'Short evacuation route to government emergency center',
    distance: '1.5 km',
    estimatedTime: '15 min walking',
    safetyLevel: 'high'
  },
  {
    id: 'er-3',
    name: 'Regent to Grafton',
    from: 'Regent',
    to: 'Grafton Safe Area',
    path: [
      { lat: 8.3833, lng: -13.1667 },
      { lat: 8.3912, lng: -13.1734 },
      { lat: 8.4023, lng: -13.1823 },
      { lat: 8.4156, lng: -13.1912 },
      { lat: 8.4267, lng: -13.2023 }
    ],
    description: 'Critical landslide evacuation route away from mountain slopes',
    distance: '6.8 km',
    estimatedTime: '1 hr walking, 20 min by vehicle',
    safetyLevel: 'medium'
  },
  {
    id: 'er-4',
    name: 'Kissy to National Stadium',
    from: 'Kissy',
    to: 'National Stadium',
    path: [
      { lat: 8.4590, lng: -13.2156 },
      { lat: 8.4567, lng: -13.2189 },
      { lat: 8.4534, lng: -13.2234 },
      { lat: 8.4512, lng: -13.2289 }
    ],
    description: 'Flood evacuation route to large open shelter area',
    distance: '2.1 km',
    estimatedTime: '25 min walking',
    safetyLevel: 'high'
  },
  {
    id: 'er-5',
    name: 'Aberdeen to Wilberforce',
    from: 'Aberdeen',
    to: 'Wilberforce Barracks',
    path: [
      { lat: 8.4089, lng: -13.2689 },
      { lat: 8.4156, lng: -13.2534 },
      { lat: 8.4289, lng: -13.2312 },
      { lat: 8.4456, lng: -13.2089 },
      { lat: 8.4589, lng: -13.2023 }
    ],
    description: 'Coastal storm evacuation to inland military facility',
    distance: '5.5 km',
    estimatedTime: '55 min walking, 15 min by vehicle',
    safetyLevel: 'high'
  },
  {
    id: 'er-6',
    name: 'Murray Town to Signal Hill',
    from: 'Murray Town',
    to: 'Signal Hill School',
    path: [
      { lat: 8.494, lng: -13.246 },
      { lat: 8.4823, lng: -13.2501 },
      { lat: 8.4678, lng: -13.2523 },
      { lat: 8.4523, lng: -13.2534 }
    ],
    description: 'Urban flood evacuation to elevated school facility',
    distance: '3.2 km',
    estimatedTime: '35 min walking',
    safetyLevel: 'medium'
  }
];

// Historical Disasters in Freetown
export const historicalDisasters: HistoricalDisaster[] = [
  // Catastrophic Events
  {
    id: 'hd-1',
    type: 'landslide',
    location: 'Regent',
    coordinates: { lat: 8.3833, lng: -13.1667 },
    year: 2017,
    month: 8,
    severity: 'catastrophic',
    casualties: 1141,
    displaced: 3000,
    description: 'Devastating mudslide after heavy rainfall killed over 1,000 people and destroyed 349 buildings in Sugar Loaf and surrounding areas.',
    affectedArea: 2.5
  },
  // Major Floods
  {
    id: 'hd-2',
    type: 'flood',
    location: 'Kroo Bay',
    coordinates: { lat: 8.4657, lng: -13.2317 },
    year: 2019,
    month: 7,
    severity: 'high',
    casualties: 12,
    displaced: 2500,
    description: 'Severe coastal flooding during rainy season peak displaced thousands of families from informal settlements.',
    affectedArea: 0.8
  },
  {
    id: 'hd-3',
    type: 'flood',
    location: 'Kissy',
    coordinates: { lat: 8.4590, lng: -13.2156 },
    year: 2021,
    month: 8,
    severity: 'high',
    casualties: 5,
    displaced: 1800,
    description: 'Flash floods overwhelmed drainage infrastructure, flooding hundreds of homes and businesses.',
    affectedArea: 1.2
  },
  // Fire Events
  {
    id: 'hd-4',
    type: 'fire',
    location: 'Susan\'s Bay',
    coordinates: { lat: 8.4701, lng: -13.2342 },
    year: 2021,
    month: 3,
    severity: 'high',
    casualties: 6,
    displaced: 7000,
    description: 'Major fire swept through densely packed informal settlement destroying over 500 structures.',
    affectedArea: 0.3
  },
  // Landslides
  {
    id: 'hd-5',
    type: 'landslide',
    location: 'Mount Aureol',
    coordinates: { lat: 8.4167, lng: -13.1833 },
    year: 2018,
    month: 9,
    severity: 'medium',
    casualties: 0,
    displaced: 150,
    description: 'Landslide blocked access roads to university, no casualties but caused significant infrastructure damage.',
    affectedArea: 0.2
  },
  // Storm Events
  {
    id: 'hd-6',
    type: 'storm',
    location: 'Aberdeen',
    coordinates: { lat: 8.4089, lng: -13.2689 },
    year: 2021,
    month: 6,
    severity: 'medium',
    casualties: 2,
    displaced: 400,
    description: 'Atlantic storm surge combined with high tide caused significant coastal damage and property destruction.',
    affectedArea: 0.5
  },
  {
    id: 'hd-7',
    type: 'flood',
    location: 'Congo Town',
    coordinates: { lat: 8.487, lng: -13.236 },
    year: 2021,
    month: 7,
    severity: 'high',
    casualties: 3,
    displaced: 1200,
    description: 'Market flooding caused millions in economic losses and displaced hundreds of traders.',
    affectedArea: 0.4
  },
  {
    id: 'hd-8',
    type: 'flood',
    location: 'Juba',
    coordinates: { lat: 8.451, lng: -13.189 },
    year: 2021,
    month: 8,
    severity: 'high',
    casualties: 4,
    displaced: 800,
    description: 'Bridge flooding isolated communities for days, disrupting transportation across the city.',
    affectedArea: 0.6
  },
  {
    id: 'hd-9',
    type: 'landslide',
    location: 'Leicester Peak',
    coordinates: { lat: 8.423, lng: -13.167 },
    year: 2020,
    month: 9,
    severity: 'medium',
    casualties: 0,
    displaced: 50,
    description: 'Deforestation-related erosion caused water contamination affecting thousands.',
    affectedArea: 0.3
  },
  {
    id: 'hd-10',
    type: 'flood',
    location: 'Murray Town',
    coordinates: { lat: 8.494, lng: -13.246 },
    year: 2021,
    month: 7,
    severity: 'medium',
    casualties: 1,
    displaced: 600,
    description: 'Colonial-era drainage failed causing flooding in historic residential area.',
    affectedArea: 0.4
  }
];

// Helper functions
export const getDisastersByType = (type: HistoricalDisaster['type']) => 
  historicalDisasters.filter(d => d.type === type);

export const getDisastersBySeverity = (severity: HistoricalDisaster['severity']) => 
  historicalDisasters.filter(d => d.severity === severity);

export const getDisastersByYear = (year: number) => 
  historicalDisasters.filter(d => d.year === year);

export const getSafeZonesByType = (type: SafeZone['type']) => 
  safeZones.filter(sz => sz.type === type);

export const getNearestSafeZone = (lat: number, lng: number): SafeZone => {
  let nearest = safeZones[0];
  let minDistance = Infinity;
  
  safeZones.forEach(sz => {
    const distance = Math.sqrt(
      Math.pow(sz.coordinates.lat - lat, 2) + 
      Math.pow(sz.coordinates.lng - lng, 2)
    );
    if (distance < minDistance) {
      minDistance = distance;
      nearest = sz;
    }
  });
  
  return nearest;
};
