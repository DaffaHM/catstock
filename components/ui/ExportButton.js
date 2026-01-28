'use client'

import { useState } from 'react'
import TouchButton from './TouchButton'
import { DownloadIcon, CheckCircleIcon, AlertCircleIcon } from 'lucide-react'

export default function ExportButton({
  exportType,
  filters = {},
  onExport,
  disabled = false,
  className = '',
  children,
  variant = 'secondary',
  size = 'default'
}) {
  const [exporting, setExporting] = useState(false)
  const [exportStatus, setExportStatus] = useState(null) // 'success', 'error', null

  const handleExport = async () => {
    if (exporting || disabled) return

    setExporting(true)
    setExportStatus(null)

    try {
      let result
      
      if (onExport) {
        // Use custom export function
        result = await onExport(filters)
      } else {
        // Use API endpoint
        const queryParams = new URLSearchParams()
        Object.entries(filters).forEach(([key, value]) => {
          if (value) queryParams.append(key, value)
        })
        
        const response = await fetch(`/api/exports/${exportType}?${queryParams}`)
        
        if (response.ok) {
          // Handle file download
          const blob = await response.blob()
          const url = window.URL.createObjectURL(blob)
          const link = document.createElement('a')
          link.href = url
          
          // Extract filename from Content-Disposition header
          const contentDisposition = response.headers.get('Content-Disposition')
          const filename = contentDisposition 
            ? contentDisposition.split('filename=')[1]?.replace(/"/g, '')
            : `${exportType}-export-${new Date().toISOString().split('T')[0]}.csv`
          
          link.download = filename
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          window.URL.revokeObjectURL(url)
          
          result = { success: true }
        } else {
          const errorData = await response.json()
          result = { success: false, error: errorData.error || 'Export failed' }
        }
      }

      if (result.success) {
        setExportStatus('success')
        setTimeout(() => setExportStatus(null), 3000) // Clear success status after 3 seconds
      } else {
        setExportStatus('error')
        console.error('Export failed:', result.error)
        setTimeout(() => setExportStatus(null), 5000) // Clear error status after 5 seconds
      }
    } catch (error) {
      console.error('Export error:', error)
      setExportStatus('error')
      setTimeout(() => setExportStatus(null), 5000)
    } finally {
      setExporting(false)
    }
  }

  const getButtonContent = () => {
    if (exporting) {
      return (
        <>
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
          Exporting...
        </>
      )
    }

    if (exportStatus === 'success') {
      return (
        <>
          <CheckCircleIcon className="h-4 w-4 mr-2 text-green-600" />
          Exported!
        </>
      )
    }

    if (exportStatus === 'error') {
      return (
        <>
          <AlertCircleIcon className="h-4 w-4 mr-2 text-red-600" />
          Export Failed
        </>
      )
    }

    return (
      <>
        <DownloadIcon className="h-4 w-4 mr-2" />
        {children || 'Export CSV'}
      </>
    )
  }

  const getButtonVariant = () => {
    if (exportStatus === 'success') return 'outline'
    if (exportStatus === 'error') return 'outline'
    return variant
  }

  return (
    <TouchButton
      variant={getButtonVariant()}
      size={size}
      onClick={handleExport}
      disabled={exporting || disabled}
      className={`flex items-center transition-all duration-200 ${
        exportStatus === 'success' ? 'border-green-300 text-green-700' :
        exportStatus === 'error' ? 'border-red-300 text-red-700' : ''
      } ${className}`}
    >
      {getButtonContent()}
    </TouchButton>
  )
}