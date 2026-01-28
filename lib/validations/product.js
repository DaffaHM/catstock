import { z } from 'zod'
import { sanitizeInput, sanitizeHtml, containsMaliciousContent } from '@/lib/utils/security'

// Custom sanitization transform
const sanitizedString = (maxLength = 200) => z.string()
  .trim()
  .min(1) // Apply min validation before transform
  .max(maxLength, `Input must be ${maxLength} characters or less`)
  .refine((val) => !containsMaliciousContent(val), {
    message: 'Input contains potentially malicious content'
  })
  .transform((val) => sanitizeInput(val))
  .refine((val) => val.length <= maxLength, {
    message: `Must be ${maxLength} characters or less`
  })

// Product validation schema
export const productSchema = z.object({
  sku: z.string()
    .trim()
    .min(1, 'SKU is required')
    .max(50, 'SKU must be 50 characters or less')
    .regex(/^[A-Z0-9-_]+$/i, 'SKU can only contain letters, numbers, hyphens, and underscores')
    .refine((val) => !containsMaliciousContent(val), {
      message: 'SKU contains potentially malicious content'
    })
    .transform((val) => sanitizeInput(val)),
  
  brand: sanitizedString(100),
  
  name: sanitizedString(200),
  
  category: sanitizedString(100),
  
  size: sanitizedString(50),
  
  unit: sanitizedString(20),
  
  // Optional fields
  purchasePrice: z.coerce.number()
    .positive('Purchase price must be positive')
    .max(99999.99, 'Purchase price too large')
    .optional()
    .nullable(),
  
  sellingPrice: z.coerce.number()
    .positive('Selling price must be positive')
    .max(99999.99, 'Selling price too large')
    .optional()
    .nullable(),
  
  minimumStock: z.coerce.number()
    .int('Minimum stock must be a whole number')
    .min(0, 'Minimum stock cannot be negative')
    .max(999999, 'Minimum stock too large')
    .optional()
    .nullable()
})

// Product update schema (allows partial updates)
export const productUpdateSchema = productSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: 'At least one field must be provided for update' }
)

// Product search/filter schema
export const productSearchSchema = z.object({
  search: z.string().optional(),
  category: z.string().optional(),
  brand: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  sortBy: z.enum(['name', 'brand', 'category', 'sku', 'createdAt']).default('name'),
  sortOrder: z.enum(['asc', 'desc']).default('asc')
})

// Product ID validation
export const productIdSchema = z.string().cuid('Invalid product ID format')

// Bulk product operations schema
export const bulkProductSchema = z.object({
  products: z.array(productSchema).min(1, 'At least one product is required').max(100, 'Maximum 100 products allowed')
})

// Product categories enum (common paint store categories)
export const PRODUCT_CATEGORIES = [
  'Interior Paint',
  'Exterior Paint',
  'Primer',
  'Stain',
  'Varnish',
  'Brushes',
  'Rollers',
  'Supplies',
  'Tools',
  'Other'
]

// Product units enum (common units for paint products)
export const PRODUCT_UNITS = [
  'Each',
  'Gallon',
  'Quart',
  'Pint',
  'Liter',
  'Set',
  'Pack'
]

// Validation helper functions
export function validateProductData(data) {
  try {
    return {
      success: true,
      data: productSchema.parse(data)
    }
  } catch (error) {
    return {
      success: false,
      errors: error.errors.reduce((acc, err) => {
        acc[err.path[0]] = err.message
        return acc
      }, {})
    }
  }
}

export function validateProductUpdate(data) {
  try {
    return {
      success: true,
      data: productUpdateSchema.parse(data)
    }
  } catch (error) {
    return {
      success: false,
      errors: error.errors.reduce((acc, err) => {
        acc[err.path[0]] = err.message
        return acc
      }, {})
    }
  }
}

export function validateProductSearch(params) {
  try {
    return {
      success: true,
      data: productSearchSchema.parse(params)
    }
  } catch (error) {
    return {
      success: false,
      errors: error.errors.reduce((acc, err) => {
        acc[err.path[0]] = err.message
        return acc
      }, {})
    }
  }
}

// Custom validation for SKU uniqueness (to be used in server actions)
export function validateSKUFormat(sku) {
  const skuRegex = /^[A-Z0-9-_]+$/i
  return skuRegex.test(sku)
}

// Price validation helpers
export function validatePriceConsistency(purchasePrice, sellingPrice) {
  if (purchasePrice && sellingPrice && purchasePrice > sellingPrice) {
    return {
      valid: false,
      message: 'Purchase price should not exceed selling price'
    }
  }
  return { valid: true }
}