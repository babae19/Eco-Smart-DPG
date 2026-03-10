
import { Alert } from '@/types/AlertTypes';
import { supabase } from '@/integrations/supabase/client';

// Create alert generation functions
const generateHeatWaveAlert = (currentTemp: number): Alert | null => {
  if (currentTemp > 40) {
    return {
      id: `heatwave-${Date.now()}`,
      title: "EXTREME HEAT WAVE ALERT",
      description: `Temperature of ${currentTemp.toFixed(1)}°C detected in Freetown. Stay hydrated and seek shade.`,
      location: "Freetown, Sierra Leone",
      severity: "high",
      date: new Date().toISOString(),
      isNew: true,
      type: "temperature"
    };
  } else if (currentTemp > 38) {
    return {
      id: `heatwave-${Date.now()}`,
      title: "Heat Wave Warning",
      description: `High temperature of ${currentTemp.toFixed(1)}°C detected in Freetown. Take precautions.`,
      location: "Freetown, Sierra Leone",
      severity: "medium",
      date: new Date().toISOString(),
      isNew: true,
      type: "temperature"
    };
  }
  
  return null;
};

const generateRainfallAlert = (rainIntensity: number): Alert => {
  return {
    id: `rainfall-${Date.now()}`,
    title: "Heavy Rainfall Alert",
    description: `Rain intensity of ${rainIntensity.toFixed(1)}mm/hr detected in Freetown. Flood risk in low-lying areas.`,
    location: "Freetown, Sierra Leone",
    severity: rainIntensity > 75 ? "high" : "medium",
    date: new Date().toISOString(),
    isNew: true,
    type: "precipitation"
  };
};

const fetchAlertsFromSupabase = async (): Promise<Alert[]> => {
  const { data, error } = await supabase
    .from('alerts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);
  
  if (error) {
    throw error;
  }
  
  // Transform database alerts to match our Alert type
  return data.map(alert => ({
    ...alert,
    type: determineAlertType(alert.title), // Add the type property based on title
    severity: alert.severity as 'high' | 'medium' | 'low',
    isNew: false
  }));
};

// Helper function to determine alert type from title
const determineAlertType = (title: string): string => {
  const lowerTitle = title.toLowerCase();
  if (lowerTitle.includes('heat') || lowerTitle.includes('temperature')) {
    return 'temperature';
  } else if (lowerTitle.includes('rain') || lowerTitle.includes('flood')) {
    return 'precipitation';
  } else if (lowerTitle.includes('disaster')) {
    return 'disaster-prone';
  }
  return 'general';
};

// Export the individual functions for direct imports
export {
  generateHeatWaveAlert,
  generateRainfallAlert,
  fetchAlertsFromSupabase
};

// Export a service object that contains all functions
export const SimulatedAlertsService = {
  generateHeatWaveAlert,
  generateRainfallAlert,
  fetchAlertsFromSupabase
};

// Add a default export as an alternative way to import the service
export default {
  generateHeatWaveAlert,
  generateRainfallAlert,
  fetchAlertsFromSupabase
};
