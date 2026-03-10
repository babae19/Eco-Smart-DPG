import { useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  sendWeatherAdvisoryNotification,
  isPushNotificationSupported,
  getCurrentPermissionStatus
} from '@/services/pushNotificationService';

interface WeatherThresholds {
  temp_high_threshold: number;
  temp_low_threshold: number;
  rain_threshold: number;
  wind_threshold: number;
  humidity_threshold: number;
  weather_alerts: boolean;
  push_notifications: boolean;
}

interface WeatherData {
  current?: {
    temperature: number;
    humidity: number;
    windSpeed: number;
    precipitation?: number;
    conditions?: string;
  };
}

const defaultThresholds: WeatherThresholds = {
  temp_high_threshold: 35,
  temp_low_threshold: 15,
  rain_threshold: 70,
  wind_threshold: 40,
  humidity_threshold: 90,
  weather_alerts: true,
  push_notifications: true
};

export const useWeatherAlertMonitor = (weatherData: WeatherData | null) => {
  const lastAlertRef = useRef<Record<string, number>>({});
  const thresholdsRef = useRef<WeatherThresholds>(defaultThresholds);
  const userIdRef = useRef<string | null>(null);

  // Load user preferences
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        userIdRef.current = user.id;

        const { data } = await supabase
          .from('user_notification_preferences')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (data) {
          thresholdsRef.current = {
            temp_high_threshold: data.temp_high_threshold ?? 35,
            temp_low_threshold: data.temp_low_threshold ?? 15,
            rain_threshold: data.rain_threshold ?? 70,
            wind_threshold: data.wind_threshold ?? 40,
            humidity_threshold: data.humidity_threshold ?? 90,
            weather_alerts: data.weather_alerts ?? true,
            push_notifications: data.push_notifications ?? true
          };
        }
      } catch (error) {
        console.error('[WeatherAlertMonitor] Error loading preferences:', error);
      }
    };

    loadPreferences();
  }, []);

  // Check if we should send an alert (rate limiting)
  const shouldSendAlert = useCallback((alertType: string): boolean => {
    const now = Date.now();
    const lastAlert = lastAlertRef.current[alertType] || 0;
    const cooldownMs = 30 * 60 * 1000; // 30 minutes cooldown

    if (now - lastAlert < cooldownMs) {
      return false;
    }

    lastAlertRef.current[alertType] = now;
    return true;
  }, []);

  // Monitor weather and send alerts
  useEffect(() => {
    if (!weatherData?.current) return;
    if (!isPushNotificationSupported()) return;
    if (getCurrentPermissionStatus() !== 'granted') return;
    if (!thresholdsRef.current.push_notifications) return;
    if (!thresholdsRef.current.weather_alerts) return;
    if (!userIdRef.current) return;

    const current = weatherData.current;
    const thresholds = thresholdsRef.current;
    const userId = userIdRef.current;

    // Check high temperature
    if (current.temperature >= thresholds.temp_high_threshold) {
      if (shouldSendAlert('high_temp')) {
        sendWeatherAdvisoryNotification(
          userId,
          '🌡️ High Temperature Alert',
          `Temperature is ${Math.round(current.temperature)}°C - above your ${thresholds.temp_high_threshold}°C threshold. Stay hydrated and seek shade.`,
          current.temperature >= 40 ? 'high' : 'medium'
        );
        console.log('[WeatherAlertMonitor] High temperature alert sent');
      }
    }

    // Check low temperature
    if (current.temperature <= thresholds.temp_low_threshold) {
      if (shouldSendAlert('low_temp')) {
        sendWeatherAdvisoryNotification(
          userId,
          '❄️ Low Temperature Alert',
          `Temperature is ${Math.round(current.temperature)}°C - below your ${thresholds.temp_low_threshold}°C threshold. Dress warmly.`,
          current.temperature <= 5 ? 'high' : 'medium'
        );
        console.log('[WeatherAlertMonitor] Low temperature alert sent');
      }
    }

    // Check high humidity
    if (current.humidity >= thresholds.humidity_threshold) {
      if (shouldSendAlert('humidity')) {
        sendWeatherAdvisoryNotification(
          userId,
          '💧 High Humidity Alert',
          `Humidity is ${current.humidity}% - above your ${thresholds.humidity_threshold}% threshold. Conditions may feel uncomfortable.`,
          current.humidity >= 95 ? 'high' : 'low'
        );
        console.log('[WeatherAlertMonitor] Humidity alert sent');
      }
    }

    // Check wind speed
    if (current.windSpeed >= thresholds.wind_threshold) {
      if (shouldSendAlert('wind')) {
        sendWeatherAdvisoryNotification(
          userId,
          '💨 Strong Wind Alert',
          `Wind speed is ${current.windSpeed} km/h - above your ${thresholds.wind_threshold} km/h threshold. Secure loose items.`,
          current.windSpeed >= 60 ? 'high' : 'medium'
        );
        console.log('[WeatherAlertMonitor] Wind alert sent');
      }
    }

    // Check rain probability
    if (current.precipitation && current.precipitation >= thresholds.rain_threshold) {
      if (shouldSendAlert('rain')) {
        sendWeatherAdvisoryNotification(
          userId,
          '🌧️ Rain Alert',
          `Rain probability is ${current.precipitation}% - above your ${thresholds.rain_threshold}% threshold. Carry an umbrella!`,
          current.precipitation >= 90 ? 'high' : 'medium'
        );
        console.log('[WeatherAlertMonitor] Rain alert sent');
      }
    }

  }, [weatherData, shouldSendAlert]);

  return null;
};

export default useWeatherAlertMonitor;
