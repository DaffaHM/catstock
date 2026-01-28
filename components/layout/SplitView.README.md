# Master-Detail Split View Pattern

This document describes the implementation of the master-detail split view pattern for CatStock, specifically optimized for iPad Pro 11-inch devices with responsive behavior across different orientations.

## Overview

The master-detail split view pattern provides an efficient way to display list and detail content simultaneously on larger screens while gracefully adapting to smaller screens and different orientations.

## Components

### SplitView

The main component that orchestrates the master-detail layout with responsive behavior.

**Features:**
- Automatic responsive behavior based on screen size and orientation
- Support for right-side drawers (transaction carts, detail panels)
- Customizable master panel width
- Smooth transitions between layout modes
- Hydration-safe rendering

**Usage:**
```jsx
import SplitView from '@/components/layout/SplitView'

<SplitView
  masterContent={<ProductList />}
  detailContent={<ProductDetail />}
  rightDrawer={<TransactionCart />}
  masterWidth="40%"
  rightDrawerWidth="384px"
/>
```

**Props:**
- `masterContent` - Content for the left panel (list view)
- `detailContent` - Content for the main panel (detail view)
- `rightDrawer` - Optional drawer content for the right side
- `masterWidth` - Width of the master panel (default: "40%")
- `rightDrawerWidth` - Width of the right drawer (default: "384px")
- `showDetail` - Controls which panel to show in single-panel mode
- `onDetailToggle` - Callback for panel toggle events
- `className` - Additional CSS classes
- `masterClassName` - CSS classes for master panel
- `detailClassName` - CSS classes for detail panel

### TransactionCart

A specialized drawer component for managing transaction items with touch-friendly controls.

**Features:**
- Touch-optimized quantity steppers
- Real-time total calculations
- Expandable/collapsible item details
- Support for unit costs and prices
- Empty state handling
- Loading states

**Usage:**
```jsx
import TransactionCart from '@/components/ui/TransactionCart'

<TransactionCart
  items={cartItems}
  onUpdateItem={handleUpdateItem}
  onRemoveItem={handleRemoveItem}
  onSave={handleSaveTransaction}
  title="Transaction Items"
  saveButtonText="Complete Sale"
  showTotals={true}
/>
```

**Props:**
- `items` - Array of transaction items
- `onUpdateItem` - Callback for item updates
- `onRemoveItem` - Callback for item removal
- `onSave` - Callback for saving transaction
- `onClear` - Callback for clearing all items
- `title` - Cart title (default: "Transaction Items")
- `saveButtonText` - Save button text (default: "Save Transaction")
- `isLoading` - Loading state
- `disabled` - Disabled state
- `showTotals` - Whether to show totals section

### DetailPanel

A reusable component for displaying detailed information with action buttons.

**Features:**
- Customizable header with title and subtitle
- Action button support (edit, delete, close, custom)
- Scrollable content area
- Touch-friendly button sizing

**Usage:**
```jsx
import DetailPanel from '@/components/ui/DetailPanel'

<DetailPanel
  title="Product Details"
  subtitle="SKU: ABC123"
  onEdit={handleEdit}
  onDelete={handleDelete}
  onClose={handleClose}
>
  <ProductDetailContent />
</DetailPanel>
```

### SplitViewDrawer

A responsive drawer component that adapts between fixed and overlay modes.

**Features:**
- Fixed drawer mode for landscape tablets
- Overlay drawer mode for portrait/mobile
- Collapsible with toggle button
- Left or right positioning
- Escape key support
- Body scroll prevention

**Usage:**
```jsx
import SplitViewDrawer from '@/components/ui/SplitViewDrawer'

<SplitViewDrawer
  isOpen={isOpen}
  onToggle={handleToggle}
  title="Cart"
  position="right"
  width="400px"
>
  <DrawerContent />
</SplitViewDrawer>
```

## Responsive Behavior

### iPad Landscape Mode (Primary Target)
- **Layout**: Master-detail split view with optional right drawer
- **Master Panel**: 40% width (customizable)
- **Detail Panel**: Remaining width minus drawer width
- **Right Drawer**: Fixed position, 384px width (customizable)
- **Navigation**: Sidebar navigation

### iPad Portrait Mode
- **Layout**: Single panel view
- **Panel Selection**: Controlled by `showDetail` prop
- **Right Drawer**: Overlay mode with backdrop
- **Navigation**: Bottom navigation

### Mobile Devices
- **Layout**: Single panel view
- **Right Drawer**: Full-screen overlay
- **Navigation**: Bottom navigation

## Touch Optimization

All components follow iPad touch optimization guidelines:

- **Minimum Touch Targets**: 44px minimum (48px preferred)
- **Font Size**: 16px base font size for readability
- **Touch Manipulation**: CSS `touch-manipulation` for better responsiveness
- **Active States**: Visual feedback with `active:scale-95`
- **Focus States**: Proper focus rings for accessibility

## Implementation Guidelines

### 1. Master-Detail Pattern
```jsx
// Product management page example
<SplitView
  masterContent={
    <ProductList 
      products={products}
      selectedId={selectedProductId}
      onSelect={setSelectedProductId}
    />
  }
  detailContent={
    selectedProductId ? (
      <ProductDetail productId={selectedProductId} />
    ) : (
      <EmptyState message="Select a product to view details" />
    )
  }
/>
```

### 2. Transaction Cart Integration
```jsx
// Stock transaction page example
<SplitView
  masterContent={<ProductSelector />}
  detailContent={<ProductDetail />}
  rightDrawer={
    <TransactionCart
      items={transactionItems}
      onSave={handleSaveTransaction}
      saveButtonText="Complete Stock Out"
    />
  }
/>
```

### 3. Responsive Drawer Usage
```jsx
// Adaptive drawer that works across orientations
<SplitViewDrawer
  isOpen={isDrawerOpen}
  onToggle={() => setIsDrawerOpen(!isDrawerOpen)}
  title="Transaction Details"
  position="right"
>
  <TransactionDetails />
</SplitViewDrawer>
```

## Requirements Compliance

This implementation satisfies the following CatStock requirements:

- **5.6**: Transaction cart displayed in right drawer with prominent save button
- **5.10**: Master-detail views show both panels simultaneously in landscape mode
- **5.3**: All interactive elements have minimum 44px touch targets
- **5.8**: Base font size of 16px or larger for optimal readability
- **5.1**: Collapsible sidebar navigation for iPad landscape mode
- **5.2**: Bottom navigation for iPad portrait mode
- **5.7**: Preference for drawers over modal dialogs

## Testing

Comprehensive test coverage includes:

- Responsive behavior across orientations
- Touch target size validation
- Transaction cart calculations
- Detail panel interactions
- Drawer functionality
- Accessibility features

Run tests with:
```bash
npm test -- __tests__/split-view-pattern.test.js
```

## Performance Considerations

- **Hydration Safety**: Components handle SSR/client hydration properly
- **Efficient Re-renders**: Uses `useCallback` and `useMemo` for optimization
- **Media Query Handling**: Proper cleanup of event listeners
- **Memory Management**: Prevents memory leaks in drawer components

## Accessibility

- **Keyboard Navigation**: Full keyboard support with proper focus management
- **Screen Readers**: Proper ARIA labels and semantic HTML
- **Focus Management**: Logical tab order and focus trapping in drawers
- **High Contrast**: Compatible with high contrast modes
- **Touch Accessibility**: Meets WCAG touch target guidelines