'use client'

import { useState, useEffect } from 'react'
import TouchButton from '@/components/ui/TouchButton'
import { 
  EditIcon, 
  TrashIcon, 
  TruckIcon,
  PhoneIcon,
  MailIcon,
  CalendarIcon,
  FileTextIcon,
  XIcon,
  AlertTriangleIcon
} from 'lucide-react'
import { getSupplierAction, deleteSupplierAction } from '@/lib/actions/suppliers'

export default function SupplierDetail({ supplierId, onEdit, onDeleted, onClose }) {
  const [supplier, setSupplier] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Load supplier data
  useEffect(() => {
    async function loadSupplier() {
      if (!supplierId) return
      
      setLoading(true)
      setError(null)
      
      try {
        const result = await getSupplierAction(supplierId)
        
        if (result.success) {
          setSupplier(result.supplier)
        } else {
          setError(result.error)
        }
      } catch (err) {
        setError('Failed to load supplier details')
      } finally {
        setLoading(false)
      }
    }

    loadSupplier()
  }, [supplierId])

  const handleEdit = () => {
    if (supplier) {
      onEdit(supplier)
    }
  }

  const handleDelete = async () => {
    if (!supplier) return
    
    setDeleting(true)
    try {
      const result = await deleteSupplierAction(supplier.id)
      
      if (result.success) {
        onDeleted()
      } else {
        setError(result.error)
        setShowDeleteConfirm(false)
      }
    } catch (err) {
      setError('Failed to delete supplier')
      setShowDeleteConfirm(false)
    } finally {
      setDeleting(false)
    }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const formatCurrency = (amount) => {
    if (!amount) return '—'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const parseContactInfo = (contact) => {
    if (!contact) return { phone: null, email: null, other: [] }
    
    const lines = contact.split('\n').map(line => line.trim()).filter(Boolean)
    const phone = lines.find(line => /^[\+]?[\d\s\-\(\)\.]+$/.test(line.replace(/[^\d\+\-\(\)\s\.]/g, '')))
    const email = lines.find(line => line.includes('@') && line.includes('.'))
    const other = lines.filter(line => line !== phone && line !== email)
    
    return { phone, email, other }
  }

  if (loading) {
    return (
      <div className="h-full bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading supplier details...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-full bg-white flex items-center justify-center">
        <div className="text-center text-red-600">
          <AlertTriangleIcon className="h-12 w-12 mx-auto mb-4" />
          <p className="font-medium">{error}</p>
        </div>
      </div>
    )
  }

  if (!supplier) {
    return (
      <div className="h-full bg-white flex items-center justify-center">
        <div className="text-center text-gray-500">
          <TruckIcon className="h-12 w-12 mx-auto mb-4" />
          <p>Supplier not found</p>
        </div>
      </div>
    )
  }

  const contactInfo = parseContactInfo(supplier.contact)

  return (
    <div className="h-full bg-white flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <TruckIcon className="h-6 w-6 text-primary-600 mr-3" />
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{supplier.name}</h2>
              <p className="text-gray-600 mt-1">
                {supplier.transactionCount} transactions • Added {formatDate(supplier.createdAt).split(',')[0]}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <TouchButton
              variant="outline"
              onClick={handleEdit}
              className="flex items-center"
            >
              <EditIcon className="h-4 w-4 mr-2" />
              Edit
            </TouchButton>
            
            <TouchButton
              variant="outline"
              onClick={() => setShowDeleteConfirm(true)}
              className="text-red-600 hover:text-red-700 hover:border-red-300"
              disabled={supplier.transactionCount > 0}
            >
              <TrashIcon className="h-4 w-4 mr-2" />
              Delete
            </TouchButton>
            
            <TouchButton
              variant="ghost"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
              aria-label="Close details"
            >
              <XIcon className="h-6 w-6" />
            </TouchButton>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-6 max-w-4xl">
          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              <p className="font-medium">{error}</p>
            </div>
          )}

          {/* Contact Information */}
          {supplier.contact && (
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <PhoneIcon className="h-5 w-5 mr-2" />
                Contact Information
              </h3>
              
              <div className="space-y-3">
                {contactInfo.phone && (
                  <div className="flex items-center">
                    <PhoneIcon className="h-4 w-4 text-gray-400 mr-3" />
                    <span className="text-gray-900">{contactInfo.phone}</span>
                  </div>
                )}
                
                {contactInfo.email && (
                  <div className="flex items-center">
                    <MailIcon className="h-4 w-4 text-gray-400 mr-3" />
                    <a 
                      href={`mailto:${contactInfo.email}`}
                      className="text-primary-600 hover:text-primary-700"
                    >
                      {contactInfo.email}
                    </a>
                  </div>
                )}
                
                {contactInfo.other.length > 0 && (
                  <div className="mt-4">
                    <div className="text-sm font-medium text-gray-700 mb-2">Additional Information:</div>
                    {contactInfo.other.map((info, index) => (
                      <div key={index} className="text-gray-600 text-sm">
                        {info}
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Full contact as fallback */}
                {!contactInfo.phone && !contactInfo.email && contactInfo.other.length === 0 && (
                  <pre className="text-gray-600 whitespace-pre-wrap font-sans text-sm">
                    {supplier.contact}
                  </pre>
                )}
              </div>
            </div>
          )}

          {/* Notes */}
          {supplier.notes && (
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <FileTextIcon className="h-5 w-5 mr-2" />
                Notes
              </h3>
              <p className="text-gray-700 whitespace-pre-wrap">{supplier.notes}</p>
            </div>
          )}

          {/* Transaction Summary */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Transaction Summary</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {supplier.transactionCount}
                </div>
                <div className="text-sm text-blue-700">Total Transactions</div>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {supplier.recentTransactions?.length || 0}
                </div>
                <div className="text-sm text-green-700">Recent Transactions</div>
              </div>
            </div>
          </div>

          {/* Recent Transactions */}
          {supplier.recentTransactions && supplier.recentTransactions.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Transactions</h3>
              
              <div className="space-y-3">
                {supplier.recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">
                        {transaction.referenceNumber}
                      </div>
                      <div className="text-sm text-gray-600">
                        {transaction.type} • {formatDate(transaction.transactionDate).split(',')[0]}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-gray-900">
                        {formatCurrency(transaction.totalValue)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Metadata */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <CalendarIcon className="h-5 w-5 mr-2" />
              Details
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Created:</span>
                <span className="ml-2 font-medium text-gray-900">
                  {formatDate(supplier.createdAt)}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Last Updated:</span>
                <span className="ml-2 font-medium text-gray-900">
                  {formatDate(supplier.updatedAt)}
                </span>
              </div>
              <div>
                <span className="text-gray-500">Supplier ID:</span>
                <span className="ml-2 font-mono text-xs text-gray-600">
                  {supplier.id}
                </span>
              </div>
            </div>
          </div>

          {/* Delete Warning */}
          {supplier.transactionCount > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertTriangleIcon className="h-5 w-5 text-amber-500 mr-3 mt-0.5" />
                <div>
                  <h4 className="font-medium text-amber-800">Cannot Delete Supplier</h4>
                  <p className="text-sm text-amber-700 mt-1">
                    This supplier has {supplier.transactionCount} associated transactions and cannot be deleted. 
                    You can edit the supplier information instead.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center mb-4">
              <AlertTriangleIcon className="h-6 w-6 text-red-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">Delete Supplier</h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{supplier.name}"? This action cannot be undone.
            </p>
            
            <div className="flex items-center justify-end space-x-4">
              <TouchButton
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleting}
              >
                Cancel
              </TouchButton>
              
              <TouchButton
                variant="primary"
                onClick={handleDelete}
                disabled={deleting}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {deleting ? 'Deleting...' : 'Delete Supplier'}
              </TouchButton>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}