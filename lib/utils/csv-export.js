/**
 * CSV Export Utilities
 * Provides streaming CSV export functionality for large datasets
 * with proper authentication and audit logging
 */

import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

/**
 * CSV Export Configuration
 */
export const CSV_EXPORT_CONFIG = {
  // Maximum rows per chunk for streaming
  CHUNK_SIZE: 1000,
  // Maximum total rows for export (safety limit)
  MAX_EXPORT_ROWS: 50000,
  // Supported export types
  EXPORT_TYPES: {
    PRODUCTS: 'products',
    SUPPLIERS: 'suppliers',
    STOCK_MOVEMENTS: 'stock_movements',
    TRANSACTIONS: 'transactions',
    STOCK_REPORT: 'stock_report',
    SALES_PURCHASE_SUMMARY: 'sales_purchase_summary'
  }
}

/**
 * Escape CSV field value
 * @param {any} value - Value to escape
 * @returns {string} Escaped CSV field
 */
export function escapeCsvField(value) {
  if (value === null || value === undefined) {
    return ''
  }
  
  const stringValue = String(value)
  
  // If the value contains comma, quote, or newline, wrap in quotes and escape quotes
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n') || stringValue.includes('\r')) {
    return `"${stringValue.replace(/"/g, '""')}"`
  }
  
  return stringValue
}

/**
 * Convert array of objects to CSV string
 * @param {Array} data - Array of objects to convert
 * @param {Array} headers - Optional custom headers
 * @returns {string} CSV string
 */
export function arrayToCsv(data, headers = null) {
  if (!data || data.length === 0) {
    return ''
  }
  
  // Use provided headers or extract from first object
  const csvHeaders = headers || Object.keys(data[0])
  const headerRow = csvHeaders.map(escapeCsvField).join(',')
  
  // Convert data rows
  const dataRows = data.map(row => 
    csvHeaders.map(header => escapeCsvField(row[header])).join(',')
  )
  
  return [headerRow, ...dataRows].join('\n')
}

/**
 * Log export activity for audit purposes
 * @param {string} exportType - Type of export
 * @param {Object} filters - Export filters used
 * @param {number} rowCount - Number of rows exported
 * @param {string} userId - User ID performing export
 */
export async function logExportActivity(exportType, filters, rowCount, userId) {
  try {
    // Log to console for now (in production, this would go to a proper audit log)
    const logEntry = {
      timestamp: new Date().toISOString(),
      userId,
      exportType,
      filters: JSON.stringify(filters),
      rowCount,
      userAgent: typeof window !== 'undefined' ? window.navigator?.userAgent : 'Server',
      ipAddress: 'N/A' // Would be populated from request in production
    }
    
    console.log('CSV Export Activity:', logEntry)
    
    // In a production system, you might want to store this in a database table
    // await prisma.auditLog.create({
    //   data: {
    //     action: 'CSV_EXPORT',
    //     entityType: exportType,
    //     userId,
    //     metadata: logEntry
    //   }
    // })
    
    return true
  } catch (error) {
    console.error('Failed to log export activity:', error)
    return false
  }
}

/**
 * Validate export request
 * @param {string} exportType - Type of export
 * @param {Object} filters - Export filters
 * @returns {Object} Validation result
 */
export function validateExportRequest(exportType, filters = {}) {
  const errors = []
  
  // Validate export type
  if (!Object.values(CSV_EXPORT_CONFIG.EXPORT_TYPES).includes(exportType)) {
    errors.push(`Invalid export type: ${exportType}`)
  }
  
  // Validate date ranges if present
  if (filters.startDate && filters.endDate) {
    const startDate = new Date(filters.startDate)
    const endDate = new Date(filters.endDate)
    
    if (startDate > endDate) {
      errors.push('Start date must be before end date')
    }
    
    // Limit date range to prevent excessive exports
    const daysDiff = (endDate - startDate) / (1000 * 60 * 60 * 24)
    if (daysDiff > 365) {
      errors.push('Date range cannot exceed 365 days')
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Create streaming CSV export response
 * @param {string} filename - Export filename
 * @param {Function} dataGenerator - Async generator function that yields data chunks
 * @param {Object} options - Export options
 * @returns {Response} Streaming response
 */
export async function createStreamingCsvResponse(filename, dataGenerator, options = {}) {
  const { headers: customHeaders = null } = options
  
  // Create readable stream
  const stream = new ReadableStream({
    async start(controller) {
      try {
        let isFirstChunk = true
        let totalRows = 0
        
        for await (const chunk of dataGenerator()) {
          if (totalRows > CSV_EXPORT_CONFIG.MAX_EXPORT_ROWS) {
            controller.error(new Error('Export size limit exceeded'))
            return
          }
          
          if (chunk && chunk.length > 0) {
            let csvChunk
            
            if (isFirstChunk) {
              // Include headers in first chunk
              csvChunk = arrayToCsv(chunk, customHeaders)
              isFirstChunk = false
            } else {
              // Skip headers for subsequent chunks
              const dataRows = chunk.map(row => 
                (customHeaders || Object.keys(chunk[0])).map(header => 
                  escapeCsvField(row[header])
                ).join(',')
              )
              csvChunk = dataRows.join('\n')
            }
            
            if (csvChunk) {
              controller.enqueue(new TextEncoder().encode(csvChunk + '\n'))
              totalRows += chunk.length
            }
          }
        }
        
        controller.close()
      } catch (error) {
        controller.error(error)
      }
    }
  })
  
  // Return response with appropriate headers
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Cache-Control': 'no-cache',
      'X-Content-Type-Options': 'nosniff'
    }
  })
}

/**
 * Generic CSV export handler with authentication and audit logging
 * @param {string} exportType - Type of export
 * @param {Object} filters - Export filters
 * @param {Function} dataFetcher - Function to fetch data
 * @param {Object} options - Export options
 * @returns {Object} Export result
 */
export async function handleCsvExport(exportType, filters, dataFetcher, options = {}) {
  try {
    // Authenticate user
    const session = await getSession()
    if (!session?.isAuthenticated) {
      return {
        success: false,
        error: 'Authentication required',
        statusCode: 401
      }
    }
    
    // Validate export request
    const validation = validateExportRequest(exportType, filters)
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.errors.join(', '),
        statusCode: 400
      }
    }
    
    // Fetch data
    const data = await dataFetcher(filters)
    
    if (!data || data.length === 0) {
      return {
        success: false,
        error: 'No data to export',
        statusCode: 404
      }
    }
    
    // Convert to CSV
    const csvData = arrayToCsv(data, options.headers)
    
    // Log export activity
    await logExportActivity(exportType, filters, data.length, session.user.id)
    
    return {
      success: true,
      csvData,
      rowCount: data.length,
      filename: options.filename || `${exportType}-${new Date().toISOString().split('T')[0]}.csv`
    }
  } catch (error) {
    console.error(`CSV export error for ${exportType}:`, error)
    return {
      success: false,
      error: 'Export failed due to server error',
      statusCode: 500
    }
  }
}

/**
 * Create filename for export
 * @param {string} exportType - Type of export
 * @param {Object} filters - Export filters
 * @returns {string} Generated filename
 */
export function createExportFilename(exportType, filters = {}) {
  const date = new Date().toISOString().split('T')[0]
  let filename = `${exportType}-${date}`
  
  // Add date range to filename if present
  if (filters.startDate && filters.endDate) {
    filename += `-${filters.startDate}-to-${filters.endDate}`
  } else if (filters.startDate) {
    filename += `-from-${filters.startDate}`
  } else if (filters.endDate) {
    filename += `-until-${filters.endDate}`
  }
  
  return `${filename}.csv`
}