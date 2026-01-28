'use client'

import { useState } from 'react'
import TouchButton from '@/components/ui/TouchButton'
import { 
  EditIcon, 
  TruckIcon, 
  PhoneIcon,
  MailIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronDownIcon,
  ChevronRightIcon as ChevronRightSmallIcon
} from 'lucide-react'

export default function SupplierList({
  suppliers,
  selectedSupplierId,
  onSupplierSelect,
  onSupplierEdit,
  loading,
  pagination,
  onPageChange
}) {
  const [expandedSupplier, setExpandedSupplier] = useState(null)

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const parseContactInfo = (contact) => {
    if (!contact) return { phone: null, email: null, other: [] }
    
    const lines = contact.split('\n').map(line => line.trim()).filter(Boolean)
    const phone = lines.find(line => /^[\+]?[\d\s\-\(\)\.]+$/.test(line.replace(/[^\d\+\-\(\)\s\.]/g, '')))
    const email = lines.find(line => line.includes('@') && line.includes('.'))
    const other = lines.filter(line => line !== phone && line !== email)
    
    return { phone, email, other }
  }

  const handleSupplierClick = (supplier) => {
    if (selectedSupplierId === supplier.id) {
      // If already selected, expand/collapse details
      setExpandedSupplier(expandedSupplier === supplier.id ? null : supplier.id)
    } else {
      // Select the supplier
      onSupplierSelect(supplier.id)
      setExpandedSupplier(null)
    }
  }

  const handleEditClick = (e, supplier) => {
    e.stopPropagation()
    onSupplierEdit(supplier)
  }

  if (loading) {
    return (
      <div className="p-4 space-y-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white p-4 rounded-lg border animate-pulse">
            <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          </div>
        ))}
      </div>
    )
  }

  if (suppliers.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        <TruckIcon className="h-16 w-16 mx-auto mb-4 text-gray-300" />
        <h3 className="text-lg font-medium mb-2">No Suppliers Found</h3>
        <p className="text-sm">
          Try adjusting your search or create a new supplier.
        </p>
      </div>
    )
  }

  return (
    <div className="p-4">
      {/* Supplier Cards */}
      <div className="space-y-3 mb-6">
        {suppliers.map((supplier) => {
          const isSelected = selectedSupplierId === supplier.id
          const isExpanded = expandedSupplier === supplier.id
          const contactInfo = parseContactInfo(supplier.contact)

          return (
            <div
              key={supplier.id}
              className={`bg-white rounded-lg border transition-all duration-200 cursor-pointer touch-manipulation ${
                isSelected
                  ? 'border-primary-500 ring-2 ring-primary-100 shadow-md'
                  : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
              }`}
              onClick={() => handleSupplierClick(supplier)}
            >
              {/* Main Supplier Info */}
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {supplier.name}
                      </h3>
                      {isExpanded ? (
                        <ChevronDownIcon className="h-5 w-5 text-gray-400 ml-2 flex-shrink-0" />
                      ) : (
                        <ChevronRightSmallIcon className="h-5 w-5 text-gray-400 ml-2 flex-shrink-0" />
                      )}
                    </div>
                    
                    {/* Quick Contact Info */}
                    <div className="space-y-1">
                      {contactInfo.phone && (
                        <div className="flex items-center text-sm text-gray-600">
                          <PhoneIcon className="h-4 w-4 mr-2 text-gray-400" />
                          <span>{contactInfo.phone}</span>
                        </div>
                      )}
                      {contactInfo.email && (
                        <div className="flex items-center text-sm text-gray-600">
                          <MailIcon className="h-4 w-4 mr-2 text-gray-400" />
                          <span>{contactInfo.email}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-500 mt-2">
                      <span>{supplier.transactionCount} transactions</span>
                      <span className="mx-2">•</span>
                      <span>Added {formatDate(supplier.createdAt)}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    {/* Transaction Count Badge */}
                    <div className="text-right">
                      <div className={`text-sm font-medium ${
                        supplier.transactionCount > 0 ? 'text-green-600' : 'text-gray-500'
                      }`}>
                        {supplier.transactionCount}
                      </div>
                      <div className="text-xs text-gray-500">
                        transactions
                      </div>
                    </div>

                    {/* Edit Button */}
                    <TouchButton
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleEditClick(e, supplier)}
                      className="text-gray-500 hover:text-gray-700"
                      aria-label="Edit supplier"
                    >
                      <EditIcon className="h-4 w-4" />
                    </TouchButton>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="space-y-4">
                      {/* Full Contact Information */}
                      {supplier.contact && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Contact Information</h4>
                          <div className="bg-gray-50 rounded-lg p-3">
                            <pre className="text-sm text-gray-600 whitespace-pre-wrap font-sans">
                              {supplier.contact}
                            </pre>
                          </div>
                        </div>
                      )}

                      {/* Notes */}
                      {supplier.notes && (
                        <div>
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Notes</h4>
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-sm text-gray-600 whitespace-pre-wrap">
                              {supplier.notes}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Metadata */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Created:</span>
                          <span className="ml-2 font-medium">
                            {formatDate(supplier.createdAt)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Last Updated:</span>
                          <span className="ml-2 font-medium">
                            {formatDate(supplier.updatedAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between bg-white p-4 rounded-lg border">
          <div className="text-sm text-gray-600">
            Page {pagination.page} of {pagination.totalPages} 
            ({pagination.totalCount} total suppliers)
          </div>
          
          <div className="flex items-center space-x-2">
            <TouchButton
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={!pagination.hasPreviousPage}
              className="flex items-center"
            >
              <ChevronLeftIcon className="h-4 w-4 mr-1" />
              Previous
            </TouchButton>
            
            <TouchButton
              variant="outline"
              size="sm"
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={!pagination.hasNextPage}
              className="flex items-center"
            >
              Next
              <ChevronRightIcon className="h-4 w-4 ml-1" />
            </TouchButton>
          </div>
        </div>
      )}
    </div>
  )
}