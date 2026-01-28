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

const sanitizedText = (maxLength = 2000) => z.string()
  .trim()
  .max(maxLength, `Input must be ${maxLength} characters or less`)
  .refine((val) => !containsMaliciousContent(val), {
    message: 'Input contains potentially malicious content'
  })
  .transform((val) => sanitizeHtml(val))
  .refine((val) => val.length <= maxLength, {
    message: `Must be ${maxLength} characters or less`
  })

// Supplier validation schema
export const supplierSchema = z.object({
  name: sanitizedString(200),
  
  // Optional contact information
  contact: sanitizedText(500)
    .optional()
    .nullable(),
  
  // Optional notes
  notes: sanitizedText(2000)
    .optional()
    .nullable()
})

// Supplier update schema (allows partial updates)
export const supplierUpdateSchema = supplierSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: 'At least one field must be provided for update' }
)

// Supplier search/filter schema
export const supplierSearchSchema = z.object({
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  sortBy: z.enum(['name', 'createdAt', 'updatedAt']).default('name'),
  sortOrder: z.enum(['asc', 'desc']).default('asc')
})

// Supplier ID validation
export const supplierIdSchema = z.string().cuid('Invalid supplier ID format')

// Bulk supplier operations schema
export const bulkSupplierSchema = z.object({
  suppliers: z.array(supplierSchema).min(1, 'At least one supplier is required').max(100, 'Maximum 100 suppliers allowed')
})

// Validation helper functions
export function validateSupplierData(data) {
  try {
    return {
      success: true,
      data: supplierSchema.parse(data)
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

export function validateSupplierUpdate(data) {
  try {
    return {
      success: true,
      data: supplierUpdateSchema.parse(data)
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

export function validateSupplierSearch(params) {
  try {
    return {
      success: true,
      data: supplierSearchSchema.parse(params)
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

// Contact validation helpers
export function validateContactFormat(contact) {
  if (!contact) return { valid: true }
  
  // Basic validation for common contact formats
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  
  const lines = contact.split('\n').map(line => line.trim()).filter(Boolean)
  
  for (const line of lines) {
    // Extract potential email from line (look for email pattern)
    const emailMatch = line.match(/\S+@\S+\.\S+/)
    if (emailMatch) {
      const email = emailMatch[0]
      // Check if the entire matched email is valid
      if (!emailRegex.test(email)) {
        return {
          valid: false,
          message: 'Invalid email format detected in contact information'
        }
      }
    }
    
    // Basic phone validation (very permissive)
    const phoneCandidate = line.replace(/[\s\-\(\)\.]/g, '')
    if (phoneCandidate.match(/^\+?\d+$/) && phoneCandidate.length > 15) {
      return {
        valid: false,
        message: 'Phone number appears too long in contact information'
      }
    }
  }
  
  return { valid: true }
}

// Supplier name uniqueness helper (to be used in server actions)
export function normalizeSupplierName(name) {
  return name.trim().toLowerCase()
}