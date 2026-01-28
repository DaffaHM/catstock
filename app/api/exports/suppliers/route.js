import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { getSuppliersForExport } from '@/lib/queries/csv-exports'
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
      search: searchParams.get('search') || '',
      includeTransactionStats: searchParams.get('includeTransactionStats') !== 'false'
    }

    // Handle CSV export with authentication and audit logging
    const result = await handleCsvExport(
      'suppliers', // Using string directly since it's not in the enum yet
      filters,
      getSuppliersForExport,
      {
        filename: createExportFilename('suppliers', filters)
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
    console.error('Suppliers export API error:', error)
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
      'suppliers',
      filters,
      getSuppliersForExport,
      {
        filename: createExportFilename('suppliers', filters),
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
      message: `Successfully exported ${result.rowCount} suppliers`
    })
  } catch (error) {
    console.error('Suppliers export POST API error:', error)
    return NextResponse.json(
      { error: 'Export failed due to server error' },
      { status: 500 }
    )
  }
}