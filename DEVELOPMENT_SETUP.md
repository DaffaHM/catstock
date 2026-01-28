# CatStock Development Environment Setup

This guide provides comprehensive instructions for setting up the CatStock inventory management application for development and deployment.

## Prerequisites

### Required Software
- **Node.js** (v18.0.0 or higher)
- **npm** (v8.0.0 or higher) or **yarn** (v1.22.0 or higher)
- **Git** (v2.30.0 or higher)

### Development Tools (Recommended)
- **VS Code** with extensions:
  - ES7+ React/Redux/React-Native snippets
  - Prettier - Code formatter
  - ESLint
  - Tailwind CSS IntelliSense
  - Prisma

## Environment Configuration

### 1. Clone the Repository
```bash
git clone <repository-url>
cd catstock
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
```

### 3. Environment Variables Setup

#### Development Environment
Create a `.env.local` file in the root directory:

```env
# Database Configuration
DATABASE_URL="file:./dev.db"

# Authentication
JWT_SECRET="development-jwt-secret-key-change-in-production-min-32-chars"

# Application Settings
NODE_ENV="development"
```

#### Production Environment
Create a `.env.production` file for production deployment:

```env
# Database Configuration (PostgreSQL)
DATABASE_URL="postgresql://username:password@localhost:5432/catstock"

# Authentication (Generate a secure secret)
JWT_SECRET="your-secure-jwt-secret-key-minimum-32-characters-long"

# Application Settings
NODE_ENV="production"
```

### 4. Database Setup

#### Development (SQLite)
```bash
# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate dev --name init

# Seed the database with sample data
npx prisma db seed
```

#### Production (PostgreSQL)
```bash
# Install PostgreSQL and create database
createdb catstock

# Set production DATABASE_URL
export DATABASE_URL="postgresql://username:password@localhost:5432/catstock"

# Run migrations
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate

# Seed production database (optional)
npx prisma db seed
```

## Development Commands

### Start Development Server
```bash
npm run dev
# or
yarn dev
```
The application will be available at `http://localhost:3000`

### Database Management
```bash
# View database in Prisma Studio
npx prisma studio

# Reset database (development only)
npx prisma migrate reset

# Create new migration
npx prisma migrate dev --name migration_name

# Apply migrations (production)
npx prisma migrate deploy
```

### Testing
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- --testPathPatterns="auth"
```

### Code Quality
```bash
# Run ESLint
npm run lint

# Fix ESLint issues
npm run lint:fix

# Format code with Prettier
npm run format

# Type checking (if using TypeScript)
npm run type-check
```

## iPad Testing Setup

### Local Network Testing
1. Find your local IP address:
   ```bash
   # Windows
   ipconfig
   
   # macOS/Linux
   ifconfig
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Access from iPad Safari:
   ```
   http://YOUR_LOCAL_IP:3000
   ```

### iPad Safari Developer Tools
1. Enable Web Inspector on iPad:
   - Settings → Safari → Advanced → Web Inspector
2. Connect iPad to Mac via USB
3. Open Safari on Mac → Develop → [iPad Name] → localhost

## Production Deployment

### Build for Production
```bash
# Create production build
npm run build

# Start production server
npm start
```

### Environment-Specific Database Configuration

The application automatically uses the appropriate database based on the environment:

- **Development**: SQLite (`file:./dev.db`)
- **Production**: PostgreSQL (configured via `DATABASE_URL`)

### Deployment Checklist
- [ ] Set secure `JWT_SECRET` (minimum 32 characters)
- [ ] Configure production `DATABASE_URL`
- [ ] Run database migrations: `npx prisma migrate deploy`
- [ ] Build application: `npm run build`
- [ ] Set `NODE_ENV=production`
- [ ] Configure reverse proxy (nginx/Apache)
- [ ] Set up SSL certificates
- [ ] Configure firewall rules
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy

## Security Configuration

### JWT Secret Generation
Generate a secure JWT secret:
```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Using OpenSSL
openssl rand -hex 32
```

### Database Security
- Use strong passwords for database connections
- Restrict database access to application server only
- Enable SSL/TLS for database connections in production
- Regular database backups with encryption

### Application Security
- Keep dependencies updated: `npm audit fix`
- Use HTTPS in production
- Configure proper CORS settings
- Implement rate limiting
- Regular security audits

## Troubleshooting

### Common Issues

#### Database Connection Errors
```bash
# Check if DATABASE_URL is set correctly
echo $DATABASE_URL

# Regenerate Prisma client
npx prisma generate

# Reset database (development only)
npx prisma migrate reset
```

#### Port Already in Use
```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>

# Or use different port
npm run dev -- -p 3001
```

#### Node Modules Issues
```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### Prisma Issues
```bash
# Clear Prisma cache
npx prisma generate --force

# Reset Prisma client
rm -rf node_modules/.prisma
npx prisma generate
```

### Performance Issues
- Check database query performance with Prisma Studio
- Monitor memory usage during development
- Use React DevTools for component performance
- Enable Next.js bundle analyzer: `npm run analyze`

## Development Workflow

### Git Workflow
1. Create feature branch: `git checkout -b feature/feature-name`
2. Make changes and commit: `git commit -m "feat: description"`
3. Run tests: `npm test`
4. Push branch: `git push origin feature/feature-name`
5. Create pull request

### Code Standards
- Use ESLint and Prettier for code formatting
- Follow conventional commit messages
- Write tests for new features
- Update documentation for API changes
- Use semantic versioning for releases

### Database Changes
1. Modify `prisma/schema.prisma`
2. Create migration: `npx prisma migrate dev --name change_description`
3. Update seed data if necessary
4. Test migration on clean database
5. Commit schema and migration files

## Additional Resources

### Documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Jest Testing Framework](https://jestjs.io/docs)

### iPad Development
- [Safari Web Inspector Guide](https://webkit.org/web-inspector/)
- [iOS Safari Developer Guide](https://developer.apple.com/safari/tools/)
- [Touch Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/ios/user-interaction/touch/)

### Security Resources
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security](https://nextjs.org/docs/advanced-features/security-headers)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)

## Support

For development issues:
1. Check this documentation
2. Search existing issues in the repository
3. Create a new issue with detailed description
4. Include environment information and error logs