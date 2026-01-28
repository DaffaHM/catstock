# CatStock Setup Guide

## 🚀 Quick Setup Commands

Run these commands in order to set up your CatStock development environment:

### 1. Install Dependencies
```bash
npm install
```

### 2. Set up Database
```bash
# Generate Prisma client
npm run db:generate

# Create and setup database
npm run db:push

# Seed with sample data (owner + products)
npm run db:seed
```

### 3. Start Development Server
```bash
npm run dev
```

### 4. Access Application
- Open: `http://localhost:3000`
- Login: `owner@catstock.com` / `admin123`

## 📋 What's Included

### Project Structure Created
```
catstock/
├── app/                    # Next.js App Router
│   ├── api/auth/          # NextAuth API routes
│   ├── dashboard/         # Main dashboard
│   ├── login/            # Login page
│   ├── globals.css       # iPad-optimized styles
│   ├── layout.js         # Root layout with iPad meta tags
│   └── page.js           # Home redirect
├── components/
│   └── LoginForm.js      # Touch-friendly login form
├── lib/
│   ├── auth.js           # NextAuth configuration
│   ├── prisma.js         # Prisma singleton
│   └── utils.js          # Helper functions
├── prisma/
│   ├── schema.prisma     # Complete database schema
│   └── seed.js           # Sample data seeding
├── middleware.js         # Route protection
└── Configuration files   # Next.js, Tailwind, etc.
```

### Database Schema
- **Users**: Store owner authentication
- **Products**: 8 sample products (paints & accessories)
- **Suppliers**: 2 sample suppliers
- **Stock Transactions**: Initial inventory transactions
- **Transaction Items**: Individual transaction items
- **Stock Movements**: Historical stock tracking

### iPad Optimizations
- **Touch Targets**: 44px minimum for all interactive elements
- **Typography**: 16px+ base font size
- **Navigation**: Adaptive (sidebar/bottom based on orientation)
- **Forms**: Large inputs with touch-friendly controls
- **Layouts**: Master-detail patterns for tablet use
- **Performance**: Optimized for iPad Safari

### Security Features
- **Authentication**: NextAuth with secure sessions
- **Password Hashing**: bcryptjs with salt rounds
- **Route Protection**: Middleware-based authentication
- **CSRF Protection**: Built-in NextAuth protection
- **Security Headers**: CSP, frame-ancestors, etc.
- **Input Validation**: Ready for Zod schemas

### Sample Data Included
- **Owner Account**: owner@catstock.com / admin123
- **Products**: 8 paint store products with pricing
- **Suppliers**: 2 sample suppliers with contact info
- **Initial Stock**: Starting inventory for some products

## 🔧 Development Commands

```bash
# Development
npm run dev              # Start dev server (http://localhost:3000)
npm run build           # Build for production
npm run start           # Start production server

# Database Management
npm run db:generate     # Generate Prisma client
npm run db:push         # Push schema to database
npm run db:seed         # Seed with sample data
npm run db:studio       # Open Prisma Studio GUI
npm run db:reset        # Reset database (destructive!)

# Code Quality
npm run lint            # Run ESLint
```

## 📱 Testing on iPad

### iPad Pro 11" Testing
1. **Connect iPad to same network**
2. **Find your computer's IP address**
   ```bash
   # On Windows
   ipconfig
   
   # On Mac/Linux
   ifconfig
   ```
3. **Access from iPad Safari**
   ```
   http://YOUR_IP_ADDRESS:3000
   ```

### iPad-Specific Features to Test
- [ ] Touch targets (44px minimum)
- [ ] Landscape sidebar navigation
- [ ] Portrait bottom navigation
- [ ] Form inputs (no zoom on focus)
- [ ] Quantity steppers
- [ ] Split view layouts
- [ ] Drawer components
- [ ] Touch feedback animations

## 🚨 Troubleshooting

### Common Issues

**1. Database Connection Error**
```bash
# Solution: Reset and recreate database
npm run db:reset
npm run db:seed
```

**2. NextAuth Configuration Error**
```bash
# Check .env.local file exists and has:
NEXTAUTH_SECRET="development-secret-key-change-in-production"
NEXTAUTH_URL="http://localhost:3000"
```

**3. Prisma Client Not Generated**
```bash
# Solution: Generate Prisma client
npm run db:generate
```

**4. Port 3000 Already in Use**
```bash
# Solution: Use different port
npm run dev -- -p 3001
```

### iPad Safari Issues
- **Input Zoom**: Prevented with viewport meta tag
- **Double Scroll**: Avoided with proper container sizing
- **Touch Targets**: All buttons are 44px minimum
- **Font Size**: Base 16px prevents zoom

## 🎯 Next Steps

After setup is complete, you can:

1. **Explore the Dashboard**: Login and check the sample data
2. **Test iPad Interface**: Access from iPad and test touch interactions
3. **Review Code Structure**: Understand the tablet-first architecture
4. **Start Development**: Begin implementing additional features

## 📞 Support

If you encounter issues:
1. Check this troubleshooting guide
2. Verify all commands ran successfully
3. Check browser console for errors
4. Test on actual iPad hardware

---

**Ready to start building your paint store inventory system! 🎨**