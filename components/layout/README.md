# Responsive Layout Components

This directory contains the responsive layout components for the CatStock inventory management application, specifically optimized for iPad Pro 11-inch devices while maintaining compatibility across desktop and mobile devices.

## Components Overview

### AdaptiveNavigation
The main wrapper component that automatically switches between sidebar and bottom navigation based on device orientation and screen size.

**Usage:**
```jsx
import AdaptiveNavigation from '@/components/layout/AdaptiveNavigation'

<AdaptiveNavigation>
  {children}
</AdaptiveNavigation>
```

**Behavior:**
- **Tablet Landscape (≥768px + landscape)**: Uses SidebarNavigation
- **Portrait or Mobile**: Uses BottomNavigation
- Automatically responds to orientation changes

### SidebarNavigation
A collapsible sidebar navigation optimized for iPad landscape mode.

**Features:**
- Collapsible sidebar (64px collapsed, 256px expanded)
- Touch-optimized navigation items (44px minimum)
- Active state highlighting
- Integrated logout functionality
- Responsive to screen size changes

**Navigation Items:**
- Dashboard
- Products
- Suppliers
- Stock In
- Stock Out
- Reports
- Settings

### BottomNavigation
A bottom tab navigation optimized for portrait mode and mobile devices.

**Features:**
- Fixed bottom navigation bar
- Touch-friendly tab items (44px minimum)
- Icon + label design
- Safe area support for devices with home indicators
- Header with app title and secondary actions

**Navigation Items:**
- Dashboard
- Products
- Stock In
- Stock Out
- Reports

### SplitView
A master-detail layout component for iPad landscape mode.

**Usage:**
```jsx
import SplitView from '@/components/layout/SplitView'

<SplitView
  masterContent={<ProductList />}
  detailContent={<ProductDetail />}
  masterWidth="40%"
  showDetail={true}
/>
```

**Props:**
- `masterContent`: React node for the master panel
- `detailContent`: React node for the detail panel
- `masterWidth`: Width of master panel (default: "40%")
- `showDetail`: Whether to show detail panel (default: true)

**Behavior:**
- **Tablet Landscape**: Shows side-by-side panels
- **Portrait/Mobile**: Shows either master or detail based on `showDetail`

### ResponsiveLayout
Server-side wrapper that conditionally renders navigation based on authentication status.

**Usage:**
```jsx
import ResponsiveLayout from '@/components/layout/ResponsiveLayout'

<ResponsiveLayout>
  {children}
</ResponsiveLayout>
```

## Touch Optimization Features

### Minimum Touch Targets
All interactive elements meet the 44px minimum touch target requirement:
- Navigation items: 44px height minimum
- Buttons: 44px × 44px minimum
- Form inputs: 48px height (exceeds minimum)

### Touch Feedback
- Active scale animation (scale-95) on touch
- Hover states for desktop compatibility
- Focus states for keyboard navigation
- Touch manipulation CSS property for better responsiveness

### Typography
- Base font size: 16px minimum for optimal iPad readability
- Larger font sizes for headers and important content
- Proper line height for touch-friendly text selection

## Responsive Breakpoints

The layout system uses custom Tailwind breakpoints optimized for iPad:

```css
'tablet': '768px',
'tablet-landscape': '(min-width: 1024px) and (orientation: landscape)',
'tablet-portrait': '(max-width: 1023px) and (orientation: portrait)'
```

## Accessibility Features

### ARIA Labels
- Collapse/expand buttons have descriptive labels
- Navigation items have proper roles
- Form elements have associated labels

### Keyboard Navigation
- Focus management for drawer components
- Escape key support for closing modals/drawers
- Tab order optimization

### Screen Reader Support
- Semantic HTML structure
- Proper heading hierarchy
- Descriptive text for icon-only buttons

## CSS Classes and Utilities

### Custom Tailwind Classes
```css
.safe-area-inset-top { padding-top: env(safe-area-inset-top); }
.safe-area-inset-bottom { padding-bottom: env(safe-area-inset-bottom); }
.touch-manipulation { touch-action: manipulation; }
```

### Component-Specific Classes
- `.nav-sidebar`: Sidebar navigation container
- `.nav-bottom`: Bottom navigation container
- `.nav-item`: Individual navigation item
- `.split-view`: Split view container
- `.split-view-master`: Master panel
- `.split-view-detail`: Detail panel

## Performance Considerations

### Media Query Optimization
- Uses `matchMedia` API for efficient orientation detection
- Event listeners are properly cleaned up
- Minimal re-renders on orientation changes

### Bundle Size
- Components are tree-shakeable
- Icons are imported individually from lucide-react
- No unnecessary dependencies

## Testing

All components include comprehensive test coverage:
- Touch target size validation
- Responsive behavior testing
- Accessibility compliance
- Typography requirements
- Navigation functionality

Run tests with:
```bash
npm test -- __tests__/responsive-layout.test.js
npm test -- __tests__/adaptive-navigation.test.js
```

## Browser Support

### Primary Target
- iPad Safari (iOS 14+)
- iPad Pro 11-inch optimized

### Secondary Support
- Chrome/Safari on desktop
- Mobile Safari/Chrome
- Modern browsers with CSS Grid and Flexbox support

## Implementation Notes

### Server-Side Rendering
- ResponsiveLayout handles authentication server-side
- Client-side components use useEffect for orientation detection
- No hydration mismatches

### Performance
- Orientation changes are debounced
- Media queries use native browser APIs
- Minimal JavaScript for layout switching

### Maintenance
- Components follow consistent naming conventions
- Props are well-documented with TypeScript-style comments
- Modular architecture for easy updates