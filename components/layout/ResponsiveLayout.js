'use client'

import { useEffect, useState } from 'react'
import SimpleNavLayout from './SimpleNavLayout'

export default function ResponsiveLayout({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    // Check if user is authenticated by looking for session cookie
    const checkAuth = () => {
      try {
        // Check for session cookie
        const cookies = document.cookie.split(';')
        const sessionCookie = cookies.find(cookie => 
          cookie.trim().startsWith('catstock-session=')
        )
        
        if (sessionCookie) {
          setIsAuthenticated(true)
        } else {
          setIsAuthenticated(false)
        }
      } catch (error) {
        console.error('[ResponsiveLayout] Auth check error:', error)
        setIsAuthenticated(false)
      } finally {
        setLoading(false)
      }
    }
    
    checkAuth()
  }, [])
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }
  
  // If not authenticated, render children without navigation
  if (!isAuthenticated) {
    return <div className="min-h-screen bg-gray-50">{children}</div>
  }

  // Render with simple navigation for authenticated users
  return (
    <SimpleNavLayout>
      {children}
    </SimpleNavLayout>
  )
}