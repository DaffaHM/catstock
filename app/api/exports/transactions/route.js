import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getTransactionsForExport } from '@/lib/queries/csv-exports'
import { 
  handleCsvExport, 
  createExportFilename,
  CSV_EXPORT_CONFIG 
} from '@/lib/utils/csv-export'

export async function GET(request) {
  try {
    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const filters = {
      startDate: searchParams.get('startDate') || '',
      endDate: searchParams.get('endDate') || '',
      type: searchParams.get('type') || '',
      supplierId: searchParams.get('supplierId') || '',
      includeItems: searchParams.get('includeItems') !== 'false'
    }

    // Handle CSV export with authentication and audit logging
    const result = await handleCsvExport(
      CSV_EXPORT_CONFIG.EXPORT_TYPES.TRANSACTIONS,
      filters,
      getTransactionsForExport,
      {
        filename: createExportFilename('transactions', filters)
      }
    )

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: result.statusCode || 500 }
      )
    }

    // Return CSV data as downloadable file
    return new NextResponse(result.csvData, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${result.filename}"`,
        'Cache-Control': 'no-cache',
        'X-Content-Type-Options': 'nosniff'
      }
    })
  } catch (error) {
    console.error('Transactions export API error:', error)
    return NextResponse.json(
      { error: 'Export failed due to server error' },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const session = await getSession()
    
    if (!session?.isAuthenticated) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { filters = {}, options = {} } = body

    // Handle CSV export
    const result = await handleCsvExport(
      CSV_EXPORT_CONFIG.EXPORT_TYPES.TRANSACTIONS,
      filters,
      getTransactionsForExport,
      {
        filename: createExportFilename('transactions', filters),
        ...options
      }
    )

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: result.statusCode || 500 }
      )
    }

    // Return success response with download info
    return NextResponse.json({
      success: true,
      filename: result.filename,
      rowCount: result.rowCount,
      message: `Successfully exported ${result.rowCount} transactions`
    })
  } catch (error) {
    console.error('Transactions export POST API error:', error)
    return NextResponse.json(
      { error: 'Export failed due to server error' },
      { status: 500 }
    )
  }
}