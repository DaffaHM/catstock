'use client'

import { useState, useEffect } from 'react'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import TouchButton from './TouchButton'

export default function SplitViewDrawer({
  children,
  isOpen = true,
  onToggle,
  title,
  width = '384px', // 24rem
  position = 'right', // 'left' or 'right'
  collapsible = true,
  className = '',
  headerClassName = '',
  contentClassName = ''
}) {
  const [isLandscape, setIsLandscape] = useState(false)
  const [isTablet, setIsTablet] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const checkLayout = () => {
      const landscape = window.matchMedia('(orientation: landscape)').matches
      const tablet = window.matchMedia('(min-width: 768px)').matches
      
      setIsLandscape(landscape)
      setIsTablet(tablet)
    }

    checkLayout()

    const orientationQuery = window.matchMedia('(orientation: landscape)')
    const tabletQuery = window.matchMedia('(min-width: 768px)')
    
    orientationQuery.addEventListener('change', checkLayout)
    tabletQuery.addEventListener('change', checkLayout)

    return () => {
      orientationQuery.removeEventListener('change', checkLayout)
      tabletQuery.removeEventListener('change', checkLayout)
    }
  }, [mounted])

  // Use fixed drawer only on tablet in landscape mode
  const useFixedDrawer = mounted && isTablet && isLandscape

  if (!mounted) {
    return null
  }

  if (!useFixedDrawer) {
    // On mobile/portrait, render as overlay drawer
    return (
      <OverlayDrawer
        isOpen={isOpen}
        onToggle={onToggle}
        title={title}
        width={width}
        position={position}
        className={className}
        headerClassName={headerClassName}
        contentClassName={contentClassName}
      >
        {children}
      </OverlayDrawer>
    )
  }

  // Fixed drawer for landscape tablet mode
  const positionClasses = position === 'left' 
    ? 'left-0 border-r' 
    : 'right-0 border-l'

  return (
    <div 
      className={`fixed top-0 ${positionClasses} h-full bg-white border-gray-200 shadow-lg z-20 transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : position === 'left' ? '-translate-x-full' : 'translate-x-full'
      } ${className}`}
      style={{ width: isOpen ? width : '0' }}
    >
      {/* Collapse/Expand Button */}
      {collapsible && (
        <div className={`absolute top-4 ${position === 'left' ? '-right-12' : '-left-12'} z-30`}>
          <TouchButton
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className="bg-white border border-gray-200 shadow-md hover:bg-gray-50"
            aria-label={isOpen ? 'Collapse drawer' : 'Expand drawer'}
          >
            {position === 'left' ? (
              isOpen ? <ChevronLeftIcon className="h-4 w-4" /> : <ChevronRightIcon className="h-4 w-4" />
            ) : (
              isOpen ? <ChevronRightIcon className="h-4 w-4" /> : <ChevronLeftIcon className="h-4 w-4" />
            )}
          </TouchButton>
        </div>
      )}

      {/* Drawer Content */}
      {isOpen && (
        <div className="h-full flex flex-col">
          {/* Header */}
          {title && (
            <div className={`p-4 border-b border-gray-200 flex-shrink-0 ${headerClassName}`}>
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            </div>
          )}

          {/* Content */}
          <div className={`flex-1 overflow-hidden ${contentClassName}`}>
            {children}
          </div>
        </div>
      )}
    </div>
  )
}

// Overlay drawer for mobile/portrait mode
function OverlayDrawer({
  children,
  isOpen,
  onToggle,
  title,
  width,
  position,
  className,
  headerClassName,
  contentClassName
}) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen && onToggle) {
        onToggle()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onToggle])

  if (!isOpen) return null

  const slideDirection = position === 'left' ? 'left-0' : 'right-0'
  const transformDirection = position === 'left' 
    ? 'translate-x-0' 
    : 'translate-x-0'

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onToggle}
      />

      {/* Drawer */}
      <div 
        className={`fixed inset-y-0 ${slideDirection} bg-white shadow-xl border-gray-200 z-50 flex flex-col transform transition-transform duration-300 ease-in-out ${transformDirection} ${
          position === 'left' ? 'border-r' : 'border-l'
        } ${className}`}
        style={{ width }}
      >
        {/* Header */}
        {title && (
          <div className={`p-4 border-b border-gray-200 flex-shrink-0 ${headerClassName}`}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              <TouchButton
                variant="ghost"
                size="sm"
                onClick={onToggle}
                className="text-gray-500 hover:text-gray-700"
                aria-label="Close drawer"
              >
                <ChevronRightIcon className="h-5 w-5" />
              </TouchButton>
            </div>
          </div>
        )}

        {/* Content */}
        <div className={`flex-1 overflow-hidden ${contentClassName}`}>
          {children}
        </div>
      </div>
    </>
  )
}