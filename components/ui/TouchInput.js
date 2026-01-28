'use client'

import { forwardRef } from 'react'

const TouchInput = forwardRef(({ 
  label, 
  error, 
  required = false,
  multiline = false,
  rows = 3,
  className = '',
  ...props 
}, ref) => {
  const Component = multiline ? 'textarea' : 'input'
  
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-base font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <Component
        ref={ref}
        rows={multiline ? rows : undefined}
        className={`w-full px-4 text-base border rounded-lg transition-colors touch-manipulation focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none ${
          multiline ? 'py-3 min-h-[3rem]' : 'h-12'
        } ${
          error 
            ? 'border-red-500 focus:ring-red-500' 
            : 'border-gray-300'
        } ${className}`}
        {...props}
      />
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}
    </div>
  )
})

TouchInput.displayName = 'TouchInput'

export default TouchInput