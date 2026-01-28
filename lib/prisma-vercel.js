import { PrismaClient } from '@prisma/client'

// Vercel-compatible Prisma client with fallback
const globalForPrisma = globalThis

// Create Prisma client with fallback for missing DATABASE_URL
function createPrismaClient() {
  // Default SQLite URL for Vercel if DATABASE_URL is not set
  const databaseUrl = process.env.DATABASE_URL || 'file:./tmp/vercel.db'
  
  return new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl
      }
    },
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
  })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma