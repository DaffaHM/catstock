'use client'

import { useEffect } from 'react'
import { XIcon } from 'lucide-react'
import TouchButton from './TouchButton'

export default function Drawer({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  footer,
  width = 'w-96',
  className = ''
}) {
  // Prevent body scroll when drawer is open
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

  // Close drawer on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className={`fixed inset-y-0 right-0 ${width} bg-white shadow-xl border-l border-gray-200 z-50 flex flex-col transform transition-transform duration-300 ease-in-out ${className}`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {title}
          </h2>
          <TouchButton
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-2"
            aria-label="Close drawer"
          >
            <XIcon className="h-5 w-5" />
          </TouchButton>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="p-4 border-t border-gray-200">
            {footer}
          </div>
        )}
      </div>
    </>
  )
}