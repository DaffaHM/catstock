'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { 
  getStockReportData, 
  getStockReportForExport, 
  getStockReportFilterOptions 
} from '@/lib/queries/reports'

/**
 * Get stock report data with filtering and pagination
 */
export async function getStockReportAction(filters = {}) {
  try {
    const session = await getSession()
    
    if (!session?.isAuthenticated) {
      redirect('/login')
    }

    const data = await getStockReportData(filters)
    
    return {
      success: true,
      data
    }
  } catch (error) {
    console.error('Stock report action error:', error)
    return {
      success: false,
      error: 'Failed to load stock report'
    }
  }
}

/**
 * Export stock report data as CSV
 */
export async function exportStockReportAction(filters = {}) {
  try {
    const session = await getSession()
    
    if (!session?.isAuthenticated) {
      redirect('/login')
    }

    const { handleCsvExport, createExportFilename, CSV_EXPORT_CONFIG } = await import('@/lib/utils/csv-export')
    const { getStockReportForExport } = await import('@/lib/queries/reports')
    
    const result = await handleCsvExport(
      CSV_EXPORT_CONFIG.EXPORT_TYPES.STOCK_REPORT,
      filters,
      getStockReportForExport,
      {
        filename: createExportFilename('stock-report', filters)
      }
    )
    
    return result
  } catch (error) {
    console.error('Stock report export error:', error)
    return {
      success: false,
      error: 'Failed to export stock report'
    }
  }
}

/**
 * Get available filter options for stock reports
 */
export async function getStockReportFilterOptionsAction() {
  try {
    const session = await getSession()
    
    if (!session?.isAuthenticated) {
      redirect('/login')
    }

    const data = await getStockReportFilterOptions()
    
    return {
      success: true,
      data
    }
  } catch (error) {
    console.error('Stock report filter options error:', error)
    return {
      success: false,
      error: 'Failed to load filter options'
    }
  }
}

/**
 * Refresh stock report data (for real-time updates)
 */
export async function refreshStockReportAction() {
  try {
    const session = await getSession()
    
    if (!session?.isAuthenticated) {
      redirect('/login')
    }

    // Revalidate the reports page to ensure fresh data
    revalidatePath('/reports')
    
    return {
      success: true,
      message: 'Stock report refreshed'
    }
  } catch (error) {
    console.error('Stock report refresh error:', error)
    return {
      success: false,
      error: 'Failed to refresh stock report'
    }
  }
}

/**
 * Get sales and purchase summary report data
 */
export async function getSalesPurchaseSummaryAction(filters = {}) {
  try {
    const session = await getSession()
    
    if (!session?.isAuthenticated) {
      redirect('/login')
    }

    const { getSalesPurchaseSummaryData } = await import('@/lib/queries/reports')
    const data = await getSalesPurchaseSummaryData(filters)
    
    return {
      success: true,
      data
    }
  } catch (error) {
    console.error('Sales purchase summary action error:', error)
    return {
      success: false,
      error: 'Failed to load sales and purchase summary'
    }
  }
}

/**
 * Get detailed transaction data for reports
 */
export async function getDetailedTransactionAction(filters = {}) {
  try {
    const session = await getSession()
    
    if (!session?.isAuthenticated) {
      redirect('/login')
    }

    const { getDetailedTransactionData } = await import('@/lib/queries/reports')
    const data = await getDetailedTransactionData(filters)
    
    return {
      success: true,
      data
    }
  } catch (error) {
    console.error('Detailed transaction action error:', error)
    return {
      success: false,
      error: 'Failed to load transaction details'
    }
  }
}

/**
 * Export sales and purchase summary as CSV
 */
export async function exportSalesPurchaseSummaryAction(filters = {}) {
  try {
    const session = await getSession()
    
    if (!session?.isAuthenticated) {
      redirect('/login')
    }

    const { handleCsvExport, createExportFilename, CSV_EXPORT_CONFIG } = await import('@/lib/utils/csv-export')
    const { getSalesPurchaseSummaryForExport } = await import('@/lib/queries/reports')
    
    const result = await handleCsvExport(
      CSV_EXPORT_CONFIG.EXPORT_TYPES.SALES_PURCHASE_SUMMARY,
      filters,
      getSalesPurchaseSummaryForExport,
      {
        filename: createExportFilename('sales-purchase-summary', filters)
      }
    )
    
    return result
  } catch (error) {
    console.error('Sales purchase summary export error:', error)
    return {
      success: false,
      error: 'Failed to export sales and purchase summary'
    }
  }
}