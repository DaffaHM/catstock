import { NextResponse } from 'next/server'
import { getAveragePrices } from '@/lib/services/PriceHistoryManager'

// GET /api/price-history/averages - Get average prices for products
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
    
    // Get averages for each product
    const averagesPromises = productIds.map(productId => 
      getAveragePrices(productId, days)
    )
    
    const averagesResults = await Promise.all(averagesPromises)
    
    // Combine results
    const averages = {}
    const errors = []
    
    averagesResults.forEach((result, index) => {
      const productId = productIds[index]
      if (result.success) {
        averages[productId] = result.averages
      } else {
        errors.push({ productId, error: result.error })
      }
    })
    
    return NextResponse.json({
      success: true,
      averages,
      errors: errors.length > 0 ? errors : undefined
    })
  } catch (error) {
    console.error('Price Averages API error:', error)
    return NextResponse.json(
      { error: 'Gagal mengambil data rata-rata harga' },
      { status: 500 }
    )
  }
}