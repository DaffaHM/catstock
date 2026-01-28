'use client'

import { useState } from 'react'
import { XIcon, EditIcon, TrashIcon } from 'lucide-react'
import TouchButton from './TouchButton'

export default function DetailPanel({
  title,
  subtitle,
  children,
  actions = [],
  onClose,
  onEdit,
  onDelete,
  isEditing = false,
  className = '',
  headerClassName = '',
  contentClassName = ''
}) {
  return (
    <div className={`h-full bg-white flex flex-col ${className}`}>
      {/* Header */}
      <div className={`p-4 border-b border-gray-200 flex-shrink-0 ${headerClassName}`}>
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h2 className="text-xl font-semibold text-gray-900 truncate">
              {title}
            </h2>
            {subtitle && (
              <p className="text-sm text-gray-500 mt-1 truncate">
                {subtitle}
              </p>
            )}
          </div>
          
          <div className="flex items-center space-x-2 ml-4 flex-shrink-0">
            {/* Custom Actions */}
            {actions.map((action, index) => (
              <TouchButton
                key={index}
                variant={action.variant || 'ghost'}
                size="sm"
                onClick={action.onClick}
                disabled={action.disabled}
                className={action.className}
                aria-label={action.label}
              >
                {action.icon}
              </TouchButton>
            ))}
            
            {/* Edit Button */}
            {onEdit && (
              <TouchButton
                variant="ghost"
                size="sm"
                onClick={onEdit}
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                aria-label="Edit"
              >
                <EditIcon className="h-5 w-5" />
              </TouchButton>
            )}
            
            {/* Delete Button */}
            {onDelete && (
              <TouchButton
                variant="ghost"
                size="sm"
                onClick={onDelete}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                aria-label="Delete"
              >
                <TrashIcon className="h-5 w-5" />
              </TouchButton>
            )}
            
            {/* Close Button */}
            {onClose && (
              <TouchButton
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                aria-label="Close"
              >
                <XIcon className="h-5 w-5" />
              </TouchButton>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className={`flex-1 overflow-y-auto ${contentClassName}`}>
        {children}
      </div>
    </div>
  )
}

// Reusable content sections for detail panels
export function DetailSection({ 
  title, 
  children, 
  className = '',
  collapsible = false,
  defaultExpanded = true 
}) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  if (collapsible) {
    return (
      <div className={`border-b border-gray-200 ${className}`}>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full p-4 text-left hover:bg-gray-50 focus:outline-none focus:bg-gray-50 transition-colors"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
            <span className="text-gray-400">
              {isExpanded ? '−' : '+'}
            </span>
          </div>
        </button>
        {isExpanded && (
          <div className="px-4 pb-4">
            {children}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className={`border-b border-gray-200 ${className}`}>
      <div className="p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-3">{title}</h3>
        {children}
      </div>
    </div>
  )
}

export function DetailField({ label, value, className = '' }) {
  return (
    <div className={`mb-3 ${className}`}>
      <dt className="text-sm font-medium text-gray-500 mb-1">{label}</dt>
      <dd className="text-base text-gray-900">{value || '—'}</dd>
    </div>
  )
}

export function DetailFieldGrid({ children, columns = 2, className = '' }) {
  const gridClass = columns === 1 ? 'grid-cols-1' : 
                   columns === 2 ? 'grid-cols-1 sm:grid-cols-2' :
                   columns === 3 ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' :
                   'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'

  return (
    <dl className={`grid ${gridClass} gap-4 ${className}`}>
      {children}
    </dl>
  )
}