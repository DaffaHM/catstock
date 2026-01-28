'use client'

import { useState, useRef } from 'react'
import { CalendarIcon } from 'lucide-react'

export default function DatePicker({
  value,
  onChange,
  label,
  placeholder = 'Select date',
  disabled = false,
  required = false,
  error = null,
  min = null,
  max = null,
  className = ''
}) {
  const inputRef = useRef(null)

  // Format date for display (MM/DD/YYYY)
  const formatDisplayDate = (date) => {
    if (!date) return ''
    const d = new Date(date)
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  }

  // Format date for input value (YYYY-MM-DD)
  const formatInputDate = (date) => {
    if (!date) return ''
    const d = new Date(date)
    return d.toISOString().split('T')[0]
  }

  // Handle date change
  const handleDateChange = (e) => {
    const dateValue = e.target.value
    if (dateValue) {
      const date = new Date(dateValue + 'T00:00:00')
      onChange(date)
    } else {
      onChange(null)
    }
  }

  // Handle input click to open date picker
  const handleInputClick = () => {
    if (!disabled && inputRef.current) {
      inputRef.current.showPicker?.()
    }
  }

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {/* Hidden native date input */}
        <input
          ref={inputRef}
          type="date"
          value={formatInputDate(value)}
          onChange={handleDateChange}
          disabled={disabled}
          required={required}
          min={min ? formatInputDate(min) : undefined}
          max={max ? formatInputDate(max) : undefined}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
        />
        
        {/* Styled display input */}
        <div
          onClick={handleInputClick}
          className={`relative w-full h-12 px-3 text-base border rounded-lg cursor-pointer touch-manipulation flex items-center justify-between ${
            disabled 
              ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
              : 'bg-white hover:border-gray-400'
          } ${
            error 
              ? 'border-red-300 focus-within:ring-red-500' 
              : 'border-gray-300 focus-within:ring-primary-500'
          } focus-within:outline-none focus-within:ring-2 focus-within:border-transparent`}
        >
          <span className={value ? 'text-gray-900' : 'text-gray-500'}>
            {value ? formatDisplayDate(value) : placeholder}
          </span>
          
          <CalendarIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
        </div>
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}