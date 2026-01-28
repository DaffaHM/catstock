# Requirements Document

## Introduction

CatStock is a full-stack inventory management web application designed specifically for paint stores with a single user. The system is optimized primarily for iPad Pro 11-inch (M2) in Safari with touch interface while maintaining responsiveness across desktop and mobile devices. The application provides comprehensive inventory tracking, supplier management, stock transactions, and reporting capabilities with a focus on tablet-first user experience and robust security.

## Glossary

- **System**: The CatStock inventory management application
- **User**: The single authenticated paint store owner/manager
- **Product**: An inventory item with brand, name, category, size, SKU, and pricing information
- **Supplier**: A vendor that provides products to the paint store
- **Stock_Transaction**: A record of inventory movement (IN, OUT, ADJUST, RETURN_IN, RETURN_OUT)
- **Movement_Type**: The type of stock transaction (IN, OUT, ADJUST, RETURN_IN, RETURN_OUT)
- **Stock_Level**: Current quantity of a product in inventory
- **Transaction_Cart**: Temporary collection of items being processed in a transaction
- **Touch_Target**: Interactive UI element sized for touch input (minimum 44px)
- **Split_View**: Master-detail layout pattern showing list and detail panels simultaneously
- **Stock_Card**: Historical view of all transactions for a specific product

## Requirements

### Requirement 1: User Authentication and Security

**User Story:** As a paint store owner, I want secure access to my inventory system, so that my business data remains protected and only I can manage the inventory.

#### Acceptance Criteria

1. WHEN a user attempts to access the application without authentication, THE System SHALL redirect them to the login page
2. WHEN a user provides valid credentials, THE System SHALL create a secure session using httpOnly cookies
3. WHEN a user provides invalid credentials, THE System SHALL reject the login and implement rate limiting after multiple failed attempts
4. WHEN a user session expires, THE System SHALL require re-authentication before allowing access to protected resources
5. THE System SHALL hash all passwords using argon2 or bcrypt before storing them in the database
6. THE System SHALL implement CSRF protection for all state-changing operations
7. THE System SHALL apply rate limiting to login endpoints and other sensitive operations
8. THE System SHALL protect all private pages using authentication middleware

### Requirement 2: Product Management

**User Story:** As a paint store owner, I want to manage my product catalog, so that I can track all items in my inventory with accurate details and pricing.

#### Acceptance Criteria

1. WHEN a user creates a new product, THE System SHALL require brand, name, category, size/packaging, unit, and unique SKU fields
2. WHEN a user attempts to create a product with a duplicate SKU, THE System SHALL prevent the creation and display an error message
3. WHEN a user searches for products, THE System SHALL perform server-side search across brand, name, category, and SKU fields
4. WHEN a user views the product list on iPad in landscape mode, THE System SHALL display products in a split view with list on left and detail/edit panel on right
5. THE System SHALL support server-side filtering, sorting, and pagination for product lists
6. WHEN a user updates product information, THE System SHALL validate all required fields and maintain SKU uniqueness
7. WHEN a user deletes a product, THE System SHALL prevent deletion if the product has associated stock transactions
8. THE System SHALL store optional purchase price, selling price, and minimum stock level for each product

### Requirement 3: Supplier Management

**User Story:** As a paint store owner, I want to manage my supplier information, so that I can track which vendors provide specific products and maintain contact details.

#### Acceptance Criteria

1. WHEN a user creates a new supplier, THE System SHALL require a supplier name and allow optional contact information and notes
2. WHEN a user searches for suppliers, THE System SHALL perform server-side search across supplier name and contact fields
3. THE System SHALL support full CRUD operations (create, read, update, delete) for suppliers
4. WHEN a user deletes a supplier, THE System SHALL prevent deletion if the supplier has associated stock transactions
5. THE System SHALL maintain supplier data integrity across all related transactions

### Requirement 4: Stock Transaction System

**User Story:** As a paint store owner, I want to record all inventory movements, so that I can maintain accurate stock levels and track the history of each product.

#### Acceptance Criteria

1. WHEN a user creates a stock transaction, THE System SHALL require movement type (IN, OUT, ADJUST, RETURN_IN, RETURN_OUT), date, and at least one product item
2. WHEN a user processes a stock OUT transaction, THE System SHALL prevent negative stock levels by default
3. WHEN a user saves a transaction, THE System SHALL use atomic database transactions to ensure data consistency
4. THE System SHALL automatically generate unique reference numbers for each transaction
5. WHEN a user adds items to a transaction, THE System SHALL support product autocomplete and quantity stepper controls
6. THE System SHALL calculate running stock balances after each transaction
7. WHEN a user performs a stock adjustment, THE System SHALL calculate the difference between actual and system stock
8. THE System SHALL store optional unit cost for IN transactions and unit price for OUT transactions
9. THE System SHALL maintain transaction history with timestamps and prevent modification of completed transactions

### Requirement 5: iPad-Optimized User Interface

**User Story:** As a paint store owner using an iPad Pro 11-inch, I want a touch-friendly interface optimized for tablet use, so that I can efficiently manage inventory with touch gestures and comfortable layouts.

#### Acceptance Criteria

1. WHEN the application loads on iPad in landscape mode, THE System SHALL display a collapsible sidebar with icon and label navigation
2. WHEN the application loads on iPad in portrait mode, THE System SHALL display bottom/tab navigation
3. THE System SHALL ensure all interactive elements have minimum 44px touch targets
4. WHEN displaying tables on iPad, THE System SHALL use sticky headers, show essential columns, and provide expandable rows for additional details
5. WHEN displaying forms on iPad, THE System SHALL use large input fields, clear labels, and auto-scroll to validation errors
6. WHEN processing transactions on iPad, THE System SHALL display a right drawer for the transaction cart with a prominent "Save Transaction" button
7. THE System SHALL prefer drawers and side panels over modal dialogs for better touch interaction
8. THE System SHALL use a base font size of 16px or larger for optimal readability
9. THE System SHALL avoid double scroll issues in iPad Safari by proper container sizing
10. WHEN displaying master-detail views, THE System SHALL show both list and detail panels simultaneously in landscape mode

### Requirement 6: Stock Transaction Pages

**User Story:** As a paint store owner, I want dedicated pages for different types of stock transactions, so that I can efficiently process inventory movements with appropriate workflows for each transaction type.

#### Acceptance Criteria

1. WHEN a user accesses the Stock In page, THE System SHALL provide supplier selection, date picker, and item addition with autocomplete, quantity stepper, and purchase price fields
2. WHEN a user accesses the Stock Out page, THE System SHALL provide item addition with autocomplete, quantity stepper, and selling price fields
3. WHEN a user accesses the Stock Adjustment page, THE System SHALL allow input of actual stock quantities and automatically calculate adjustment differences
4. WHEN a user accesses the Returns page, THE System SHALL provide return type selection (RETURN_IN/RETURN_OUT) and item quantity inputs
5. THE System SHALL maintain a transaction cart/item list in a right drawer with running totals and item management
6. WHEN a user completes a transaction, THE System SHALL validate all required fields before saving
7. THE System SHALL provide clear visual feedback during transaction processing and confirmation upon completion

### Requirement 7: Reporting and Analytics

**User Story:** As a paint store owner, I want comprehensive reports on my inventory, so that I can make informed business decisions and monitor stock levels effectively.

#### Acceptance Criteria

1. WHEN a user views the current stock report, THE System SHALL display all products with current quantities and highlight items below minimum stock levels
2. WHEN a user views a product's stock card, THE System SHALL display a chronological timeline of all transactions with running balance calculations
3. WHEN a user generates sales/purchase summaries, THE System SHALL allow filtering by date period and display relevant totals
4. WHEN price data is available, THE System SHALL calculate and display gross profit information in reports
5. THE System SHALL provide real-time stock level updates across all reports
6. THE System SHALL support server-side report generation to handle large datasets efficiently

### Requirement 8: Data Export Functionality

**User Story:** As a paint store owner, I want to export my data to CSV format, so that I can use the information in external systems or for backup purposes.

#### Acceptance Criteria

1. WHEN a user requests data export, THE System SHALL require authentication before processing the request
2. THE System SHALL support CSV export for Products, Stock Movements, and Summary reports
3. WHEN exporting large datasets, THE System SHALL use streaming to prevent memory issues and timeouts
4. THE System SHALL include appropriate headers and formatting in exported CSV files
5. THE System SHALL log all export activities for audit purposes

### Requirement 9: Performance Optimization

**User Story:** As a paint store owner using various devices, I want fast application performance, so that I can work efficiently without delays or performance issues.

#### Acceptance Criteria

1. THE System SHALL implement server-side pagination for all list views to handle large datasets
2. THE System SHALL use database indexes on frequently queried fields (SKU, productId, movementDate, createdAt)
3. THE System SHALL optimize Prisma queries using select statements to avoid overfetching data
4. THE System SHALL implement safe caching for dashboard data with appropriate revalidation and cache invalidation after transactions
5. THE System SHALL minimize client-side JavaScript to only interactive components (drawer, toast, forms)
6. WHEN displaying charts or complex visualizations, THE System SHALL use lightweight libraries and implement lazy loading
7. THE System SHALL maintain fast performance specifically on iPad Safari browser

### Requirement 10: Security Hardening

**User Story:** As a paint store owner, I want my application to be secure against common web vulnerabilities, so that my business data and system integrity are protected.

#### Acceptance Criteria

1. THE System SHALL validate all user inputs using Zod validation on the server side
2. THE System SHALL prevent XSS attacks by avoiding dangerouslySetInnerHTML and properly escaping user content
3. THE System SHALL prevent SQL injection attacks by using Prisma ORM for all database operations
4. THE System SHALL implement security headers including basic CSP, frame-ancestors, and referrer-policy
5. THE System SHALL never expose secrets or sensitive configuration to the client side
6. WHEN errors occur, THE System SHALL display generic error messages to users while logging detailed information server-side only
7. THE System SHALL implement rate limiting and basic account lockout for login brute force protection
8. THE System SHALL use secure session management with httpOnly cookies and appropriate expiration

### Requirement 11: Development and Deployment Setup

**User Story:** As a developer, I want clear setup instructions and proper development environment configuration, so that I can efficiently develop, test, and deploy the CatStock application.

#### Acceptance Criteria

1. THE System SHALL provide a complete project folder structure following Next.js best practices
2. THE System SHALL include a comprehensive Prisma schema with all required models and relationships
3. THE System SHALL provide database seeding with owner account and sample products for development
4. THE System SHALL include clear local development setup guide with environment configuration
5. THE System SHALL provide security and performance checklists for deployment readiness
6. THE System SHALL include iPad UI compliance checklist covering touch targets, split views, navigation patterns, and form controls
7. THE System SHALL use SQLite for development and PostgreSQL for production environments