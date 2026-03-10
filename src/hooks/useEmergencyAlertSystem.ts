/**
 * Emergency Alert System (WEA-style)
 * Triggers device-level alarm notifications when:
 * - Rain probability ≥ 80%
 * - AI risk score ≥ 80%
 * 
 * Uses the Web Notification API with vibration patterns and
 * persistent notifications to mimic US Wireless Emergency Alerts.
 */

import { useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface EmergencyAlertConfig {
  rainProbability?: number;
  aiRiskScore?: number;
  weatherData?: {
    current?: {
      precipitation?: number;
      temperature?: number;
      humidity?: number;
      conditions?: string;
    };
    forecast?: Array<{
      precipitation?: number;
      condition?: string;
      date?: string;
    }>;
  } | null;
  enabled?: boolean;
}

// Aggressive vibration pattern for emergency (like WEA)
const EMERGENCY_VIBRATION = [
  500, 200, 500, 200, 500, 200, 500, 200, 500, // Strong pulsing
  1000, // pause
  500, 200, 500, 200, 500, // Second burst
];

const HIGH_ALERT_VIBRATION = [300, 150, 300, 150, 300, 150, 300];

// Audio alert using Web Audio API
const playEmergencyTone = (severity: 'critical' | 'high') => {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    if (severity === 'critical') {
      // WEA-style two-tone alert
      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(853, ctx.currentTime);
      oscillator.frequency.setValueAtTime(960, ctx.currentTime + 0.25);
      oscillator.frequency.setValueAtTime(853, ctx.currentTime + 0.5);
      oscillator.frequency.setValueAtTime(960, ctx.currentTime + 0.75);
      oscillator.frequency.setValueAtTime(853, ctx.currentTime + 1.0);
      oscillator.frequency.setValueAtTime(960, ctx.currentTime + 1.25);
      gainNode.gain.setValueAtTime(0.3, ctx.currentTime);
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 1.5);
    } else {
      // High alert tone
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(800, ctx.currentTime);
      oscillator.frequency.setValueAtTime(600, ctx.currentTime + 0.3);
      oscillator.frequency.setValueAtTime(800, ctx.currentTime + 0.6);
      gainNode.gain.setValueAtTime(0.2, ctx.currentTime);
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.9);
    }

    // Clean up after sound finishes
    oscillator.onended = () => ctx.close();
  } catch (e) {
    console.warn('[EmergencyAlert] Audio playback failed:', e);
  }
};

const triggerDeviceVibration = (pattern: number[]) => {
  if ('vibrate' in navigator) {
    navigator.vibrate(pattern);
  }
};

const sendEmergencyNotification = (
  title: string,
  body: string,
  severity: 'critical' | 'high',
  tag: string
) => {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;

  try {
    const notification = new Notification(`🚨 EMERGENCY: ${title}`, {
      body,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: `emergency-${tag}`,
      requireInteraction: true, // Stay visible until user dismisses
      silent: false,
      data: {
        type: 'emergency',
        severity,
        timestamp: Date.now(),
      },
    });

    // Trigger device alarm
    triggerDeviceVibration(severity === 'critical' ? EMERGENCY_VIBRATION : HIGH_ALERT_VIBRATION);
    playEmergencyTone(severity);

    // Re-vibrate every 5 seconds for critical alerts (up to 3 times)
    if (severity === 'critical') {
      let count = 0;
      const interval = setInterval(() => {
        count++;
        if (count >= 3) {
          clearInterval(interval);
          return;
        }
        triggerDeviceVibration(HIGH_ALERT_VIBRATION);
      }, 5000);

      notification.onclose = () => clearInterval(interval);
    }

    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  } catch (e) {
    console.error('[EmergencyAlert] Failed to send notification:', e);
  }
};

export const useEmergencyAlertSystem = ({
  rainProbability = 0,
  aiRiskScore = 0,
  weatherData,
  enabled = true,
}: EmergencyAlertConfig) => {
  // Cooldown tracking: prevent repeated alerts within 30 minutes
  const lastAlertRef = useRef<Record<string, number>>({});
  const COOLDOWN_MS = 30 * 60 * 1000;

  const canAlert = useCallback((type: string) => {
    const now = Date.now();
    const last = lastAlertRef.current[type] || 0;
    if (now - last < COOLDOWN_MS) return false;
    lastAlertRef.current[type] = now;
    return true;
  }, []);

  // Request notification permission on mount
  useEffect(() => {
    if (!enabled) return;
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, [enabled]);

  // Monitor rain probability
  useEffect(() => {
    if (!enabled || !weatherData) return;

    // Check current precipitation
    const currentPrecip = weatherData.current?.precipitation || 0;
    
    // Check forecast for high rain probability
    const maxForecastRain = weatherData.forecast?.reduce(
      (max, day) => Math.max(max, day.precipitation || 0),
      0
    ) || 0;

    const effectiveRainProb = Math.max(currentPrecip, rainProbability, maxForecastRain);

    if (effectiveRainProb >= 80 && canAlert('rain_emergency')) {
      console.log(`[EmergencyAlert] 🌧️ Rain probability at ${effectiveRainProb}% - triggering emergency alert`);

      const severity = effectiveRainProb >= 90 ? 'critical' : 'high';
      sendEmergencyNotification(
        'Heavy Rain Warning',
        `⚠️ Rain probability is ${effectiveRainProb}%! Potential flooding risk. Move to higher ground if in a flood-prone area. Avoid low-lying roads and bridges.`,
        severity,
        'rain'
      );
    }
  }, [weatherData, rainProbability, enabled, canAlert]);

  // Monitor AI risk score
  useEffect(() => {
    if (!enabled) return;

    if (aiRiskScore >= 80 && canAlert('risk_emergency')) {
      console.log(`[EmergencyAlert] 🚨 AI Risk Score at ${aiRiskScore}% - triggering emergency alert`);

      const severity = aiRiskScore >= 90 ? 'critical' : 'high';
      sendEmergencyNotification(
        'Disaster Risk Alert',
        `🚨 AI analysis indicates ${aiRiskScore}% disaster risk in your area! Take immediate precautions. Follow evacuation orders from authorities. Move to designated safe zones.`,
        severity,
        'risk'
      );
    }
  }, [aiRiskScore, enabled, canAlert]);

  // Auto-request permission when user is authenticated
  useEffect(() => {
    if (!enabled) return;

    const requestPermissionForUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user && 'Notification' in window && Notification.permission === 'default') {
          await Notification.requestPermission();
        }
      } catch {
        // Silently fail
      }
    };

    requestPermissionForUser();
  }, [enabled]);

  return {
    isSupported: 'Notification' in window,
    permissionStatus: 'Notification' in window ? Notification.permission : 'denied' as NotificationPermission,
    triggerTestAlert: () => {
      sendEmergencyNotification(
        'Test Emergency Alert',
        'This is a test of the emergency alert system. No action needed.',
        'high',
        'test'
      );
    },
  };
};

export default useEmergencyAlertSystem;
