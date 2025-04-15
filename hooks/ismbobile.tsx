"use client"

import { useEffect, useState } from "react"

/**
 * Hook to detect if the current viewport is mobile sized
 * @param breakpoint - The width threshold in pixels to consider as mobile (default: 768)
 * @returns boolean indicating if the viewport is mobile sized
 */
export function useIsMobile (breakpoint = 768) {
  const [useIsMobile , setIsMobile] = useState(false)

  useEffect(() => {
    // Check if window is defined (to avoid SSR issues)
    if (typeof window === "undefined") return

    // Initial check
    const checkMobile = () => {
      setIsMobile(window.innerWidth < breakpoint)
    }

    // Run on mount
    checkMobile()

    // Add event listener for resize
    window.addEventListener("resize", checkMobile)

    // Cleanup
    return () => {
      window.removeEventListener("resize", checkMobile)
    }
  }, [breakpoint])

  return useIsMobile 
}
 

