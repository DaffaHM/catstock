import { z } from 'zod'
import { sanitizeInput, containsMaliciousContent } from '@/lib/utils/security'

// Custom sanitization for notes
const sanitizedNotes = z.string()
  .trim()
  .transform((val) => sanitizeInput(val))
  .refine((val) => !containsMaliciousContent(val), {
    message: 'Notes contain potentially malicious content'
  })
  .refine((val) => val.length <= 1000, {
    message: 'Notes must be 1000 characters or less'
  })
  .optional()
  .nullable()

// Transaction types enum
export const TransactionType = {
  IN: 'IN',
  OUT: 'OUT',
  ADJUST: 'ADJUST',
  RETURN_IN: 'RETURN_IN',
  RETURN_OUT: 'RETURN_OUT'
}

// Base transaction item schema
export const transactionItemSchema = z.object({
  productId: z.string().min(1, 'Product is required'),
  quantity: z.number().int().positive('Quantity must be positive'),
  unitCost: z.number().positive().optional().nullable(),
  unitPrice: z.number().positive().optional().nullable()
})

// Base transaction schema
export const baseTransactionSchema = z.object({
  type: z.enum([
    TransactionType.IN,
    TransactionType.OUT,
    TransactionType.ADJUST,
    TransactionType.RETURN_IN,
    TransactionType.RETURN_OUT
  ]),
  transactionDate: z.date(),
  supplierId: z.string().optional().nullable(),
  userId: z.string().optional(), // Optional for tests, required in production
  notes: sanitizedNotes,
  items: z.array(transactionItemSchema).min(1, 'At least one item is required')
})

// Stock IN transaction schema - requires supplier and unit costs
export const stockInTransactionSchema = baseTransactionSchema.extend({
  type: z.literal(TransactionType.IN),
  supplierId: z.string().min(1, 'Supplier is required for stock in transactions'),
  items: z.array(
    transactionItemSchema.extend({
      unitCost: z.number().positive('Unit cost is required for stock in transactions')
    })
  ).min(1, 'At least one item is required')
})

// Stock OUT transaction schema - requires unit prices
export const stockOutTransactionSchema = baseTransactionSchema.extend({
  type: z.literal(TransactionType.OUT),
  items: z.array(
    transactionItemSchema.extend({
      unitPrice: z.number().positive('Unit price is required for stock out transactions')
    })
  ).min(1, 'At least one item is required')
})

// Stock ADJUST transaction schema - allows both positive and negative quantities
export const stockAdjustTransactionSchema = baseTransactionSchema.extend({
  type: z.literal(TransactionType.ADJUST),
  items: z.array(
    transactionItemSchema.extend({
      quantity: z.number().int('Quantity must be an integer') // Can be negative for adjustments
    })
  ).min(1, 'At least one item is required')
})

// Return IN transaction schema - similar to stock in
export const returnInTransactionSchema = baseTransactionSchema.extend({
  type: z.literal(TransactionType.RETURN_IN),
  items: z.array(
    transactionItemSchema.extend({
      unitCost: z.number().positive().optional().nullable()
    })
  ).min(1, 'At least one item is required')
})

// Return OUT transaction schema - similar to stock out
export const returnOutTransactionSchema = baseTransactionSchema.extend({
  type: z.literal(TransactionType.RETURN_OUT),
  items: z.array(
    transactionItemSchema.extend({
      unitPrice: z.number().positive().optional().nullable()
    })
  ).min(1, 'At least one item is required')
})

// Transaction update schema (for reference number generation)
export const transactionUpdateSchema = z.object({
  id: z.string().min(1, 'Transaction ID is required'),
  referenceNumber: z.string().optional(),
  notes: sanitizedNotes
})

// Transaction search/filter schema
export const transactionFilterSchema = z.object({
  type: z.enum([
    TransactionType.IN,
    TransactionType.OUT,
    TransactionType.ADJUST,
    TransactionType.RETURN_IN,
    TransactionType.RETURN_OUT
  ]).optional(),
  supplierId: z.string().optional(),
  productId: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(50)
})

// Stock movement calculation schema
export const stockMovementSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  transactionId: z.string().min(1, 'Transaction ID is required'),
  movementType: z.enum([
    TransactionType.IN,
    TransactionType.OUT,
    TransactionType.ADJUST,
    TransactionType.RETURN_IN,
    TransactionType.RETURN_OUT
  ]),
  quantityBefore: z.number().int().min(0, 'Quantity before must be non-negative'),
  quantityChange: z.number().int(),
  quantityAfter: z.number().int().min(0, 'Quantity after must be non-negative')
})

// Helper function to validate transaction based on type
export function validateTransactionByType(data) {
  const { type } = data
  
  switch (type) {
    case TransactionType.IN:
      return stockInTransactionSchema.parse(data)
    case TransactionType.OUT:
      return stockOutTransactionSchema.parse(data)
    case TransactionType.ADJUST:
      return stockAdjustTransactionSchema.parse(data)
    case TransactionType.RETURN_IN:
      return returnInTransactionSchema.parse(data)
    case TransactionType.RETURN_OUT:
      return returnOutTransactionSchema.parse(data)
    default:
      return baseTransactionSchema.parse(data)
  }
}

// Helper function to validate negative stock prevention
export function validateStockLevels(productId, currentStock, quantityChange, allowNegative = false) {
  const newStock = currentStock + quantityChange
  
  if (!allowNegative && newStock < 0) {
    throw new Error(`Insufficient stock. Current: ${currentStock}, Requested: ${Math.abs(quantityChange)}, Available: ${currentStock}`)
  }
  
  return newStock
}