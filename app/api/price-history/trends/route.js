import { NextResponse } from 'next/server'
import { getPriceTrends } from '@/lib/services/PriceHistoryManager'

// GET /api/price-history/trends - Get price trends analysis
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const productIds = searchParams.get('productIds')?.split(',') || []
    const days = parseInt(searchParams.get('days') || '30')
    
    if (productIds.length === 0) {
      return NextResponse.json(
        { error: 'At least one productId is required' },
        { status: 400 }
      )
    }
    
    // Get trends for each product
    const trendsPromises = productIds.map(productId => 
      getPriceTrends(productId, days)
    )
    
    const trendsResults = await Promise.all(trendsPromises)
    
    // Combine results
    const trends = {}
    const errors = []
    
    trendsResults.forEach((result, index) => {
      const productId = productIds[index]
      if (result.success) {
        trends[productId] = result.trends
      } else {
        errors.push({ productId, error: result.error })
      }
    })
    
    return NextResponse.json({
      success: true,
      trends,
      errors: errors.length > 0 ? errors : undefined
    })
  } catch (error) {
    console.error('Price Trends API error:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil data tren harga' },
      { status: 500 }
    )
  }
}