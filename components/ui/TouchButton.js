'use client'

import { forwardRef } from 'react'

const TouchButton = forwardRef(({ 
  children,
  variant = 'primary',
  size = 'default',
  disabled = false,
  className = '',
  ...props 
}, ref) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 ease-in-out min-h-[44px] min-w-[44px] touch-manipulation active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100'
  
  const variants = {
    primary: 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500',
    secondary: 'bg-secondary-100 text-secondary-900 hover:bg-secondary-200 focus:ring-secondary-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-primary-500',
    ghost: 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:ring-primary-500'
  }
  
  const sizes = {
    sm: 'px-3 py-2 text-sm',
    default: 'px-4 py-3 text-base',
    lg: 'px-6 py-4 text-lg'
  }

  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`

  return (
    <button
      ref={ref}
      className={classes}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
})

TouchButton.displayName = 'TouchButton'

export default TouchButton