import { DisasterProneArea } from '@/types/DisasterProneAreaTypes';
import { allDisasterProneAreas } from '@/components/home/disaster-prone-areas/data';

export interface GeoFenceStatus {
  insideProneArea: boolean;
  nearestProneArea: DisasterProneArea | null;
  proximityAlerts: ProximityAlert[];
  currentRiskLevel: 'safe' | 'low' | 'medium' | 'high' | 'critical';
}

export interface ProximityAlert {
  areaId: string;
  areaName: string;
  distance: number; // in kilometers
  risks: string[];
  urgency: 'low' | 'medium' | 'high';
  riskLevel?: 'low' | 'medium' | 'high' | 'critical'; // Added missing property
  estimatedArrivalTime?: string; // Added missing property
  recommendedActions?: string[]; // Added missing property
}

// Calculate distance between two coordinates using Haversine formula
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  return distance;
};

export const checkProximityToDisasterProneAreas = (
  latitude: number,
  longitude: number,
  accuracy: number = 100
): GeoFenceStatus => {
  try {
    const proximityAlerts: ProximityAlert[] = [];
    let nearestProneArea: DisasterProneArea | null = null;
    let nearestDistance = Infinity;
    let insideProneArea = false;
    let currentRiskLevel: GeoFenceStatus['currentRiskLevel'] = 'safe';

    // Check each disaster-prone area
    allDisasterProneAreas.forEach(area => {
      const distance = calculateDistance(
        latitude,
        longitude,
        area.coordinates.latitude,
        area.coordinates.longitude
      );

      // Check if inside the area (using accuracy as buffer zone)
      const bufferZone = Math.max(accuracy / 1000, 0.5); // Minimum 500m buffer
      if (distance <= bufferZone) {
        insideProneArea = true;
        nearestProneArea = { ...area, distance };
        nearestDistance = distance;
        currentRiskLevel = area.vulnerabilityLevel === 'critical' ? 'critical' : 
                          area.vulnerabilityLevel === 'high' ? 'high' : 'medium';
      }

      // Add to proximity alerts if within 2km
      if (distance <= 2.0 && distance > bufferZone) {
        const urgency: ProximityAlert['urgency'] = 
          distance <= 0.5 ? 'high' :
          distance <= 1.0 ? 'medium' : 'low';

        const estimatedTimeMinutes = Math.round((distance * 1000) / 83.33); // Walking speed ~5km/h
        const estimatedArrivalTime = estimatedTimeMinutes < 60 ? 
          `${estimatedTimeMinutes} min walk` : 
          `${Math.round(estimatedTimeMinutes / 60)} hr walk`;

        proximityAlerts.push({
          areaId: area.id.toString(),
          areaName: area.name,
          distance,
          risks: area.risks,
          urgency,
          riskLevel: area.vulnerabilityLevel,
          estimatedArrivalTime,
          recommendedActions: area.safetyTips.slice(0, 2) // Use first 2 safety tips as recommended actions
        });

        // Update nearest area if this is closer
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestProneArea = { ...area, distance };
          if (currentRiskLevel === 'safe') {
            currentRiskLevel = urgency === 'high' ? 'medium' : 'low';
          }
        }
      }
    });

    // Sort proximity alerts by distance
    proximityAlerts.sort((a, b) => a.distance - b.distance);

    return {
      insideProneArea,
      nearestProneArea,
      proximityAlerts: proximityAlerts.slice(0, 5), // Limit to 5 nearest alerts
      currentRiskLevel
    };
  } catch (error) {
    console.error('[Geo Proximity] Error checking proximity:', error);
    
    // Return safe fallback status
    return {
      insideProneArea: false,
      nearestProneArea: null,
      proximityAlerts: [],
      currentRiskLevel: 'safe'
    };
  }
};
