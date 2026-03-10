
import { Alert } from '@/types/AlertTypes';

// Mock predictive alert generation based on location
export const generatePersonalizedAlerts = (latitude: number, longitude: number): Alert[] => {
  const alerts: Alert[] = [];
  const now = new Date();
  
  // Freetown area coordinates check
  const isInFreetown = latitude > 8.3 && latitude < 8.6 && longitude > -13.3 && longitude < -13.0;
  
  if (isInFreetown) {
    // Generate location-specific alerts for Freetown area
    alerts.push({
      id: `pred-${now.getTime()}-1`,
      title: 'HEAVY RAINFALL PREDICTION',
      description: 'Weather models predict heavy rainfall in your area within the next 6-12 hours. Risk of flash flooding in low-lying areas.',
      location: `Near ${latitude.toFixed(3)}, ${longitude.toFixed(3)}`,
      severity: 'high',
      date: now.toISOString(),
      isNew: true,
      type: 'flood',
      aiPredictionScore: 0.85,
      isPersonalized: true,
      coordinates: { latitude, longitude }
    });

    // Check if in hillside area (higher latitude = hillier areas in Freetown)
    if (latitude > 8.45) {
      alerts.push({
        id: `pred-${now.getTime()}-2`,
        title: 'LANDSLIDE RISK ELEVATED',
        description: 'Your location in the hillside areas shows increased landslide risk due to recent rainfall patterns and soil saturation.',
        location: `Hillside Area ${latitude.toFixed(3)}, ${longitude.toFixed(3)}`,
        severity: 'medium',
        date: now.toISOString(),
        isNew: true,
        type: 'landslide',
        aiPredictionScore: 0.72,
        isPersonalized: true,
        coordinates: { latitude, longitude }
      });
    }

    // Check if in coastal area (lower latitude = closer to coast)
    if (latitude < 8.45) {
      alerts.push({
        id: `pred-${now.getTime()}-3`,
        title: 'COASTAL FLOODING WATCH',
        description: 'High tide combined with potential heavy rainfall may cause coastal flooding in your area. Monitor water levels.',
        location: `Coastal Area ${latitude.toFixed(3)}, ${longitude.toFixed(3)}`,
        severity: 'medium',
        date: now.toISOString(),
        isNew: true,
        type: 'flood',
        aiPredictionScore: 0.68,
        isPersonalized: true,
        coordinates: { latitude, longitude }
      });
    }
  } else {
    // Generate general alerts for areas outside Freetown
    alerts.push({
      id: `pred-${now.getTime()}-general`,
      title: 'WEATHER MONITORING ACTIVE',
      description: 'Continuous monitoring of weather patterns in your area. Stay informed about changing conditions.',
      location: `${latitude.toFixed(3)}, ${longitude.toFixed(3)}`,
      severity: 'low',
      date: now.toISOString(),
      isNew: false,
      type: 'general',
      aiPredictionScore: 0.45,
      isPersonalized: true,
      coordinates: { latitude, longitude }
    });
  }

  return alerts;
};
