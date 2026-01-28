'use client'

import { useState, useEffect, useRef } from 'react'
import { SearchIcon, XIcon, TruckIcon, ChevronDownIcon, PlusIcon } from 'lucide-react'
import TouchButton from './TouchButton'
import { searchSuppliersAction } from '@/lib/actions/suppliers'

export default function SupplierSelect({
  value,
  onSupplierSelect,
  onCreateNew,
  placeholder = 'Select supplier...',
  disabled = false,
  required = false,
  className = '',
  error = null
}) {
  const [query, setQuery] = useState('')
  const [suppliers, setSuppliers] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [selectedSupplier, setSelectedSupplier] = useState(null)
  
  const inputRef = useRef(null)
  const dropdownRef = useRef(null)
  const timeoutRef = useRef(null)

  // Set initial selected supplier if value is provided
  useEffect(() => {
    if (value && typeof value === 'object') {
      setSelectedSupplier(value)
      setQuery(value.name)
    } else if (value && typeof value === 'string') {
      // If only ID is provided, we might need to fetch the supplier details
      // For now, just clear the selection
      setSelectedSupplier(null)
      setQuery('')
    } else {
      setSelectedSupplier(null)
      setQuery('')
    }
  }, [value])

  // Debounced search
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    if (query.length < 2) {
      setSuppliers([])
      setIsOpen(false)
      return
    }

    // Don't search if we have a selected supplier and the query matches
    if (selectedSupplier && query === selectedSupplier.name) {
      setSuppliers([])
      setIsOpen(false)
      return
    }

    timeoutRef.current = setTimeout(async () => {
      setIsLoading(true)
      try {
        const result = await searchSuppliersAction(query)
        if (result.success) {
          setSuppliers(result.suppliers)
          setIsOpen(result.suppliers.length > 0)
          setSelectedIndex(-1)
        }
      } catch (error) {
        console.error('Supplier search error:', error)
        setSuppliers([])
        setIsOpen(false)
      } finally {
        setIsLoading(false)
      }
    }, 300)

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [query, selectedSupplier])

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen) return

    const totalOptions = suppliers.length + (onCreateNew ? 1 : 0)
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < totalOptions - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => prev > 0 ? prev - 1 : prev)
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0) {
          if (selectedIndex < suppliers.length) {
            handleSupplierSelect(suppliers[selectedIndex])
          } else if (onCreateNew) {
            handleCreateNew()
          }
        }
        break
      case 'Escape':
        setIsOpen(false)
        setSelectedIndex(-1)
        inputRef.current?.blur()
        break
    }
  }

  // Handle supplier selection
  const handleSupplierSelect = (supplier) => {
    setSelectedSupplier(supplier)
    setQuery(supplier.name)
    onSupplierSelect(supplier)
    setSuppliers([])
    setIsOpen(false)
    setSelectedIndex(-1)
    inputRef.current?.blur()
  }

  // Handle create new supplier
  const handleCreateNew = () => {
    if (onCreateNew) {
      onCreateNew(query)
    }
    setIsOpen(false)
    setSelectedIndex(-1)
  }

  // Handle input change
  const handleInputChange = (e) => {
    const newQuery = e.target.value
    setQuery(newQuery)
    
    // Clear selection if query doesn't match selected supplier
    if (selectedSupplier && newQuery !== selectedSupplier.name) {
      setSelectedSupplier(null)
      onSupplierSelect(null)
    }
  }

  // Handle input focus
  const handleInputFocus = () => {
    if (suppliers.length > 0 || (query.length >= 2 && !selectedSupplier)) {
      setIsOpen(true)
    }
  }

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target) &&
        !inputRef.current?.contains(event.target)
      ) {
        setIsOpen(false)
        setSelectedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Clear selection
  const handleClear = () => {
    setSelectedSupplier(null)
    setQuery('')
    setSuppliers([])
    setIsOpen(false)
    setSelectedIndex(-1)
    onSupplierSelect(null)
    inputRef.current?.focus()
  }

  // Parse contact info for display
  const parseContactInfo = (contact) => {
    if (!contact) return null
    const lines = contact.split('\n').map(line => line.trim()).filter(Boolean)
    const phone = lines.find(line => /^[\+]?[\d\s\-\(\)\.]+$/.test(line.replace(/[^\d\+\-\(\)\s\.]/g, '')))
    const email = lines.find(line => line.includes('@') && line.includes('.'))
    return { phone, email }
  }

  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <TruckIcon className="h-5 w-5 text-gray-400" />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleInputFocus}
          disabled={disabled}
          required={required}
          placeholder={placeholder}
          className={`w-full h-12 pl-10 pr-10 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent touch-manipulation disabled:bg-gray-100 disabled:text-gray-500 ${
            error 
              ? 'border-red-300 focus:ring-red-500' 
              : 'border-gray-300'
          }`}
          autoComplete="off"
        />
        
        {query && !disabled && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <TouchButton
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="text-gray-400 hover:text-gray-600"
            >
              <XIcon className="h-4 w-4" />
            </TouchButton>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}

      {/* Loading Indicator */}
      {isLoading && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-500 border-t-transparent"></div>
        </div>
      )}

      {/* Dropdown Results */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto"
        >
          {suppliers.length === 0 && !onCreateNew ? (
            <div className="p-4 text-center text-gray-500">
              <TruckIcon className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No suppliers found</p>
              <p className="text-xs text-gray-400 mt-1">
                Try a different search term
              </p>
            </div>
          ) : (
            <div className="py-2">
              {/* Supplier Results */}
              {suppliers.map((supplier, index) => {
                const contactInfo = parseContactInfo(supplier.contact)
                return (
                  <div
                    key={supplier.id}
                    onClick={() => handleSupplierSelect(supplier)}
                    className={`px-4 py-3 cursor-pointer transition-colors touch-manipulation ${
                      index === selectedIndex
                        ? 'bg-primary-50 text-primary-900'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate mb-1">
                          {supplier.name}
                        </h4>
                        
                        {contactInfo && (contactInfo.phone || contactInfo.email) && (
                          <div className="text-sm text-gray-600 space-y-0.5">
                            {contactInfo.phone && (
                              <div>{contactInfo.phone}</div>
                            )}
                            {contactInfo.email && (
                              <div>{contactInfo.email}</div>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <ChevronDownIcon className="h-4 w-4 text-gray-400 transform -rotate-90 flex-shrink-0 ml-2" />
                    </div>
                  </div>
                )
              })}
              
              {/* Create New Option */}
              {onCreateNew && query.length >= 2 && (
                <div
                  onClick={handleCreateNew}
                  className={`px-4 py-3 cursor-pointer transition-colors touch-manipulation border-t border-gray-100 ${
                    selectedIndex === suppliers.length
                      ? 'bg-primary-50 text-primary-900'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center">
                    <PlusIcon className="h-4 w-4 text-primary-600 mr-2 flex-shrink-0" />
                    <div className="flex-1">
                      <span className="font-medium text-primary-600">
                        Create new supplier
                      </span>
                      <div className="text-sm text-gray-600 truncate">
                        "{query}"
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}