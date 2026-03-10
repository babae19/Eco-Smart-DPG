
import { useState, useEffect, useCallback } from 'react';

interface GPSPermissions {
  hasPermission: boolean;
  permissionState: 'granted' | 'denied' | 'prompt' | 'checking' | 'unknown';
  canRequestPermission: boolean;
  isMobile: boolean;
  requestPermission: () => Promise<boolean>;
  openLocationSettings: () => void;
}

export const useGPSPermissions = (): GPSPermissions => {
  const [permissionState, setPermissionState] = useState<'granted' | 'denied' | 'prompt' | 'checking' | 'unknown'>('unknown');
  const [hasPermission, setHasPermission] = useState(false);
  
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  const checkPermissions = useCallback(async () => {
    if (!('geolocation' in navigator)) {
      setPermissionState('denied');
      setHasPermission(false);
      return;
    }

    try {
      if ('permissions' in navigator) {
        setPermissionState('checking');
        const permission = await navigator.permissions.query({ name: 'geolocation' });
        console.log('[GPS Permissions] Permission state:', permission.state);
        
        setPermissionState(permission.state as any);
        setHasPermission(permission.state === 'granted');
        
        // Listen for permission changes
        permission.addEventListener('change', () => {
          setPermissionState(permission.state as any);
          setHasPermission(permission.state === 'granted');
        });
      } else {
        // Fallback for browsers without permissions API
        setPermissionState('prompt');
        setHasPermission(false);
      }
    } catch (error) {
      console.error('[GPS Permissions] Error checking permissions:', error);
      setPermissionState('unknown');
      setHasPermission(false);
    }
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    return new Promise((resolve) => {
      console.log('[GPS Permissions] Requesting location permission...');
      
      navigator.geolocation.getCurrentPosition(
        () => {
          console.log('[GPS Permissions] Permission granted');
          setPermissionState('granted');
          setHasPermission(true);
          resolve(true);
        },
        (error) => {
          console.error('[GPS Permissions] Permission denied:', error);
          setPermissionState('denied');
          setHasPermission(false);
          resolve(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });
  }, []);

  const openLocationSettings = useCallback(() => {
    if (isMobile) {
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isAndroid = /Android/.test(navigator.userAgent);
      
      if (isIOS) {
        alert('To enable location:\n\n1. Go to Settings → Privacy & Security → Location Services\n2. Turn on Location Services\n3. Find Safari and set to "While Using App"\n4. Refresh this page');
      } else if (isAndroid) {
        alert('To enable location:\n\n1. Go to Settings → Apps → Browser\n2. Tap Permissions → Location\n3. Select "Allow only while using the app"\n4. Refresh this page');
      } else {
        alert('Please enable location access in your device settings and refresh the page.');
      }
    } else {
      alert('To enable location:\n\n1. Click the location icon in your address bar\n2. Select "Allow"\n3. Refresh the page if needed');
    }
  }, [isMobile]);

  useEffect(() => {
    checkPermissions();
  }, [checkPermissions]);

  return {
    hasPermission,
    permissionState,
    canRequestPermission: permissionState === 'prompt' || permissionState === 'unknown',
    isMobile,
    requestPermission,
    openLocationSettings
  };
};
