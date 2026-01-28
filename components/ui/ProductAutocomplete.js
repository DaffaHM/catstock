'use client'

import { useState, useEffect, useRef } from 'react'
import { SearchIcon, XIcon, PackageIcon, ChevronDownIcon } from 'lucide-react'
import TouchButton from './TouchButton'
import { searchProductsAction } from '@/lib/actions/products'

export default function ProductAutocomplete({
  onProductSelect,
  placeholder = 'Search products...',
  disabled = false,
  className = '',
  showStock = true,
  excludeProductIds = []
}) {
  const [query, setQuery] = useState('')
  const [products, setProducts] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  
  const inputRef = useRef(null)
  const dropdownRef = useRef(null)
  const timeoutRef = useRef(null)

  // Debounced search
  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    if (query.length < 2) {
      setProducts([])
      setIsOpen(false)
      return
    }

    timeoutRef.current = setTimeout(async () => {
      setIsLoading(true)
      try {
        const result = await searchProductsAction(query)
        if (result.success) {
          // Filter out excluded products
          const filteredProducts = result.products.filter(
            product => !excludeProductIds.includes(product.id)
          )
          setProducts(filteredProducts)
          setIsOpen(filteredProducts.length > 0)
          setSelectedIndex(-1)
        }
      } catch (error) {
        console.error('Product search error:', error)
        setProducts([])
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
  }, [query, excludeProductIds])

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen || products.length === 0) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < products.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => prev > 0 ? prev - 1 : prev)
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < products.length) {
          handleProductSelect(products[selectedIndex])
        }
        break
      case 'Escape':
        setIsOpen(false)
        setSelectedIndex(-1)
        inputRef.current?.blur()
        break
    }
  }

  // Handle product selection
  const handleProductSelect = (product) => {
    onProductSelect(product)
    setQuery('')
    setProducts([])
    setIsOpen(false)
    setSelectedIndex(-1)
    inputRef.current?.blur()
  }

  // Handle input change
  const handleInputChange = (e) => {
    setQuery(e.target.value)
  }

  // Handle input focus
  const handleInputFocus = () => {
    if (products.length > 0) {
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

  // Clear search
  const handleClear = () => {
    setQuery('')
    setProducts([])
    setIsOpen(false)
    setSelectedIndex(-1)
    inputRef.current?.focus()
  }

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount) return null
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount)
  }

  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <SearchIcon className="h-5 w-5 text-gray-400" />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={handleInputFocus}
          disabled={disabled}
          placeholder={placeholder}
          className="w-full h-12 pl-10 pr-10 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent touch-manipulation disabled:bg-gray-100 disabled:text-gray-500"
          autoComplete="off"
        />
        
        {query && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <TouchButton
              variant="ghost"
              size="sm"
              onClick={handleClear}
              disabled={disabled}
              className="text-gray-400 hover:text-gray-600"
            >
              <XIcon className="h-4 w-4" />
            </TouchButton>
          </div>
        )}
      </div>

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
          {products.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <PackageIcon className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No products found</p>
              <p className="text-xs text-gray-400 mt-1">
                Try a different search term
              </p>
            </div>
          ) : (
            <div className="py-2">
              {products.map((product, index) => (
                <div
                  key={product.id}
                  onClick={() => handleProductSelect(product)}
                  className={`px-4 py-3 cursor-pointer transition-colors touch-manipulation ${
                    index === selectedIndex
                      ? 'bg-primary-50 text-primary-900'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center mb-1">
                        <h4 className="font-medium text-gray-900 truncate">
                          {product.name}
                        </h4>
                        {showStock && (
                          <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                            product.currentStock > 0
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {product.currentStock} in stock
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600">
                        <span className="font-mono">{product.sku}</span>
                        <span className="mx-2">•</span>
                        <span>{product.brand}</span>
                        {product.size && (
                          <>
                            <span className="mx-2">•</span>
                            <span>{product.size}</span>
                          </>
                        )}
                      </div>
                      
                      {product.sellingPrice && (
                        <div className="text-sm text-gray-500 mt-1">
                          Price: {formatCurrency(product.sellingPrice)}
                        </div>
                      )}
                    </div>
                    
                    <ChevronDownIcon className="h-4 w-4 text-gray-400 transform -rotate-90 flex-shrink-0 ml-2" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}