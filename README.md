# CatStock - Paint Store Inventory Management

A modern, tablet-first inventory management system designed specifically for paint stores, optimized for iPad Pro 11-inch devices.

## 🎯 Features

- **Tablet-First Design**: Optimized for iPad Pro 11" with touch-friendly interfaces
- **Inventory Management**: Complete product catalog with SKU tracking
- **Stock Transactions**: IN, OUT, ADJUST, RETURN operations with atomic processing
- **Supplier Management**: Track vendors and supplier relationships
- **Real-time Reports**: Stock levels, transaction history, and analytics
- **CSV Export**: Export data for external use
- **Secure Authentication**: Single-user system with secure session management

## 🛠 Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, Tailwind CSS
- **Backend**: Next.js API Routes, Server Actions
- **Database**: SQLite (development), PostgreSQL (production)
- **ORM**: Prisma
- **Authentication**: NextAuth.js with credentials provider
- **Validation**: Zod schemas
- **Styling**: Tailwind CSS with iPad-optimized components

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone and install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Update `.env.local` with your configuration:
   ```env
   DATABASE_URL="file:./dev.db"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here"
   NODE_ENV="development"
   ```

3. **Set up the database**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Push schema to database
   npm run db:push
   
   # Seed with sample data
   npm run db:seed
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   - Navigate to `http://localhost:3000`
   - Login with: `owner@catstock.com` / `admin123`

## 📱 iPad Optimization

### Target Device
- **Primary**: iPad Pro 11-inch (M2) in Safari
- **Secondary**: Desktop and mobile (responsive)

### UI Guidelines
- **Touch Targets**: Minimum 44px for all interactive elements
- **Typography**: Base font size 16px+ for readability
- **Navigation**: 
  - Landscape: Collapsible sidebar with icons and labels
  - Portrait: Bottom tab navigation
- **Layout**: Master-detail pattern for products and transactions
- **Forms**: Large inputs, clear labels, quantity steppers
- **Tables**: Sticky headers, essential columns, expandable rows

### Performance Features
- Server-side pagination for large datasets
- Optimized Prisma queries with select statements
- Minimal client-side JavaScript
- Safe caching with proper invalidation
- Fast loading on iPad Safari

## 🗂 Project Structure

```
catstock/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard pages
│   ├── login/            # Authentication
│   ├── globals.css       # Global styles
│   ├── layout.js         # Root layout
│   └── page.js           # Home page
├── components/            # React components
├── lib/                  # Utilities and configurations
│   ├── auth.js           # NextAuth configuration
│   ├── prisma.js         # Prisma client
│   └── utils.js          # Helper functions
├── prisma/               # Database schema and migrations
│   ├── schema.prisma     # Database schema
│   └── seed.js           # Database seeding
├── middleware.js         # Route protection
└── tailwind.config.js    # Tailwind configuration
```

## 🔐 Security Features

- **Authentication**: Secure session management with httpOnly cookies
- **Input Validation**: Server-side validation with Zod schemas
- **CSRF Protection**: Built-in NextAuth CSRF protection
- **Rate Limiting**: Login attempt limiting
- **SQL Injection Prevention**: Prisma ORM protection
- **XSS Prevention**: Proper content escaping
- **Security Headers**: CSP, frame-ancestors, referrer-policy

## 📊 Database Schema

### Core Models
- **User**: Store owner authentication
- **Product**: Inventory items with SKU, pricing, stock levels
- **Supplier**: Vendor information and contacts
- **StockTransaction**: All inventory movements
- **TransactionItem**: Individual items in transactions
- **StockMovement**: Historical stock level tracking

### Transaction Types
- `IN`: Stock incoming (purchases)
- `OUT`: Stock outgoing (sales)
- `ADJUST`: Stock adjustments (inventory counts)
- `RETURN_IN`: Returns from customers
- `RETURN_OUT`: Returns to suppliers

## 🛠 Development Commands

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server

# Database
npm run db:generate     # Generate Prisma client
npm run db:push         # Push schema changes
npm run db:seed         # Seed database with sample data
npm run db:studio       # Open Prisma Studio
npm run db:reset        # Reset database (destructive)

# Utilities
npm run lint            # Run ESLint
```

## 🚀 Production Deployment

### Environment Setup
1. **Database**: Switch to PostgreSQL
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/catstock"
   ```

2. **Security**: Update secrets
   ```env
   NEXTAUTH_SECRET="secure-random-string-for-production"
   NEXTAUTH_URL="https://your-domain.com"
   ```

3. **Build and Deploy**
   ```bash
   npm run build
   npm run start
   ```

### Deployment Checklist
- [ ] Update environment variables
- [ ] Configure PostgreSQL database
- [ ] Set up SSL certificates
- [ ] Configure security headers
- [ ] Test on actual iPad Pro 11"
- [ ] Verify touch interactions
- [ ] Test offline behavior
- [ ] Monitor performance metrics

## 📋 iPad UI Compliance Checklist

- [ ] All buttons minimum 44px touch targets
- [ ] Font size 16px+ throughout application
- [ ] Sidebar navigation in landscape mode
- [ ] Bottom navigation in portrait mode
- [ ] Master-detail split views for products/transactions
- [ ] Quantity steppers for numeric inputs
- [ ] Drawer/sheet components instead of modals
- [ ] Sticky table headers with essential columns
- [ ] No double-scroll issues in Safari
- [ ] Touch feedback animations
- [ ] Proper safe area handling

## 🔧 Troubleshooting

### Common Issues

1. **Database Connection**
   ```bash
   # Reset database if corrupted
   npm run db:reset
   npm run db:seed
   ```

2. **Authentication Issues**
   ```bash
   # Clear browser cookies and restart
   # Check NEXTAUTH_SECRET is set
   ```

3. **iPad Safari Issues**
   - Ensure viewport meta tag is correct
   - Check for double-scroll containers
   - Verify touch targets are 44px minimum

### Performance Optimization
- Use React DevTools Profiler
- Monitor Prisma query performance
- Check bundle size with `npm run build`
- Test on actual iPad hardware

## 📄 License

This project is private and proprietary.

## 🤝 Support

For support and questions, please contact the development team.