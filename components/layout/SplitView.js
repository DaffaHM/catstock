'use client'

import { useState, useEffect, useCallback } from 'react'

export default function SplitView({ 
  masterContent, 
  detailContent, 
  masterWidth = '40%',
  showDetail = true,
  onDetailToggle,
  rightDrawer = null,
  rightDrawerWidth = '384px', // 24rem in pixels
  className = '',
  masterClassName = '',
  detailClassName = ''
}) {
  const [isLandscape, setIsLandscape] = useState(false)
  const [isTablet, setIsTablet] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const checkLayout = useCallback(() => {
    if (typeof window === 'undefined') return
    
    const landscape = window.matchMedia('(orientation: landscape)').matches
    const tablet = window.matchMedia('(min-width: 768px)').matches
    
    setIsLandscape(landscape)
    setIsTablet(tablet)
  }, [])

  useEffect(() => {
    if (!mounted) return

    checkLayout()

    const orientationQuery = window.matchMedia('(orientation: landscape)')
    const tabletQuery = window.matchMedia('(min-width: 768px)')
    
    const handleOrientationChange = () => {
      // Small delay to ensure layout has updated
      setTimeout(checkLayout, 100)
    }
    
    orientationQuery.addEventListener('change', handleOrientationChange)
    tabletQuery.addEventListener('change', checkLayout)

    return () => {
      orientationQuery.removeEventListener('change', handleOrientationChange)
      tabletQuery.removeEventListener('change', checkLayout)
    }
  }, [mounted, checkLayout])

  // Use split view only on tablet in landscape mode
  const useSplitView = mounted && isTablet && isLandscape

  // Handle detail toggle for responsive behavior
  const handleDetailToggle = useCallback(() => {
    if (onDetailToggle) {
      onDetailToggle(!showDetail)
    }
  }, [onDetailToggle, showDetail])

  if (!mounted) {
    // Prevent hydration mismatch by showing loading state
    return (
      <div className={`h-full ${className}`}>
        <div className="animate-pulse bg-gray-100 h-full" />
      </div>
    )
  }

  if (!useSplitView) {
    // On portrait or mobile, show either master or detail
    return (
      <div className={`h-full relative ${className}`}>
        <div className="h-full">
          {showDetail ? detailContent : masterContent}
        </div>
        
        {/* Right drawer for mobile/portrait mode */}
        {rightDrawer && (
          <div className="absolute inset-0 pointer-events-none">
            {rightDrawer}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={`flex h-full relative ${className}`}>
      {/* Master Panel */}
      <div 
        className={`border-r border-gray-200 bg-gray-50 overflow-y-auto flex-shrink-0 ${masterClassName}`}
        style={{ width: masterWidth }}
      >
        {masterContent}
      </div>

      {/* Detail Panel */}
      <div 
        className={`flex-1 bg-white overflow-y-auto ${detailClassName}`}
        style={{ 
          marginRight: rightDrawer ? rightDrawerWidth : '0'
        }}
      >
        {detailContent}
      </div>

      {/* Right Drawer Panel - Fixed position in landscape mode */}
      {rightDrawer && (
        <div 
          className="absolute top-0 right-0 h-full border-l border-gray-200 bg-white shadow-lg z-10"
          style={{ width: rightDrawerWidth }}
        >
          {rightDrawer}
        </div>
      )}
    </div>
  )
}