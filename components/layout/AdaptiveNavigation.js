'use client'

import { useState, useEffect, useCallback } from 'react'
import SidebarNavigation from './SidebarNavigation'
import BottomNavigation from './BottomNavigation'

export default function AdaptiveNavigation({ children }) {
  const [isLandscape, setIsLandscape] = useState(false)
  const [isTablet, setIsTablet] = useState(false)
  const [isClient, setIsClient] = useState(false)

  const checkOrientation = useCallback(() => {
    if (typeof window === 'undefined') return
    
    // Check if device is in landscape mode
    const landscape = window.matchMedia('(orientation: landscape)').matches
    // Check if device is tablet size (768px+)
    const tablet = window.matchMedia('(min-width: 768px)').matches
    
    setIsLandscape(landscape)
    setIsTablet(tablet)
  }, [])

  useEffect(() => {
    setIsClient(true)
    checkOrientation()
  }, [checkOrientation])

  useEffect(() => {
    if (!isClient) return

    // Listen for orientation and resize changes
    const orientationQuery = window.matchMedia('(orientation: landscape)')
    const tabletQuery = window.matchMedia('(min-width: 768px)')
    
    const handleOrientationChange = () => checkOrientation()
    const handleTabletChange = () => checkOrientation()
    
    orientationQuery.addEventListener('change', handleOrientationChange)
    tabletQuery.addEventListener('change', handleTabletChange)

    return () => {
      orientationQuery.removeEventListener('change', handleOrientationChange)
      tabletQuery.removeEventListener('change', handleTabletChange)
    }
  }, [isClient, checkOrientation])

  // Prevent hydration mismatch by not rendering navigation until client-side
  if (!isClient) {
    return <div className="min-h-screen">{children}</div>
  }

  // Use sidebar navigation for tablet in landscape mode
  if (isTablet && isLandscape) {
    return <SidebarNavigation>{children}</SidebarNavigation>
  }

  // Use bottom navigation for portrait mode or mobile
  return <BottomNavigation>{children}</BottomNavigation>
}