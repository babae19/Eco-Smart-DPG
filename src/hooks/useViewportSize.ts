
import { useState, useEffect } from 'react';

interface ViewportSize {
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isSmallMobile: boolean;
}

export function useViewportSize(): ViewportSize {
  const [size, setSize] = useState<ViewportSize>({
    width: window.innerWidth,
    height: window.innerHeight,
    isMobile: window.innerWidth < 640,
    isTablet: window.innerWidth >= 640 && window.innerWidth < 1024,
    isDesktop: window.innerWidth >= 1024,
    isSmallMobile: window.innerWidth < 375
  });
  
  useEffect(() => {
    let timeout: number | null = null;
    
    const handleResize = () => {
      if (timeout) window.clearTimeout(timeout);
      
      timeout = window.setTimeout(() => {
        const width = window.innerWidth;
        setSize({
          width,
          height: window.innerHeight,
          isMobile: width < 640,
          isTablet: width >= 640 && width < 1024,
          isDesktop: width >= 1024,
          isSmallMobile: width < 375
        });
      }, 100);
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      if (timeout) window.clearTimeout(timeout);
    };
  }, []);
  
  return size;
}
