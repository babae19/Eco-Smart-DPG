/**
 * Geographic utility functions for accurate distance calculations
 */

// Haversine formula for accurate distance calculation
export const calculateHaversineDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
    Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in kilometers
};

const toRadians = (degrees: number): number => {
  return degrees * (Math.PI / 180);
};

// Format distance for display
export const formatDistance = (distanceKm: number): string => {
  if (distanceKm < 0.1) {
    return `${Math.round(distanceKm * 1000)} m`;
  } else if (distanceKm < 1) {
    return `${(distanceKm * 1000).toFixed(0)} m`;
  } else if (distanceKm < 10) {
    return `${distanceKm.toFixed(2)} km`;
  } else {
    return `${distanceKm.toFixed(1)} km`;
  }
};

// Estimate walking time based on distance
export const estimateWalkingTime = (distanceKm: number): string => {
  const walkingSpeedKmH = 5; // Average walking speed
  const timeHours = distanceKm / walkingSpeedKmH;
  const timeMinutes = Math.round(timeHours * 60);
  
  if (timeMinutes < 60) {
    return `${timeMinutes} min walk`;
  } else {
    const hours = Math.floor(timeMinutes / 60);
    const mins = timeMinutes % 60;
    return mins > 0 ? `${hours}h ${mins}min walk` : `${hours}h walk`;
  }
};

// Estimate driving time based on distance
export const estimateDrivingTime = (distanceKm: number): string => {
  const drivingSpeedKmH = 25; // Average city driving speed with traffic
  const timeHours = distanceKm / drivingSpeedKmH;
  const timeMinutes = Math.round(timeHours * 60);
  
  if (timeMinutes < 60) {
    return `${timeMinutes} min drive`;
  } else {
    const hours = Math.floor(timeMinutes / 60);
    const mins = timeMinutes % 60;
    return mins > 0 ? `${hours}h ${mins}min drive` : `${hours}h drive`;
  }
};

// Calculate route distance from path coordinates
export const calculateRouteDistance = (path: Array<{ lat: number; lng: number }>): number => {
  let totalDistance = 0;
  for (let i = 0; i < path.length - 1; i++) {
    totalDistance += calculateHaversineDistance(
      path[i].lat,
      path[i].lng,
      path[i + 1].lat,
      path[i + 1].lng
    );
  }
  return totalDistance;
};

// Find distance from user to nearest point on a route
export const findDistanceToRoute = (
  userLat: number,
  userLng: number,
  path: Array<{ lat: number; lng: number }>
): { distance: number; nearestPoint: { lat: number; lng: number } } => {
  let minDistance = Infinity;
  let nearestPoint = path[0];
  
  for (const point of path) {
    const distance = calculateHaversineDistance(userLat, userLng, point.lat, point.lng);
    if (distance < minDistance) {
      minDistance = distance;
      nearestPoint = point;
    }
  }
  
  return { distance: minDistance, nearestPoint };
};
