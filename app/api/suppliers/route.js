import { NextResponse } from 'next/server'
import { getSuppliersAction, createSupplierAction } from '@/lib/actions/suppliers'

// GET /api/suppliers - Get all suppliers with search and filtering
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const sortBy = searchParams.get('sortBy') || 'name'
    const sortOrder = searchParams.get('sortOrder') || 'asc'
    
    const result = await getSuppliersAction({
      search,
      page,
      limit,
      sortBy,
      sortOrder
    })
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        suppliers: result.suppliers,
        pagination: result.pagination
      })
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Suppliers API GET error:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil data pemasok' },
      { status: 500 }
    )
  }
}

// POST /api/suppliers - Create new supplier
export async function POST(request) {
  try {
    const body = await request.json()
    const { name, contact, notes } = body
    
    // Create FormData to match the action signature
    const formData = new FormData()
    formData.append('name', name)
    if (contact) formData.append('contact', contact)
    if (notes) formData.append('notes', notes)
    
    const result = await createSupplierAction({}, formData)
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        supplier: result.supplier
      })
    } else {
      return NextResponse.json(
        { 
          error: result.error,
          errors: result.errors,
          fields: result.fields
        },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Suppliers API POST error:', error)
    return NextResponse.json(
      { error: 'Gagal membuat pemasok' },
      { status: 500 }
    )
  }
}