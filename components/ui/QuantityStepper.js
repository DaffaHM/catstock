'use client'

import { MinusIcon, PlusIcon } from 'lucide-react'

export default function QuantityStepper({ 
  value = 0, 
  onChange, 
  min = 0, 
  max = 9999,
  step = 1,
  disabled = false,
  className = ''
}) {
  const handleDecrement = () => {
    const newValue = Math.max(min, value - step)
    onChange(newValue)
  }

  const handleIncrement = () => {
    const newValue = Math.min(max, value + step)
    onChange(newValue)
  }

  const handleInputChange = (e) => {
    const newValue = parseInt(e.target.value) || 0
    const clampedValue = Math.max(min, Math.min(max, newValue))
    onChange(clampedValue)
  }

  return (
    <div className={`flex items-center border border-gray-300 rounded-lg overflow-hidden ${className}`}>
      <button
        type="button"
        onClick={handleDecrement}
        disabled={disabled || value <= min}
        className="w-12 h-12 flex items-center justify-center text-lg font-medium bg-gray-50 hover:bg-gray-100 active:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-manipulation"
        aria-label="Decrease quantity"
      >
        <MinusIcon className="h-4 w-4" />
      </button>
      
      <input
        type="number"
        value={value}
        onChange={handleInputChange}
        min={min}
        max={max}
        disabled={disabled}
        className="flex-1 h-12 text-center text-base border-0 focus:ring-0 focus:outline-none bg-white disabled:bg-gray-50"
      />
      
      <button
        type="button"
        onClick={handleIncrement}
        disabled={disabled || value >= max}
        className="w-12 h-12 flex items-center justify-center text-lg font-medium bg-gray-50 hover:bg-gray-100 active:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors touch-manipulation"
        aria-label="Increase quantity"
      >
        <PlusIcon className="h-4 w-4" />
      </button>
    </div>
  )
}