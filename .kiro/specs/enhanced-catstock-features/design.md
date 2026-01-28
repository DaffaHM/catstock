# Design Document: Enhanced CatStock Features

## Overview

The Enhanced CatStock Features design extends the existing CatStock inventory management system with advanced functionality to create a production-ready solution. The design maintains the existing Next.js/React architecture with Prisma ORM and SQLite/PostgreSQL database while adding sophisticated features for category management, advanced search, automated notifications, price tracking, batch operations, enhanced reporting, and system administration.

The design follows the established iPad-first approach with responsive mobile support, emphasizing touch-friendly interfaces and efficient data management. Key architectural principles include maintaining data consistency, providing real-time updates, supporting bulk operations, and ensuring scalable performance as inventory grows.

## Architecture

### System Architecture Overview

The enhanced system builds upon the existing three-tier architecture:

1. **Presentation Layer**: Next.js React components with enhanced UI patterns
2. **Business Logic Layer**: API routes with expanded business rules and validation
3. **Data Layer**: Extended Prisma schema with new entities and relationships

### Key Architectural Patterns

**Observer Pattern for Notifications**: Implements a notification system that monitors inventory changes and triggers alerts based on configurable thresholds. The system uses event-driven architecture to decouple notification logic from core business operations.

**Strategy Pattern for Search**: Provides multiple search strategies (exact match, fuzzy search, category-based) that can be selected based on user preferences and data types. This allows for optimized search performance across different scenarios.

**Command Pattern for Batch Operations**: Encapsulates bulk operations as command objects that can be queued, validated, and executed atomically. This ensures data consistency during large-scale updates and provides rollback capabilities.

**Repository Pattern for Data Access**: Abstracts data access logic behind repository interfaces, making it easier to implement caching, audit logging, and data validation consistently across all entities.

## Components and Interfaces

### Category Management Component

**CategoryTree Interface**:
```typescript
interface CategoryNode {
  id: string;
  name: string;
  parentId?: string;
  children: CategoryNode[];
  productCount: number;
  level: number; // 0-2 for 3-level hierarchy
}

interface CategoryManager {
  createCategory(name: string, parentId?: string): Promise<Category>;
  updateCategory(id: string, updates: Partial<Category>): Promise<Category>;
  deleteCategory(id: string): Promise<void>;
  getCategoryTree(): Promise<CategoryNode[]>;
  assignProductsToCategory(productIds: string[], categoryId: string): Promise<void>;
}
```

The category system uses an adjacency list model for simplicity and performance. Each category stores its parent ID, enabling efficient tree traversal while maintaining referential integrity.

### Advanced Search Component

**SearchEngine Interface**:
```typescript
interface SearchFilter {
  field: string;
  operator: 'equals' | 'contains' | 'between' | 'in' | 'gte' | 'lte';
  value: any;
  logic?: 'AND' | 'OR';
}

interface SearchQuery {
  globalTerm?: string;
  filters: SearchFilter[];
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  pagination: { page: number; limit: number };
}

interface SearchEngine {
  search(query: SearchQuery): Promise<SearchResult>;
  saveSearch(name: string, query: SearchQuery): Promise<SavedSearch>;
  getSavedSearches(): Promise<SavedSearch[]>;
  getSearchSuggestions(term: string): Promise<string[]>;
}
```

The search system implements a flexible query builder that supports complex filtering with multiple criteria. It uses database indexes on frequently searched fields and implements fuzzy matching using trigram similarity for product names and SKUs.

### Notification System Component

**NotificationManager Interface**:
```typescript
interface NotificationRule {
  id: string;
  type: 'LOW_STOCK' | 'PRICE_CHANGE' | 'SYSTEM_EVENT';
  conditions: Record<string, any>;
  actions: NotificationAction[];
  isActive: boolean;
}

interface NotificationAction {
  type: 'EMAIL' | 'IN_APP' | 'LOG';
  config: Record<string, any>;
}

interface NotificationManager {
  createRule(rule: Omit<NotificationRule, 'id'>): Promise<NotificationRule>;
  evaluateRules(context: any): Promise<void>;
  sendNotification(notification: Notification): Promise<void>;
  markAsRead(notificationId: string): Promise<void>;
  getUnreadNotifications(): Promise<Notification[]>;
}
```

The notification system uses a rule-based engine that evaluates conditions after each inventory change. Rules are stored in the database and can be configured by users. The system supports multiple delivery channels and maintains notification history.

### Price History Tracking Component

**PriceHistoryManager Interface**:
```typescript
interface PriceHistoryEntry {
  id: string;
  productId: string;
  priceType: 'PURCHASE' | 'SELLING';
  oldPrice?: number;
  newPrice: number;
  effectiveDate: Date;
  reason?: string;
  userId: string;
}

interface PriceHistoryManager {
  recordPriceChange(productId: string, priceType: string, newPrice: number, reason?: string): Promise<void>;
  getPriceHistory(productId: string, priceType?: string): Promise<PriceHistoryEntry[]>;
  getPriceAtDate(productId: string, date: Date, priceType: string): Promise<number>;
  calculatePriceTrends(productId: string, days: number): Promise<PriceTrend>;
}
```

Price history is automatically recorded whenever product prices are updated. The system maintains separate histories for purchase and selling prices, enabling accurate profit calculations for historical transactions.

### Batch Operations Component

**BatchProcessor Interface**:
```typescript
interface BatchOperation {
  id: string;
  type: 'UPDATE' | 'DELETE' | 'CREATE';
  entityType: 'PRODUCT' | 'CATEGORY' | 'STOCK';
  operations: BatchItem[];
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  results: BatchResult[];
}

interface BatchProcessor {
  createBatch(operations: BatchItem[]): Promise<BatchOperation>;
  executeBatch(batchId: string): Promise<BatchResult[]>;
  validateBatch(operations: BatchItem[]): Promise<ValidationResult[]>;
  importFromCSV(file: File, mapping: FieldMapping): Promise<BatchOperation>;
}
```

Batch operations are processed in transactions to ensure atomicity. The system validates all operations before execution and provides detailed results for each item, including success/failure status and error messages.

## Data Models

### Extended Database Schema

The enhanced system adds several new entities to the existing Prisma schema:

**Category Model**:
```prisma
model Category {
  id        String   @id @default(cuid())
  name      String
  parentId  String?
  parent    Category? @relation("CategoryHierarchy", fields: [parentId], references: [id])
  children  Category[] @relation("CategoryHierarchy")
  products  ProductCategory[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@index([parentId])
  @@index([name])
}

model ProductCategory {
  id         String  @id @default(cuid())
  productId  String
  categoryId String
  product    Product @relation(fields: [productId], references: [id], onDelete: Cascade)
  category   Category @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  
  @@unique([productId, categoryId])
}
```

**Price History Model**:
```prisma
model PriceHistory {
  id            String   @id @default(cuid())
  productId     String
  priceType     String   // 'PURCHASE' | 'SELLING'
  oldPrice      Float?
  newPrice      Float
  effectiveDate DateTime @default(now())
  reason        String?
  userId        String
  product       Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  user          User     @relation(fields: [userId], references: [id])
  
  @@index([productId, priceType])
  @@index([effectiveDate])
}
```

**Notification Models**:
```prisma
model NotificationRule {
  id         String   @id @default(cuid())
  name       String
  type       String   // 'LOW_STOCK' | 'PRICE_CHANGE' | 'SYSTEM_EVENT'
  conditions Json
  actions    Json
  isActive   Boolean  @default(true)
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}

model Notification {
  id        String   @id @default(cuid())
  type      String
  title     String
  message   String
  data      Json?
  isRead    Boolean  @default(false)
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  createdAt DateTime @default(now())
  
  @@index([userId, isRead])
  @@index([createdAt])
}
```

**Activity Log Model**:
```prisma
model ActivityLog {
  id          String   @id @default(cuid())
  userId      String
  action      String   // 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | etc.
  entityType  String?  // 'PRODUCT' | 'SUPPLIER' | 'TRANSACTION' | etc.
  entityId    String?
  details     Json?
  ipAddress   String?
  userAgent   String?
  timestamp   DateTime @default(now())
  user        User     @relation(fields: [userId], references: [id])
  
  @@index([userId, timestamp])
  @@index([action, timestamp])
  @@index([entityType, entityId])
}
```

**System Settings Model**:
```prisma
model SystemSetting {
  id          String   @id @default(cuid())
  key         String   @unique
  value       Json
  description String?
  category    String   // 'BUSINESS' | 'NOTIFICATION' | 'UI' | 'BACKUP'
  updatedAt   DateTime @updatedAt
  updatedBy   String
  user        User     @relation(fields: [updatedBy], references: [id])
  
  @@index([category])
}
```

**Enhanced Product Model**:
The existing Product model is extended with additional fields:
```prisma
model Product {
  // ... existing fields
  reorderPoint    Int?     @default(0)
  lastPriceUpdate DateTime?
  categories      ProductCategory[]
  priceHistory    PriceHistory[]
  
  @@index([reorderPoint])
}
```

### Data Relationships and Constraints

**Category Hierarchy**: Uses self-referential foreign keys with a maximum depth of 3 levels. Circular references are prevented through application-level validation.

**Product-Category Mapping**: Many-to-many relationship allowing products to belong to multiple categories. Cascade deletes ensure referential integrity.

**Price History Tracking**: One-to-many relationship with products, maintaining complete audit trail of price changes with timestamps and user attribution.

**Notification System**: Rule-based system with JSON configuration for flexible condition and action definitions. Notifications are user-specific with read/unread status tracking.

**Activity Logging**: Comprehensive audit trail capturing all user actions with contextual information including IP addresses and user agents for security monitoring.

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Category Hierarchy Integrity
*For any* category creation or modification operation, the system should maintain valid hierarchy constraints (maximum 3 levels, no circular references, valid parent relationships) and prevent operations that would violate these constraints.
**Validates: Requirements 1.1, 1.2, 1.5**

### Property 2: Category Assignment Consistency
*For any* product and category combination, the system should allow multiple category assignments per product and support both individual and bulk assignment operations while maintaining referential integrity.
**Validates: Requirements 1.3, 1.7**

### Property 3: Category Deletion Safety
*For any* category deletion attempt, the system should prevent deletion if the category has assigned products or subcategories, ensuring referential integrity is maintained.
**Validates: Requirements 1.4**

### Property 4: Hierarchical Search Completeness
*For any* category-based search query, the system should include products from all subcategories in the results and display the category tree in proper hierarchical format.
**Validates: Requirements 1.6, 1.8**

### Property 5: Global Search Functionality
*For any* search query, the system should search across products, suppliers, and transactions simultaneously, support fuzzy matching for text fields, and highlight matching terms in results with accurate counts.
**Validates: Requirements 2.1, 2.4, 2.8**

### Property 6: Advanced Filtering Logic
*For any* combination of filter criteria, the system should support AND/OR logic operations and provide filtering options for price ranges, stock levels, categories, suppliers, and date ranges.
**Validates: Requirements 2.2, 2.3**

### Property 7: Search Persistence and Enhancement
*For any* search operation, the system should provide autocomplete suggestions based on existing data, support result sorting by multiple criteria, and allow saving frequently used searches for quick access.
**Validates: Requirements 2.5, 2.6, 2.7**

### Property 8: Barcode Processing Workflow
*For any* barcode scan or manual SKU entry, the system should automatically search for corresponding products, display product details for matches, offer product creation for non-matches, and maintain scan history.
**Validates: Requirements 3.2, 3.3, 3.4, 3.5, 3.7**

### Property 9: Transaction Integration for Scanning
*For any* scanning operation during transaction processing, the system should automatically add identified products to the transaction cart and support the same functionality for manual SKU entry.
**Validates: Requirements 3.6**

### Property 10: Notification Lifecycle Management
*For any* product with a reorder point, the system should generate notifications when stock reaches the threshold, display alerts prominently on the dashboard, and automatically clear notifications when stock is replenished above the reorder point.
**Validates: Requirements 4.1, 4.3, 4.8**

### Property 11: Reorder Point Management
*For any* reorder point configuration, the system should support both individual product settings and bulk updates by category, and sort low stock reports by urgency (lowest stock percentage first).
**Validates: Requirements 4.2, 4.7**

### Property 12: Reorder Suggestion Intelligence
*For any* low stock situation, the system should generate reorder suggestions based on historical usage patterns and allow users to mark alerts as acknowledged or reorder placed.
**Validates: Requirements 4.4, 4.5**

### Property 13: Price History Recording
*For any* price change operation (individual or bulk), the system should automatically record the change with timestamp, maintain separate histories for purchase and selling prices, and log all changes in the activity log.
**Validates: Requirements 5.1, 5.2, 5.8**

### Property 14: Price History Analysis
*For any* price history query, the system should display chronological changes with percentage calculations, compute averages over specified periods, and provide trend analysis showing price patterns.
**Validates: Requirements 5.3, 5.4, 5.6**

### Property 15: Historical Price Accuracy
*For any* profit calculation or transaction processing, the system should use historical prices that were effective at the time of each transaction and suggest prices based on recent history.
**Validates: Requirements 5.5, 5.7**

### Property 16: Batch Operation Processing
*For any* batch operation, the system should validate all changes before applying, provide detailed confirmation summaries, handle partial failures with specific error reporting, and support operations for category assignment, price updates, and supplier changes.
**Validates: Requirements 6.1, 6.2, 6.4**

### Property 17: CSV Import and Export
*For any* CSV import operation, the system should validate file format, check for duplicates, provide import preview, and support batch stock adjustments. For exports, the system should generate correct CSV format for selected products or filtered results.
**Validates: Requirements 6.3, 6.6, 6.7**

### Property 18: Batch Operation Safety
*For any* batch deletion operation, the system should provide safety confirmations, check dependencies, and log all batch operations in the activity log with details of affected records.
**Validates: Requirements 6.5, 6.8**

### Property 19: Financial Reporting Accuracy
*For any* profit/loss report generation, the system should calculate gross profit using correct historical purchase and selling prices and provide accurate inventory turnover analysis categorizing products by movement speed.
**Validates: Requirements 7.1, 7.2**

### Property 20: Business Intelligence Analytics
*For any* trend or forecasting report, the system should display sales patterns and seasonal variations over time, create supplier performance reports with accurate metrics, and predict future stock needs based on historical consumption patterns.
**Validates: Requirements 7.3, 7.4, 7.5**

### Property 21: Product Classification and Custom Reports
*For any* ABC analysis request, the system should correctly categorize products by revenue contribution and inventory value. For custom reports, the system should respect selected date ranges, categories, suppliers, and specific metrics.
**Validates: Requirements 7.6, 7.7**

### Property 22: System Configuration Management
*For any* system settings access, the system should provide configuration options for business information, tax rates, currency settings, default reorder points, markup percentages, and pricing rules.
**Validates: Requirements 8.1, 8.2**

### Property 23: Notification and UI Preferences
*For any* preference configuration, the system should allow enabling/disabling different alert types and delivery methods, support UI customization of dashboard widgets and default views, and maintain user interface preferences.
**Validates: Requirements 8.3, 8.5**

### Property 24: System Administration Security
*For any* critical settings update, the system should require password confirmation, log all changes, support data retention policies for logs and history, and provide configuration import/export functionality.
**Validates: Requirements 8.4, 8.6, 8.7, 8.8**

### Property 25: Comprehensive Activity Logging
*For any* user operation (CRUD, authentication, critical operations), the system should log the action with timestamp, user identification, affected records, and create detailed audit entries for important operations.
**Validates: Requirements 9.1, 9.2, 9.3**

### Property 26: Activity Log Management
*For any* activity log query, the system should provide search and filtering by date range, user, action type, and affected entities, display human-readable descriptions with before/after values, and support log export for audit purposes.
**Validates: Requirements 9.4, 9.5, 9.8**

### Property 27: Log Retention and Security
*For any* log management operation, the system should automatically purge old logs based on retention policies and create high-priority entries for security events like failed logins and unauthorized access attempts.
**Validates: Requirements 9.6, 9.7**

### Property 28: Quick Actions and Shortcuts
*For any* dashboard access, the system should display customizable quick action buttons, provide keyboard shortcuts for frequently used functions, learn usage patterns to suggest relevant actions, and show recently viewed or modified items.
**Validates: Requirements 10.1, 10.2, 10.3, 10.4**

### Property 29: Transaction Templates and Favorites
*For any* transaction creation, the system should offer quick templates for common transaction types, support favorite products and suppliers for instant access, and allow customization of quick action preferences.
**Validates: Requirements 10.5, 10.6, 10.8**

### Property 30: Navigation Enhancement
*For any* application navigation, the system should provide breadcrumb navigation and quick jump functionality to improve user efficiency.
**Validates: Requirements 10.7**

### Property 31: Mobile Interface Adaptation
*For any* mobile device access, the system should display mobile-optimized navigation with collapsible menu, prioritize essential functions with streamlined interfaces, and use card layouts or expandable rows instead of wide tables.
**Validates: Requirements 11.1, 11.2, 11.3**

### Property 32: Mobile Form and Report Optimization
*For any* mobile form or report display, the system should optimize form inputs with appropriate keyboard types and validation, and use responsive charts and summary cards instead of detailed tables for reports.
**Validates: Requirements 11.6, 11.7**

### Property 33: Backup Creation and Management
*For any* backup operation, the system should create complete data backups including all products, suppliers, transactions, categories, settings, and user data, support both automated scheduled backups and manual backup creation with user-defined names.
**Validates: Requirements 12.1, 12.2, 12.3**

### Property 34: Backup Integrity and Restoration
*For any* backup verification or restore operation, the system should ensure data integrity and completeness, provide backup selection with creation dates and data preview, and support partial restore options for specific data types.
**Validates: Requirements 12.4, 12.5, 12.6**

### Property 35: Backup Storage Management
*For any* backup storage operation, the system should automatically remove oldest backups when capacity limits are reached while preserving recent ones, and provide backup encryption and secure storage options for sensitive data.
**Validates: Requirements 12.7, 12.8**

## Error Handling

### Category Management Errors
- **Circular Reference Prevention**: Detect and prevent circular references in category hierarchies through recursive validation
- **Depth Limit Enforcement**: Reject category creation attempts that would exceed the 3-level depth limit
- **Referential Integrity**: Prevent category deletion when products or subcategories exist with clear error messages

### Search and Filtering Errors
- **Invalid Filter Combinations**: Validate filter logic and provide helpful error messages for incompatible filter combinations
- **Search Timeout Handling**: Implement timeouts for complex searches and provide partial results when possible
- **Malformed Query Recovery**: Handle malformed search queries gracefully with suggestions for correction

### Notification System Errors
- **Email Delivery Failures**: Implement retry logic for failed email notifications with fallback to in-app notifications
- **Rule Evaluation Errors**: Handle notification rule evaluation failures without affecting core system operations
- **Threshold Configuration Validation**: Validate reorder point configurations to prevent negative or unrealistic values

### Price History Errors
- **Historical Data Inconsistency**: Detect and handle cases where historical price data is missing or corrupted
- **Calculation Overflow**: Handle large price values and calculations that might cause numeric overflow
- **Concurrent Price Updates**: Prevent race conditions during simultaneous price updates using database transactions

### Batch Operation Errors
- **Partial Failure Recovery**: Provide detailed reporting of which operations succeeded and failed in batch processing
- **CSV Format Validation**: Validate CSV file structure and data types before processing with clear error reporting
- **Transaction Rollback**: Implement proper rollback mechanisms for failed batch operations to maintain data consistency

### Backup and Restore Errors
- **Backup Corruption Detection**: Verify backup integrity and detect corruption before restore operations
- **Storage Space Management**: Handle insufficient storage space during backup creation with appropriate warnings
- **Restore Conflict Resolution**: Handle conflicts during restore operations when current data differs from backup data

## Testing Strategy

### Dual Testing Approach

The Enhanced CatStock Features will employ a comprehensive dual testing strategy combining unit tests and property-based tests to ensure both specific functionality and universal correctness properties.

**Unit Testing Focus:**
- Specific examples demonstrating correct behavior for each feature
- Edge cases and boundary conditions (empty categories, maximum hierarchy depth, zero stock levels)
- Error conditions and exception handling scenarios
- Integration points between new features and existing CatStock functionality
- User interface interactions and responsive behavior

**Property-Based Testing Focus:**
- Universal properties that hold across all valid inputs using generated test data
- Comprehensive input coverage through randomization (random categories, products, prices, stock levels)
- Invariant preservation during operations (hierarchy integrity, referential consistency)
- Round-trip properties for data serialization and backup/restore operations

### Property-Based Testing Configuration

**Testing Library Selection:**
- **JavaScript/TypeScript**: Use `fast-check` library for property-based testing
- **Minimum 100 iterations** per property test to ensure comprehensive coverage through randomization
- **Test tagging**: Each property test must include a comment referencing its design document property

**Test Tag Format:**
```javascript
// Feature: enhanced-catstock-features, Property 1: Category Hierarchy Integrity
```

**Property Test Implementation Requirements:**
- Each correctness property must be implemented by exactly one property-based test
- Tests must generate realistic test data that matches business domain constraints
- Property tests should focus on universal behaviors rather than specific examples
- All property tests must be independent and not rely on shared state

### Testing Coverage Strategy

**Category Management Testing:**
- Property tests for hierarchy validation with randomly generated category trees
- Unit tests for specific UI interactions and error message display
- Integration tests for category-product assignment workflows

**Search and Filtering Testing:**
- Property tests for search result accuracy across different entity types
- Unit tests for specific search scenarios and edge cases
- Performance tests for search operations with large datasets

**Notification System Testing:**
- Property tests for notification trigger conditions with various stock scenarios
- Unit tests for notification display and user interaction
- Integration tests for email delivery (when configured)

**Price History Testing:**
- Property tests for price change recording and historical accuracy
- Unit tests for price calculation edge cases and display formatting
- Integration tests for profit report generation using historical data

**Batch Operations Testing:**
- Property tests for batch operation consistency and partial failure handling
- Unit tests for CSV import/export format validation
- Integration tests for large batch operations and performance

**Backup and Restore Testing:**
- Property tests for backup completeness and restore accuracy
- Unit tests for backup scheduling and storage management
- Integration tests for full system backup and restore workflows

### Performance and Security Testing

**Performance Considerations:**
- Load testing for search operations with large product catalogs
- Stress testing for batch operations with thousands of records
- Mobile performance testing for responsive design and touch interactions

**Security Testing:**
- Input validation testing for all user inputs and file uploads
- Authentication and authorization testing for new features
- Activity logging verification for audit trail completeness

This comprehensive testing strategy ensures that the Enhanced CatStock Features maintain the reliability and performance standards of the existing system while providing robust validation of the new advanced functionality.