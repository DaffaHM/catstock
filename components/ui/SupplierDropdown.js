'use client'

import { useState, useEffect, useRef } from 'react'
import { ChevronDownIcon, TruckIcon, PlusIcon } from 'lucide-react'
import { searchDemoSuppliers } from '@/lib/utils/demo-suppliers'
import { getSuppliersAction } from '@/lib/actions/suppliers'

export default function SupplierDropdown({
  value,
  onSupplierSelect,
  onCreateNew,
  placeholder = 'Pilih pemasok...',
  disabled = false,
  required = false,
  className = '',
  error = null,
  isDemoMode = false,
  forceRefresh = 0 // Add prop to force refresh
}) {
  const [suppliers, setSuppliers] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [selectedSupplier, setSelectedSupplier] = useState(null)
  
  const dropdownRef = useRef(null)
  const buttonRef = useRef(null)

  // Set initial selected supplier if value is provided
  useEffect(() => {
    if (value && typeof value === 'object') {
      setSelectedSupplier(value)
    } else if (value && typeof value === 'string') {
      // Find supplier by ID
      const supplier = suppliers.find(s => s.id === value)
      if (supplier) {
        setSelectedSupplier(supplier)
      }
    } else {
      setSelectedSupplier(null)
    }
  }, [value, suppliers])

  // Load all suppliers when component mounts
  useEffect(() => {
    loadSuppliers()
  }, [isDemoMode, forceRefresh])

  // Add effect to reload when suppliers might have changed
  useEffect(() => {
    const handleStorageChange = () => {
      console.log('[SupplierDropdown] Storage changed, reloading suppliers')
      loadSuppliers()
    }

    // Listen for storage changes
    window.addEventListener('storage', handleStorageChange)
    
    // Also listen for custom events when suppliers are added
    window.addEventListener('suppliersUpdated', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('suppliersUpdated', handleStorageChange)
    }
  }, [isDemoMode])

  const loadSuppliers = async () => {
    setIsLoading(true)
    try {
      console.log('[SupplierDropdown] Loading suppliers, isDemoMode:', isDemoMode)
      
      if (isDemoMode) {
        // Use demo suppliers - same method as SupplierListPage
        const result = searchDemoSuppliers('', {
          page: 1,
          limit: 1000, // Set very high limit to get all suppliers
          sortBy: 'createdAt', // Sort by creation date to show newest first
          sortOrder: 'desc'
        })
        console.log('[SupplierDropdown] Demo suppliers loaded:', result)
        console.log('[SupplierDropdown] Total suppliers found:', result.suppliers.length)
        console.log('[SupplierDropdown] Supplier IDs:', result.suppliers.map(s => s.id))
        console.log('[SupplierDropdown] Supplier names:', result.suppliers.map(s => s.name))
        setSuppliers(result.suppliers)
      } else {
        // Load from server
        const result = await getSuppliersAction({
          page: 1,
          limit: 100, // Load more suppliers for dropdown
          sortBy: 'name',
          sortOrder: 'asc'
        })
        
        console.log('[SupplierDropdown] Server suppliers loaded:', result)
        if (result.success) {
          setSuppliers(result.suppliers)
        } else {
          console.error('Failed to load suppliers:', result.error)
          setSuppliers([])
        }
      }
    } catch (error) {
      console.error('Error loading suppliers:', error)
      setSuppliers([])
    } finally {
      setIsLoading(false)
    }
  }

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        setIsOpen(true)
      }
      return
    }

    const totalOptions = suppliers.length + (onCreateNew ? 1 : 0)
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < totalOptions - 1 ? prev + 1 : 0
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => prev > 0 ? prev - 1 : totalOptions - 1)
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
        buttonRef.current?.blur()
        break
    }
  }

  // Handle supplier selection
  const handleSupplierSelect = (supplier) => {
    setSelectedSupplier(supplier)
    onSupplierSelect(supplier)
    setIsOpen(false)
    setSelectedIndex(-1)
    buttonRef.current?.blur()
  }

  // Handle create new supplier
  const handleCreateNew = () => {
    if (onCreateNew) {
      onCreateNew()
    } else {
      // Default behavior - could open a modal or navigate to supplier form
      console.log('Create new supplier requested')
    }
    setIsOpen(false)
    setSelectedIndex(-1)
  }

  // Toggle dropdown
  const handleToggle = () => {
    if (disabled) return
    
    // Reload suppliers every time dropdown is opened to ensure fresh data
    if (!isOpen) {
      console.log('[SupplierDropdown] Opening dropdown, refreshing suppliers...')
      loadSuppliers()
    }
    
    setIsOpen(!isOpen)
    if (!isOpen) {
      setSelectedIndex(-1)
    }
  }

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target) &&
        !buttonRef.current?.contains(event.target)
      ) {
        setIsOpen(false)
        setSelectedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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
      {/* Dropdown Button */}
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={`w-full h-12 px-3 text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent touch-manipulation disabled:bg-gray-100 disabled:text-gray-500 flex items-center justify-between ${
          error 
            ? 'border-red-300 focus:ring-red-500' 
            : 'border-gray-300'
        }`}
      >
        <div className="flex items-center flex-1 min-w-0">
          <TruckIcon className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
          <span className={`truncate ${selectedSupplier ? 'text-gray-900' : 'text-gray-500'}`}>
            {selectedSupplier ? selectedSupplier.name : placeholder}
          </span>
        </div>
        
        <ChevronDownIcon className={`h-5 w-5 text-gray-400 flex-shrink-0 transition-transform ${
          isOpen ? 'transform rotate-180' : ''
        }`} />
      </button>

      {/* Required indicator */}
      {required && (
        <span className="absolute -top-2 -right-2 text-red-500 text-sm">*</span>
      )}

      {/* Error Message */}
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}

      {/* Loading Indicator */}
      {isLoading && (
        <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-500 border-t-transparent"></div>
        </div>
      )}

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto"
        >
          {suppliers.length === 0 && !onCreateNew ? (
            <div className="p-4 text-center text-gray-500">
              <TruckIcon className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">Belum ada pemasok</p>
              <p className="text-xs text-gray-400 mt-1">
                Tambahkan pemasok terlebih dahulu
              </p>
            </div>
          ) : (
            <div className="py-2">
              {/* Supplier Options */}
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
                        
                        {supplier.notes && (
                          <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                            {supplier.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
              
              {/* Create New Option */}
              {onCreateNew && (
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
                        Tambah pemasok baru
                      </span>
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