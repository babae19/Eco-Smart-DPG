import { useState, useEffect, useCallback } from 'react';
import { useWeatherForecast } from '@/hooks/useWeatherForecast';
import { Alert } from '@/types/AlertTypes';
import { WeatherApiService } from '@/services/weather/weatherApiService';
import { WeatherDataProcessor } from '@/services/weather/weatherDataProcessor';
import { disasterProneAreas } from '@/services/disaster/disasterProneAreasData';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useUserLocation } from '@/contexts/LocationContext';

export const useWeatherAlerts = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const { weeklyForecast } = useWeatherForecast();
  const { toast } = useToast();
  const { latitude, longitude } = useUserLocation();

  // Generate weather alerts based on current conditions and forecasts
  const generateAlerts = useCallback(async () => {
    const newAlerts: Alert[] = [];
    const currentDate = new Date();
    
    try {
      // Get current weather data from OpenWeatherMap API
      if (!latitude || !longitude) return [];
      
      const weatherData = await WeatherApiService.fetchWeatherData(latitude, longitude);
      const processedData = WeatherDataProcessor.processWeatherData(weatherData);
      const currentWeather = {
        temperature: processedData.current.temperature,
        humidity: processedData.current.humidity,
        precipitation: processedData.current.precipitation || 0
      };
      
      // Check for high temperature alerts with improved thresholds based on location
      if (currentWeather.temperature > 32) {
        const tempAlert: Alert = {
          id: `temp-${Date.now()}`,
          title: `HIGH TEMPERATURE ALERT`,
          description: `Current temperature is ${currentWeather.temperature.toFixed(1)}°C. ${
            currentWeather.temperature > 35 
              ? "EXTREME HEAT WARNING: Stay indoors, drink plenty of water, and avoid direct sunlight." 
              : "Stay hydrated and avoid prolonged sun exposure."
          }`,
          location: latitude && longitude ? "Your location" : "Freetown",
          severity: currentWeather.temperature > 35 ? "high" : "medium",
          date: currentDate.toLocaleDateString(),
          isNew: true,
          type: "temperature",
          weatherData: {
            temperature: currentWeather.temperature,
            humidity: currentWeather.humidity,
            precipitation: currentWeather.precipitation || 0
          },
          weatherFactor: `Temperature: ${currentWeather.temperature.toFixed(1)}°C`
        };
        
        newAlerts.push(tempAlert);
        
        // Show immediate toast for extremely high temperatures
        if (currentWeather.temperature > 38) {
          toast({
            title: "⚠️ EXTREME HEAT DANGER",
            description: "Temperature exceeds 38°C. Immediate precautions required.",
            variant: "destructive",
          });
        }
      }
      
      // Check for rainfall alerts from forecast with more precise prediction
      if (weeklyForecast && weeklyForecast.length > 0) {
        const todayForecast = weeklyForecast[0];
        
        if (todayForecast.precipChance > 70 || currentWeather.precipitation > 15) {
          // Higher precision rainfall alert
          const rainIntensity = currentWeather.precipitation > 30 ? "Heavy" : 
                               currentWeather.precipitation > 15 ? "Moderate" : "Light";
          
          const rainAlert: Alert = {
            id: `rain-${Date.now()}`,
            title: `${rainIntensity.toUpperCase()} RAINFALL ALERT`,
            description: `${rainIntensity} rainfall ${currentWeather.precipitation > 0 ? "currently occurring" : "expected soon"}. ${
              currentWeather.precipitation > 25 
                ? "HIGH FLOOD RISK: Move to higher ground if in low-lying areas." 
                : "Be prepared for potential water accumulation."
            }`,
            location: latitude && longitude ? "Your location" : "Freetown",
            severity: currentWeather.precipitation > 25 ? "high" : "medium",
            date: currentDate.toLocaleDateString(),
            isNew: true,
            type: "precipitation",
            weatherData: {
              temperature: currentWeather.temperature,
              humidity: currentWeather.humidity,
              precipitation: currentWeather.precipitation || 0
            },
            weatherFactor: `Rainfall: ${currentWeather.precipitation.toFixed(1)}mm`
          };
          
          newAlerts.push(rainAlert);
          
          // Show immediate toast for heavy rainfall
          if (currentWeather.precipitation > 30) {
            toast({
              title: "⚠️ HEAVY RAINFALL ALERT",
              description: "Heavy rain detected. Potential flooding in low-lying areas.",
              variant: "destructive",
            });
          }
        }
      }
      
      // Check if we're in a disaster-prone area with improved accuracy
      if (latitude && longitude) {
        const highRiskAreas = identifyHighRiskAreas(currentWeather, latitude, longitude);
        
        highRiskAreas.forEach((area, index) => {
          const areaAlert: Alert = {
            id: `area-${Date.now()}-${index}`,
            title: `DISASTER RISK ALERT: ${area.name}`,
            description: `${area.name} is at risk of ${area.currentRisk} due to current weather conditions. ${
              currentWeather.precipitation > 30 
                ? "Heavy rainfall increases risk of flooding and landslides. Evacuate if necessary." 
                : "Monitor local conditions and stay prepared."
            }`,
            location: area.name,
            severity: "high",
            date: currentDate.toLocaleDateString(),
            isNew: true,
            type: "disaster-prone",
            weatherData: {
              temperature: currentWeather.temperature,
              humidity: currentWeather.humidity,
              precipitation: currentWeather.precipitation || 0
            },
            weatherFactor: `Risk: ${area.currentRisk}`
          };
          
          newAlerts.push(areaAlert);
          
          // Show immediate toast for disaster-prone areas
          toast({
            title: `⚠️ ${area.currentRisk.toUpperCase()} RISK ALERT`,
            description: `${area.name} area at high risk. Take necessary precautions.`,
            variant: "destructive",
          });
        });
      }
      
      setLastChecked(currentDate);
      return newAlerts;
    } catch (error) {
      console.error('Error generating weather alerts:', error);
      return [];
    }
  }, [weeklyForecast, latitude, longitude, toast]);

  // Function to identify high-risk disaster-prone areas based on current weather and user location
  const identifyHighRiskAreas = (currentWeather: Record<string, unknown>, lat?: number, lng?: number) => {
    const highRiskAreas: { name: string; currentRisk: string; historicalEvents: Record<string, unknown>[] }[] = [];
    
    // If we have user's location, check proximity to known disaster-prone areas
    if (lat && lng) {
      disasterProneAreas.forEach(area => {
        // Calculate rough distance to area (if area has coordinates)
        let isNearby = false;
        if (area.coordinates) {
          const distance = Math.sqrt(
            Math.pow((lat - area.coordinates.latitude) * 111, 2) + 
            Math.pow((lng - area.coordinates.longitude) * 111 * Math.cos(lat * Math.PI / 180), 2)
          );
          isNearby = distance <= 10; // Within 10km
        }
        
        // If nearby or we don't have coordinates (default to check all areas)
        if (!area.coordinates || isNearby) {
          // Check for flooding risk - more accurate threshold based on rainfall intensity
          if (area.risks.includes('flooding') && 
              ((Number(currentWeather.precipitation) > 20) || (Number(currentWeather.humidity) > 85 && Number(currentWeather.precipitation) > 10))) {
            const floodEvents = area.historicalEvents?.filter(event => 
              event.type.toLowerCase().includes('flood')
            ) || [];
            
            if (floodEvents.length > 0) {
              highRiskAreas.push({
                name: area.name,
                currentRisk: 'flooding',
                historicalEvents: floodEvents
              });
            }
          }
          
          // Check for landslide risk - more sophisticated detection using combined factors
          if (area.risks.includes('landslide') && 
              ((Number(currentWeather.precipitation) > 25) || 
               (Number(currentWeather.precipitation) > 15 && Number(currentWeather.humidity) > 80))) {
            const landslideEvents = area.historicalEvents?.filter(event => 
              event.type.toLowerCase().includes('landslide')
            ) || [];
            
            if (landslideEvents.length > 0) {
              highRiskAreas.push({
                name: area.name,
                currentRisk: 'landslide',
                historicalEvents: landslideEvents
              });
            }
          }
        }
      });
    }
    
    return highRiskAreas;
  };

  // Update alerts when needed with improved real-time detection
  const updateAlerts = useCallback(async () => {
    try {
      const newAlerts = await generateAlerts();
      
      // Filter out duplicates and add new alerts
      setAlerts(prevAlerts => {
        // Keep alerts that are less than 2 hours old
        const validOldAlerts = prevAlerts.filter(alert => {
          if (!alert.date) return false;
          const alertDate = new Date(alert.date);
          const now = new Date();
          return (now.getTime() - alertDate.getTime()) < 2 * 60 * 60 * 1000; // 2 hours
        });
        
        // Filter out duplicates based on type and title
        const uniqueNewAlerts = newAlerts.filter(newAlert => 
          !validOldAlerts.some(existingAlert => 
            existingAlert.type === newAlert.type && 
            existingAlert.title === newAlert.title
          )
        );
        
        return [...uniqueNewAlerts, ...validOldAlerts];
      });
    } catch (error) {
      console.error('Error updating alerts:', error);
    }
  }, [generateAlerts]);

  // Listen for realtime alerts from other sources (e.g. Supabase)
  useEffect(() => {
    const channel = supabase
      .channel('disaster_alerts')
      .on('broadcast', { event: 'new_alert' }, (payload) => {
        try {
          const newAlert = payload.payload as Alert;
          console.log('Received realtime alert:', newAlert);
          
          // Check if the alert is relevant to the user's location
          let isRelevant = true;
          if (latitude && longitude && newAlert.coordinates) {
            const alertLat = newAlert.coordinates.latitude;
            const alertLng = newAlert.coordinates.longitude;
            
            // Calculate distance
            const distance = Math.sqrt(
              Math.pow((latitude - alertLat) * 111, 2) + 
              Math.pow((longitude - alertLng) * 111 * Math.cos(latitude * Math.PI / 180), 2)
            );
            
            isRelevant = distance <= 15; // Within 15km
          }
          
          if (isRelevant) {
            setAlerts(prev => [newAlert, ...prev]);
            
            // Show toast for high severity alerts
            if (newAlert.severity === 'high') {
              toast({
                title: `⚠️ ${newAlert.title}`,
                description: newAlert.description,
                variant: "destructive",
              });
            }
          }
        } catch (error) {
          console.error('Error processing realtime alert:', error);
        }
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [latitude, longitude, toast]);

  // Check for alerts on component mount and when weather data changes
  useEffect(() => {
    updateAlerts();
    
    // Set up interval to check every 3 minutes - more frequent for timely updates
    const intervalId = setInterval(updateAlerts, 3 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, [updateAlerts]);

  // Clear alert by ID
  const dismissAlert = (alertId: string) => {
    setAlerts(prevAlerts => prevAlerts.filter(alert => alert.id !== alertId));
  };

  // Clear all alerts
  const dismissAllAlerts = () => {
    setAlerts([]);
  };

  return {
    alerts,
    dismissAlert,
    dismissAllAlerts,
    lastChecked,
    updateAlerts
  };
};
