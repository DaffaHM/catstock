import { NextResponse } from 'next/server'
import { updateReorderPointAction, bulkUpdateReorderPointsAction } from '@/lib/actions/notifications'

// PUT /api/notifications/reorder-point - Update reorder point for a product
export async function PUT(request) {
  try {
    const body = await request.json()
    const { productId, reorderPoint } = body
    
    if (!productId || typeof reorderPoint !== 'number') {
      return NextResponse.json(
        { error: 'Data tidak valid' },
        { status: 400 }
      )
    }
    
    const result = await updateReorderPointAction(productId, reorderPoint)
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message
      })
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Reorder point API error:', error)
    return NextResponse.json(
      { error: 'Gagal memperbarui reorder point' },
      { status: 500 }
    )
  }
}

// POST /api/notifications/reorder-point/bulk - Bulk update reorder points
export async function POST(request) {
  try {
    const body = await request.json()
    const { updates } = body
    
    if (!Array.isArray(updates)) {
      return NextResponse.json(
        { error: 'Data update tidak valid' },
        { status: 400 }
      )
    }
    
    const result = await bulkUpdateReorderPointsAction(updates)
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        updatedCount: result.updatedCount,
        message: result.message
      })
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Bulk reorder point API error:', error)
    return NextResponse.json(
      { error: 'Gagal memperbarui reorder points' },
      { status: 500 }
    )
  }
}