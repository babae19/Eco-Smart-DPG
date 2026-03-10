
import { useState, useEffect } from 'react';

interface MobileHookResult {
  isMobile: boolean;
}

export const useIsMobile = (): MobileHookResult => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkDevice = () => {
      const userAgent = navigator.userAgent.toLowerCase();
      const mobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
      setIsMobile(mobile);
    };

    checkDevice();
    
    // Listen for orientation changes
    window.addEventListener('orientationchange', checkDevice);
    window.addEventListener('resize', checkDevice);

    return () => {
      window.removeEventListener('orientationchange', checkDevice);
      window.removeEventListener('resize', checkDevice);
    };
  }, []);

  return { isMobile };
};
