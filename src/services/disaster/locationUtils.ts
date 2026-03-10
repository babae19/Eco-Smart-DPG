
export const formatDistance = (distanceKm: number): string => {
  if (distanceKm < 0.001) {
    return `${Math.round(distanceKm * 1000000)}mm`;
  } else if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)}m`;
  } else if (distanceKm < 10) {
    return `${distanceKm.toFixed(1)}km`;
  } else {
    return `${Math.round(distanceKm)}km`;
  }
};

export const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

export const isValidCoordinate = (lat: number, lng: number): boolean => {
  return lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180 && 
         !isNaN(lat) && !isNaN(lng);
};

export const formatCoordinates = (lat: number, lng: number, precision: number = 4): string => {
  return `${lat.toFixed(precision)}, ${lng.toFixed(precision)}`;
};

// Risk area interface
export interface RiskArea {
  id: string;
  name: string;
  coordinates: { latitude: number; longitude: number };
  risks: string[];
  vulnerabilityLevel: 'low' | 'medium' | 'high' | 'critical';
  distance: number;
  historicalEvents: Array<{
    type: string;
    year: number;
    description: string;
  }>;
}

// Mock risk areas data for Sierra Leone
const RISK_AREAS_DATA: Omit<RiskArea, 'distance'>[] = [
  {
    id: 'kroo-bay',
    name: 'Kroo Bay',
    coordinates: { latitude: 8.4756, longitude: -13.2441 },
    risks: ['flooding', 'fire outbreak'],
    vulnerabilityLevel: 'critical',
    historicalEvents: [
      { type: 'flooding', year: 2017, description: 'Severe flooding during rainy season' },
      { type: 'fire outbreak', year: 2019, description: 'Major fire destroyed hundreds of homes' }
    ]
  },
  {
    id: 'susan-bay',
    name: "Susan's Bay",
    coordinates: { latitude: 8.4840, longitude: -13.2299 },
    risks: ['flooding', 'fire outbreak'],
    vulnerabilityLevel: 'critical',
    historicalEvents: [
      { type: 'fire outbreak', year: 2021, description: 'Devastating fire displaced thousands' },
      { type: 'flooding', year: 2018, description: 'Annual flooding affects community' }
    ]
  },
  {
    id: 'regent',
    name: 'Regent',
    coordinates: { latitude: 8.4657, longitude: -13.2317 },
    risks: ['landslide'],
    vulnerabilityLevel: 'high',
    historicalEvents: [
      { type: 'landslide', year: 2017, description: 'Fatal landslide killed over 400 people' }
    ]
  },
  {
    id: 'hill-station',
    name: 'Hill Station',
    coordinates: { latitude: 8.4500, longitude: -13.2200 },
    risks: ['landslide'],
    vulnerabilityLevel: 'medium',
    historicalEvents: [
      { type: 'landslide', year: 2019, description: 'Minor landslide damaged several homes' }
    ]
  }
];

export const findNearbyRiskAreas = (
  userLatitude: number,
  userLongitude: number,
  radiusKm: number = 10
): RiskArea[] => {
  return RISK_AREAS_DATA
    .map(area => ({
      ...area,
      distance: calculateDistance(
        userLatitude,
        userLongitude,
        area.coordinates.latitude,
        area.coordinates.longitude
      )
    }))
    .filter(area => area.distance <= radiusKm)
    .sort((a, b) => a.distance - b.distance);
};
