import { NextResponse } from 'next/server'
import { bulkUpdatePrices } from '@/lib/services/PriceHistoryManager'

// POST /api/price-history/bulk-update - Bulk update prices with history tracking
export async function POST(request) {
  try {
    const body = await request.json()
    const { updates, reason = 'Bulk price update' } = body
    
    if (!Array.isArray(updates) || updates.length === 0) {
      return NextResponse.json(
        { error: 'Updates array is required and must not be empty' },
        { status: 400 }
      )
    }
    
    // Validate each update
    for (const update of updates) {
      if (!update.productId || typeof update.purchasePrice !== 'number' || typeof update.sellingPrice !== 'number') {
        return NextResponse.json(
          { error: 'Each update must have productId, purchasePrice, and sellingPrice' },
          { status: 400 }
        )
      }
    }
    
    const result = await bulkUpdatePrices(updates, reason)
    
    if (result.success) {
      return NextResponse.json(result)
    } else {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Bulk Price Update API error:', error)
    return NextResponse.json(
      { error: 'Gagal memperbarui harga secara massal' },
      { status: 500 }
    )
  }
}