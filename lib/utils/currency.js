/**
 * Format number as Indonesian Rupiah currency
 * @param {number} amount - The amount to format
 * @param {boolean} showSymbol - Whether to show the Rp symbol (default: true)
 * @returns {string} Formatted currency string
 */
export function formatRupiah(amount, showSymbol = true) {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return showSymbol ? 'Rp 0' : '0'
  }

  const formatter = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })

  if (showSymbol) {
    return formatter.format(amount)
  } else {
    return formatter.format(amount).replace('Rp', '').trim()
  }
}

/**
 * Format number as Indonesian number format (with thousand separators)
 * @param {number} number - The number to format
 * @returns {string} Formatted number string
 */
export function formatNumber(number) {
  if (number === null || number === undefined || isNaN(number)) {
    return '0'
  }

  return new Intl.NumberFormat('id-ID').format(number)
}

/**
 * Parse Indonesian formatted currency string to number
 * @param {string} currencyString - The currency string to parse
 * @returns {number} Parsed number
 */
export function parseRupiah(currencyString) {
  if (!currencyString || typeof currencyString !== 'string') {
    return 0
  }

  // Remove currency symbol and spaces, then replace dots with empty string
  const cleanString = currencyString
    .replace(/Rp/g, '')
    .replace(/\s/g, '')
    .replace(/\./g, '')
    .replace(/,/g, '.')

  const parsed = parseFloat(cleanString)
  return isNaN(parsed) ? 0 : parsed
}

/**
 * Format price range
 * @param {number} minPrice - Minimum price
 * @param {number} maxPrice - Maximum price
 * @returns {string} Formatted price range
 */
export function formatPriceRange(minPrice, maxPrice) {
  if (minPrice === maxPrice) {
    return formatRupiah(minPrice)
  }
  return `${formatRupiah(minPrice)} - ${formatRupiah(maxPrice)}`
}

/**
 * Calculate percentage and format it
 * @param {number} value - Current value
 * @param {number} total - Total value
 * @returns {string} Formatted percentage
 */
export function formatPercentage(value, total) {
  if (!total || total === 0) {
    return '0%'
  }
  
  const percentage = (value / total) * 100
  return `${percentage.toFixed(1)}%`
}

/**
 * Format discount amount
 * @param {number} originalPrice - Original price
 * @param {number} discountedPrice - Discounted price
 * @returns {object} Object with discount amount and percentage
 */
export function calculateDiscount(originalPrice, discountedPrice) {
  const discountAmount = originalPrice - discountedPrice
  const discountPercentage = (discountAmount / originalPrice) * 100
  
  return {
    amount: formatRupiah(discountAmount),
    percentage: `${discountPercentage.toFixed(1)}%`,
    rawAmount: discountAmount,
    rawPercentage: discountPercentage
  }
}