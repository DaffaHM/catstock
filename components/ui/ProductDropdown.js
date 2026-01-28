'use client'

import { useState, useEffect, useRef } from 'react'
import { ChevronDownIcon, PackageIcon, SearchIcon } from 'lucide-react'
import { formatRupiah } from '@/lib/utils/currency'
import { searchDemoProducts } from '@/lib/utils/demo-products'
import { getProductsAction } from '@/lib/actions/products'

export default function ProductDropdown({
  onProductSelect,
  placeholder = 'Pilih produk...',
  disabled = false,
  className = '',
  showStock = true,
  excludeProductIds = [],
  isDemoMode = false
}) {
  const [products, setProducts] = useState([])
  const [filteredProducts, setFilteredProducts] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [searchQuery, setSearchQuery] = useState('')
  
  const dropdownRef = useRef(null)
  const buttonRef = useRef(null)
  const searchRef = useRef(null)

  // Load all products when component mounts
  useEffect(() => {
    loadProducts()
  }, [isDemoMode])

  // Add effect to reload when products might have changed
  useEffect(() => {
    const handleStorageChange = () => {
      console.log('[ProductDropdown] Storage changed, reloading products')
      loadProducts()
    }

    // Listen for storage changes
    window.addEventListener('storage', handleStorageChange)
    
    // Also listen for custom events when products are added
    window.addEventListener('productsUpdated', handleStorageChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('productsUpdated', handleStorageChange)
    }
  }, [isDemoMode])

  // Filter products based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredProducts(products.filter(product => !excludeProductIds.includes(product.id)))
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = products.filter(product => {
        if (excludeProductIds.includes(product.id)) return false
        
        return (
          product.name.toLowerCase().includes(query) ||
          product.brand.toLowerCase().includes(query) ||
          product.category.toLowerCase().includes(query) ||
          product.sku.toLowerCase().includes(query)
        )
      })
      setFilteredProducts(filtered)
    }
    setSelectedIndex(-1)
  }, [searchQuery, products, excludeProductIds])

  const loadProducts = async () => {
    setIsLoading(true)
    try {
      if (isDemoMode) {
        // Use demo products - same method as ProductListPage for consistency
        const result = searchDemoProducts('', {
          page: 1,
          limit: 200,
          sortBy: 'name',
          sortOrder: 'asc'
        })
        console.log('[ProductDropdown] Demo products loaded:', result)
        setProducts(result.products)
      } else {
        // Load from server
        const result = await getProductsAction({
          page: 1,
          limit: 200, // Load more products for dropdown
          sortBy: 'name',
          sortOrder: 'asc'
        })
        
        if (result.success) {
          setProducts(result.products)
        } else {
          console.error('Failed to load products:', result.error)
          setProducts([])
        }
      }
    } catch (error) {
      console.error('Error loading products:', error)
      setProducts([])
    } finally {
      setIsLoading(false)
    }
  }

  // Handle keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        handleToggle()
      }
      return
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < filteredProducts.length - 1 ? prev + 1 : 0
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => prev > 0 ? prev - 1 : filteredProducts.length - 1)
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && selectedIndex < filteredProducts.length) {
          handleProductSelect(filteredProducts[selectedIndex])
        }
        break
      case 'Escape':
        setIsOpen(false)
        setSelectedIndex(-1)
        setSearchQuery('')
        buttonRef.current?.blur()
        break
    }
  }

  // Handle search input key down
  const handleSearchKeyDown = (e) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(0)
        break
      case 'Escape':
        setIsOpen(false)
        setSelectedIndex(-1)
        setSearchQuery('')
        buttonRef.current?.focus()
        break
      case 'Enter':
        e.preventDefault()
        if (filteredProducts.length > 0) {
          const productToSelect = selectedIndex >= 0 ? filteredProducts[selectedIndex] : filteredProducts[0]
          handleProductSelect(productToSelect)
        }
        break
    }
  }

  // Handle product selection
  const handleProductSelect = (product) => {
    onProductSelect(product)
    setIsOpen(false)
    setSelectedIndex(-1)
    setSearchQuery('')
    buttonRef.current?.blur()
  }

  // Toggle dropdown
  const handleToggle = () => {
    if (disabled) return
    const newIsOpen = !isOpen
    setIsOpen(newIsOpen)
    
    if (newIsOpen) {
      // Reload products every time dropdown is opened to ensure fresh data
      console.log('[ProductDropdown] Opening dropdown, refreshing products...')
      loadProducts()
      setSelectedIndex(-1)
      // Focus search input after dropdown opens
      setTimeout(() => {
        searchRef.current?.focus()
      }, 100)
    } else {
      setSearchQuery('')
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
        setSearchQuery('')
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className={`relative ${className}`}>
      {/* Dropdown Button */}
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className="w-full h-12 px-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent touch-manipulation disabled:bg-gray-100 disabled:text-gray-500 flex items-center justify-between"
      >
        <div className="flex items-center flex-1 min-w-0">
          <PackageIcon className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
          <span className="truncate text-gray-500">
            {placeholder}
          </span>
        </div>
        
        <ChevronDownIcon className={`h-5 w-5 text-gray-400 flex-shrink-0 transition-transform ${
          isOpen ? 'transform rotate-180' : ''
        }`} />
      </button>

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
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-hidden"
        >
          {/* Search Input */}
          <div className="p-3 border-b border-gray-200">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                ref={searchRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Cari produk..."
                className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                autoComplete="off"
              />
            </div>
          </div>

          {/* Products List */}
          <div className="max-h-80 overflow-y-auto">
            {filteredProducts.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                <PackageIcon className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">
                  {searchQuery ? 'Tidak ada produk yang sesuai' : 'Belum ada produk'}
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  {searchQuery ? 'Coba kata kunci lain' : 'Tambahkan produk terlebih dahulu'}
                </p>
              </div>
            ) : (
              <div className="py-2">
                {filteredProducts.map((product, index) => (
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
                              (product.currentStock || 0) > 0
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {product.currentStock || 0} stok
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
                              <span>{product.size} {product.unit}</span>
                            </>
                          )}
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">
                            {product.category}
                          </span>
                          {product.sellingPrice && (
                            <>
                              <span className="mx-2">•</span>
                              <span className="font-medium">
                                {formatRupiah(product.sellingPrice)}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}