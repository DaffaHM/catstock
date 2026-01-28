'use client'

import { useState, useEffect } from 'react'
import SidebarNavigation from './SidebarNavigation'
import BottomNavigation from './BottomNavigation'

export default function StableLayout({ children }) {
  const [mounted, setMounted] = useState(false)
  const [useDesktop, setUseDesktop] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    // Simple desktop detection
    const checkDesktop = () => {
      const isDesktop = window.innerWidth >= 1024
      setUseDesktop(isDesktop)
    }
    
    checkDesktop()
    window.addEventListener('resize', checkDesktop)
    
    return () => window.removeEventListener('resize', checkDesktop)
  }, [])

  // Prevent hydration issues
  if (!mounted) {
    return <div className="min-h-screen bg-gray-50">{children}</div>
  }

  // Use sidebar for desktop, bottom nav for mobile/tablet
  if (useDesktop) {
    return <SidebarNavigation>{children}</SidebarNavigation>
  }

  return <BottomNavigation>{children}</BottomNavigation>
}