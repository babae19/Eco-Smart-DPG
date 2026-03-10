
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(false)
  const [screenWidth, setScreenWidth] = React.useState<number>(0)

  React.useEffect(() => {
    if (typeof window === 'undefined') return
    
    // Initial check
    const checkMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
      setScreenWidth(window.innerWidth)
    }
    
    // Run initial check
    checkMobile()
    
    // Debounced resize handler
    let resizeTimer: number | null = null
    const handleResize = () => {
      if (resizeTimer) window.clearTimeout(resizeTimer)
      resizeTimer = window.setTimeout(checkMobile, 100)
    }
    
    // Add event listener with debounce
    window.addEventListener("resize", handleResize)
    
    return () => {
      window.removeEventListener("resize", handleResize)
      if (resizeTimer) window.clearTimeout(resizeTimer)
    }
  }, [])

  // Return an object that behaves like a boolean in boolean contexts
  // but also has the properties isMobile and screenWidth
  return {
    isMobile,
    screenWidth,
    valueOf: () => isMobile,
    toString: () => String(isMobile)
  } as unknown as boolean & {
    isMobile: boolean;
    screenWidth: number;
  };
}
