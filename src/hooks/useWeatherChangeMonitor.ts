import { useEffect, useRef, useCallback } from 'react';
import { useWeather } from '@/contexts/WeatherContext';
import { supabase } from '@/integrations/supabase/client';
import { sendWeatherAdvisoryNotification } from '@/services/pushNotificationService';

interface WeatherState {
  temperature: number;
  conditions: string;
  rainProbability: number;
  timestamp: number;
}

const STORAGE_KEY = 'ecoalert_last_weather_state';
const CHECK_INTERVAL = 10 * 60 * 1000; // 10 minutes

// Thresholds for significant changes
const THRESHOLDS = {
  temperatureDrop: 5, // °C drop triggers alert
  temperatureRise: 5, // °C rise triggers alert
  rainProbabilityIncrease: 40, // % increase triggers alert
  stormKeywords: ['storm', 'thunder', 'lightning', 'heavy rain', 'severe'],
};

export const useWeatherChangeMonitor = () => {
  const { currentWeather, weeklyForecast } = useWeather();
  const lastCheckRef = useRef<number>(0);
  const isCheckingRef = useRef<boolean>(false);

  const getLastWeatherState = useCallback((): WeatherState | null => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('[WeatherChangeMonitor] Error reading stored state:', error);
    }
    return null;
  }, []);

  const saveWeatherState = useCallback((state: WeatherState) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('[WeatherChangeMonitor] Error saving state:', error);
    }
  }, []);

  const sendPushNotification = useCallback(async (
    title: string, 
    description: string, 
    severity: 'high' | 'medium' | 'low'
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.id) {
        await sendWeatherAdvisoryNotification(user.id, title, description, severity);
        console.info('[WeatherChangeMonitor] Push notification sent:', title);
      }
    } catch (error) {
      console.error('[WeatherChangeMonitor] Error sending notification:', error);
    }
  }, []);

  const checkForSignificantChanges = useCallback(async () => {
    if (isCheckingRef.current) return;
    if (!currentWeather?.current) return;

    const now = Date.now();
    if (now - lastCheckRef.current < CHECK_INTERVAL) return;

    isCheckingRef.current = true;
    lastCheckRef.current = now;

    try {
      const currentState: WeatherState = {
        temperature: currentWeather.current.temperature,
        conditions: currentWeather.current.conditions || '',
        rainProbability: weeklyForecast[0]?.precipChance || 0,
        timestamp: now,
      };

      const lastState = getLastWeatherState();

      if (lastState) {
        const tempDiff = currentState.temperature - lastState.temperature;
        const rainDiff = currentState.rainProbability - lastState.rainProbability;
        const conditionsLower = currentState.conditions.toLowerCase();
        const lastConditionsLower = lastState.conditions.toLowerCase();

        // Check for storm conditions
        const isStormNow = THRESHOLDS.stormKeywords.some(kw => conditionsLower.includes(kw));
        const wasStormBefore = THRESHOLDS.stormKeywords.some(kw => lastConditionsLower.includes(kw));

        if (isStormNow && !wasStormBefore) {
          await sendPushNotification(
            '⚡ Storm Alert',
            `Storm conditions detected: ${currentState.conditions}. Seek shelter and stay safe.`,
            'high'
          );
        }

        // Check for significant temperature drop
        if (tempDiff <= -THRESHOLDS.temperatureDrop) {
          await sendPushNotification(
            '🌡️ Temperature Drop Alert',
            `Temperature dropped ${Math.abs(tempDiff).toFixed(1)}°C (now ${currentState.temperature.toFixed(1)}°C). Dress warmly.`,
            'medium'
          );
        }

        // Check for significant temperature rise
        if (tempDiff >= THRESHOLDS.temperatureRise) {
          await sendPushNotification(
            '🔥 Heat Alert',
            `Temperature increased ${tempDiff.toFixed(1)}°C (now ${currentState.temperature.toFixed(1)}°C). Stay hydrated.`,
            'medium'
          );
        }

        // Check for significant rain probability increase
        if (rainDiff >= THRESHOLDS.rainProbabilityIncrease) {
          await sendPushNotification(
            '🌧️ Rain Alert',
            `Rain probability increased to ${currentState.rainProbability}%. Bring umbrella and prepare for wet conditions.`,
            'medium'
          );
        }

        // Check for transition to rainy conditions
        if (
          (conditionsLower.includes('rain') || conditionsLower.includes('drizzle')) &&
          !lastConditionsLower.includes('rain') &&
          !lastConditionsLower.includes('drizzle')
        ) {
          await sendPushNotification(
            '☔ Rain Starting',
            `Weather changing to: ${currentState.conditions}. Consider bringing rain gear.`,
            'low'
          );
        }
      }

      // Save current state for next comparison
      saveWeatherState(currentState);
    } catch (error) {
      console.error('[WeatherChangeMonitor] Error checking weather changes:', error);
    } finally {
      isCheckingRef.current = false;
    }
  }, [currentWeather, weeklyForecast, getLastWeatherState, saveWeatherState, sendPushNotification]);

  useEffect(() => {
    // Initial check
    checkForSignificantChanges();

    // Set up interval for periodic checks
    const intervalId = setInterval(checkForSignificantChanges, CHECK_INTERVAL);

    return () => clearInterval(intervalId);
  }, [checkForSignificantChanges]);

  return { checkForSignificantChanges };
};
