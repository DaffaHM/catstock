import { notFound } from 'next/navigation'
import { getProductAction } from '@/lib/actions/products'
import { getProductStockCard } from '@/lib/actions/transactions'
import ProductStockCardPage from '@/components/reports/ProductStockCardPage'

export default async function StockCardPage({ params, searchParams }) {
  const { id } = params
  
  try {
    // Get product details
    const productResult = await getProductAction(id)
    
    if (!productResult.success) {
      notFound()
    }

    const product = productResult.data

    // Prepare filters from search params
    const filters = {
      startDate: searchParams.startDate || '',
      endDate: searchParams.endDate || '',
      transactionType: searchParams.transactionType || '',
      page: parseInt(searchParams.page) || 1,
      limit: 50
    }

    // Convert date strings to Date objects if provided
    const stockCardFilters = { ...filters }
    if (stockCardFilters.startDate) {
      stockCardFilters.startDate = new Date(stockCardFilters.startDate)
    }
    if (stockCardFilters.endDate) {
      stockCardFilters.endDate = new Date(stockCardFilters.endDate)
    }

    // Get initial stock card data
    const stockCardResult = await getProductStockCard(id, stockCardFilters)
    
    if (!stockCardResult.success) {
      throw new Error(stockCardResult.error || 'Failed to load stock card data')
    }

    return (
      <ProductStockCardPage
        product={product}
        initialData={stockCardResult.data}
        searchParams={searchParams}
      />
    )
  } catch (error) {
    console.error('Stock card page error:', error)
    notFound()
  }
}

export async function generateMetadata({ params }) {
  const { id } = params
  
  try {
    const productResult = await getProductAction(id)
    
    if (!productResult.success) {
      return {
        title: 'Product Not Found'
      }
    }

    const product = productResult.data

    return {
      title: `Stock Card - ${product.brand} ${product.name} | CatStock`,
      description: `View stock movement history and transaction timeline for ${product.brand} ${product.name} (SKU: ${product.sku})`
    }
  } catch (error) {
    return {
      title: 'Stock Card | CatStock'
    }
  }
}