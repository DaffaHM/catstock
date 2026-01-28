import { z } from 'zod'

// Category validation schemas
export const categorySchema = z.object({
  name: z.string()
    .min(1, 'Nama kategori harus diisi')
    .max(100, 'Nama kategori maksimal 100 karakter')
    .trim(),
  parentId: z.string().optional().nullable()
})

export const categoryUpdateSchema = z.object({
  name: z.string()
    .min(1, 'Nama kategori harus diisi')
    .max(100, 'Nama kategori maksimal 100 karakter')
    .trim()
    .optional(),
  parentId: z.string().optional().nullable()
})

export const categoryIdSchema = z.string().cuid('ID kategori tidak valid')

export const categorySearchSchema = z.object({
  search: z.string().optional(),
  parentId: z.string().optional().nullable(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
  sortBy: z.enum(['name', 'createdAt', 'updatedAt']).default('name'),
  sortOrder: z.enum(['asc', 'desc']).default('asc')
})

// Validation helper functions
export function validateCategoryData(data) {
  try {
    const validatedData = categorySchema.parse(data)
    return { success: true, data: validatedData }
  } catch (error) {
    const errors = {}
    error.errors.forEach(err => {
      errors[err.path[0]] = err.message
    })
    return { success: false, errors }
  }
}

export function validateCategoryUpdate(data) {
  try {
    const validatedData = categoryUpdateSchema.parse(data)
    return { success: true, data: validatedData }
  } catch (error) {
    const errors = {}
    error.errors.forEach(err => {
      errors[err.path[0]] = err.message
    })
    return { success: false, errors }
  }
}

export function validateCategorySearch(params) {
  try {
    const validatedParams = categorySearchSchema.parse(params)
    return { success: true, data: validatedParams }
  } catch (error) {
    return { success: false, errors: error.errors }
  }
}

// Helper function to normalize category name
export function normalizeCategoryName(name) {
  return name.trim().toLowerCase()
}