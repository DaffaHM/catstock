'use client'

export default function Logo({ size = 'md', variant = 'full', className = '' }) {
  const sizes = {
    sm: { container: 'h-8', text: 'text-lg', icon: 'w-6 h-6' },
    md: { container: 'h-10', text: 'text-xl', icon: 'w-8 h-8' },
    lg: { container: 'h-12', text: 'text-2xl', icon: 'w-10 h-10' },
    xl: { container: 'h-16', text: 'text-3xl', icon: 'w-12 h-12' }
  }

  const currentSize = sizes[size]

  const LogoIcon = () => (
    <div className={`${currentSize.icon} bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg`}>
      <svg 
        viewBox="0 0 24 24" 
        fill="none" 
        className="w-3/4 h-3/4 text-white"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Paint brush icon with modern styling */}
        <path 
          d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z" 
          fill="currentColor"
          opacity="0.8"
        />
        <path 
          d="M12 16V22C12 22 14 20 16 18C18 16 16 14 16 14L12 16Z" 
          fill="currentColor"
        />
        <circle cx="12" cy="9" r="1.5" fill="white" opacity="0.9" />
      </svg>
    </div>
  )

  if (variant === 'icon') {
    return (
      <div className={`flex items-center ${className}`}>
        <LogoIcon />
      </div>
    )
  }

  return (
    <div className={`flex items-center space-x-3 ${currentSize.container} ${className}`}>
      <LogoIcon />
      {variant === 'full' && (
        <div className="flex flex-col">
          <span className={`font-bold ${currentSize.text} bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent leading-tight`}>
            CatStock
          </span>
          <span className="text-xs text-gray-500 -mt-1">
            Inventory Pro
          </span>
        </div>
      )}
    </div>
  )
}

// Alternative compact logo for mobile/small spaces
export function CompactLogo({ className = '' }) {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
        <span className="text-white font-bold text-sm">C</span>
      </div>
      <span className="font-semibold text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        CatStock
      </span>
    </div>
  )
}