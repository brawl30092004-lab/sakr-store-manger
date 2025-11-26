# Coupon Management Feature - Implementation Documentation

## Overview

The Coupon Management feature has been successfully implemented in the Sakr Store Manager application. This feature allows users to create, edit, delete, and manage discount coupons that sync with the Sakr-Store website via GitHub.

---

## Architecture

### File Structure

```
sakr-store-manager/
├── src/
│   ├── components/
│   │   ├── CouponCard.jsx          # Individual coupon card display
│   │   ├── CouponCard.css          # Card styling
│   │   ├── CouponForm.jsx          # Add/Edit coupon form
│   │   ├── CouponForm.css          # Form styling
│   │   ├── CouponGrid.jsx          # Main coupon grid view
│   │   ├── CouponGrid.css          # Grid styling
│   │   ├── Sidebar.jsx             # Updated with Coupons nav
│   │   ├── StatusBar.jsx           # Updated for coupon tracking
│   │   └── App.jsx                 # Updated with coupon routing
│   ├── services/
│   │   └── couponService.js        # Coupon business logic
│   ├── schemas/
│   │   └── couponSchema.js         # Yup validation schema
│   └── store/
│       ├── slices/
│       │   └── couponsSlice.js     # Redux state management
│       └── store.js                # Updated store config
├── electron/
│   ├── main.cjs                    # Updated with IPC handlers
│   └── preload.js                  # Updated with coupon APIs
└── [project-root]/
    └── coupons.json                # Coupon data file (auto-created)
```

---

## Data Model

### Coupon Object Structure

```javascript
{
  id: number,              // Auto-generated unique ID
  code: string,            // 4-20 uppercase alphanumeric (e.g., "WELCOME10")
  type: string,            // "percentage" or "fixed"
  amount: number,          // 1-100 for percentage, any positive for fixed
  minSpend: number,        // Minimum cart value required (0 = no minimum)
  category: string,        // "All" or specific product category
  description: string,     // Optional description (max 200 chars)
  enabled: boolean         // Whether coupon is active
}
```

### Example coupons.json

```json
[
  {
    "id": 1,
    "code": "WELCOME10",
    "type": "percentage",
    "amount": 10.00,
    "minSpend": 500.00,
    "category": "All",
    "description": "10% off orders over 500 EGP",
    "enabled": true
  },
  {
    "id": 2,
    "code": "SUMMER25",
    "type": "percentage",
    "amount": 25.00,
    "minSpend": 700.00,
    "category": "Electronics",
    "description": "Summer sale - Electronics only",
    "enabled": true
  },
  {
    "id": 3,
    "code": "FIXED50",
    "type": "fixed",
    "amount": 50.00,
    "minSpend": 0.00,
    "category": "All",
    "description": "50 EGP off any order",
    "enabled": false
  }
]
```

---

## Component Details

### 1. CouponGrid (Main View)

**Purpose**: Main container for displaying and managing coupons

**Features**:
- Grid layout with responsive design
- Search by code, category, or description
- Filter by status (All, Enabled, Disabled)
- Filter by type (Percentage, Fixed)
- Empty state with "Add First Coupon" CTA
- Floating action button for quick add
- Integration with CouponForm modal

**Key Props**: None (uses Redux state)

**State Management**:
- `searchText`: Current search query
- `isFormOpen`: Form modal visibility
- `editingCoupon`: Coupon being edited (null for new)
- `deleteConfirmId`: ID of coupon pending delete confirmation
- `statusFilter`: 'all' | 'enabled' | 'disabled'
- `typeFilter`: 'all' | 'percentage' | 'fixed'

---

### 2. CouponCard (Individual Display)

**Purpose**: Display individual coupon with actions

**Features**:
- Prominent coupon code display
- Visual discount indicator (icon + amount)
- Minimum spend and category info
- Optional description
- Status indicator (enabled/disabled)
- Toggle switch for quick enable/disable
- Action buttons (Edit, Duplicate, Delete)
- Hover effects and animations

**Props**:
```typescript
{
  coupon: Coupon,
  onEdit: (coupon: Coupon) => void,
  onDelete: (id: number) => void,
  onDuplicate: (id: number) => void,
  onToggleStatus: (id: number) => void
}
```

---

### 3. CouponForm (Add/Edit Modal)

**Purpose**: Form for creating and editing coupons

**Features**:
- Modal overlay with backdrop blur
- React Hook Form with Yup validation
- Auto-uppercase code input
- Type-based amount validation
- Category dropdown from products
- Character counter for description
- Real-time validation feedback
- Duplicate code detection
- Disabled state during save

**Props**:
```typescript
{
  coupon?: Coupon | null,     // null for new, Coupon object for edit
  onClose: () => void,
  onSave: (couponData: Coupon) => Promise<void>
}
```

**Validation Rules**:
- Code: 4-20 chars, uppercase alphanumeric only
- Type: Required, "percentage" or "fixed"
- Amount: Required, 1-100 for %, >0 for fixed
- Min Spend: Optional, ≥0
- Category: Required, must exist in products
- Description: Optional, max 200 chars
- Enabled: Boolean, default true

---

## Service Layer

### CouponService

**Purpose**: Handle all coupon business logic and file operations

**Key Methods**:

```javascript
class CouponService {
  constructor(projectPath: string)
  
  // File Operations
  async loadCoupons(): Promise<Coupon[]>
  async saveCoupons(coupons: Coupon[]): Promise<boolean>
  
  // Validation
  async validateCouponData(
    coupon: Coupon,
    existingCoupons: Coupon[],
    availableCategories: string[],
    currentCouponCode?: string
  ): Promise<ValidationResult>
  
  // Utilities
  generateNextCouponId(coupons: Coupon[]): number
  formatCouponCode(code: string): string
  getDefaultCoupon(): Coupon
  applyDiscount(price: number, coupon: Coupon): number
  calculateDiscountAmount(price: number, coupon: Coupon): number
}
```

---

## Redux Store

### Coupons Slice

**State Shape**:
```javascript
{
  coupons: {
    items: Coupon[],
    loading: boolean,
    error: string | null,
    hasUnsavedChanges: boolean
  }
}
```

**Async Thunks**:
- `loadCoupons`: Load from coupons.json
- `saveCoupons`: Save to coupons.json
- `addCoupon`: Add new coupon
- `updateCoupon`: Update existing coupon
- `deleteCoupon`: Delete coupon
- `toggleCouponStatus`: Toggle enabled flag
- `duplicateCoupon`: Create copy of coupon

**Actions**:
- `markCouponsSaved`: Reset hasUnsavedChanges flag (called after git publish)
- `clearCouponError`: Clear error state

---

## IPC Communication

### Main Process Handlers (main.cjs)

```javascript
// Load coupons from coupons.json
ipcMain.handle('fs:loadCoupons', async (event, projectPath) => {
  // Creates empty array if file doesn't exist
  // Returns array of coupon objects
});

// Save coupons to coupons.json
ipcMain.handle('fs:saveCoupons', async (event, projectPath, coupons) => {
  // Formats JSON with 2-space indent
  // Preserves decimal precision for amounts
  // Returns true on success
});
```

### Renderer API (preload.js)

```javascript
window.electron.coupons = {
  load: (projectPath) => ipcRenderer.invoke('fs:loadCoupons', projectPath),
  save: (projectPath, coupons) => ipcRenderer.invoke('fs:saveCoupons', projectPath, coupons)
};
```

---

## Integration Points

### 1. Sidebar Navigation

**Changes**:
- Added "Views" section above "Categories"
- Products view button (shows product count)
- Coupons view button (shows coupon count)
- Categories only visible in Products view

**Props Added**:
```javascript
<Sidebar
  selectedCategory={string}
  onCategorySelect={(category) => void}
  currentView={string}           // NEW
  onViewChange={(view) => void}  // NEW
/>
```

---

### 2. App Routing

**View States**:
- `'dashboard'`: Dashboard view
- `'products'`: Products grid (existing)
- `'coupons'`: Coupons grid (new)

**Render Logic**:
```javascript
{currentView === 'dashboard' ? (
  <Dashboard />
) : (
  <>
    <Sidebar currentView={currentView} onViewChange={setCurrentView} />
    {currentView === 'coupons' ? (
      <CouponGrid />
    ) : (
      <MainContent />
    )}
  </>
)}
```

---

### 3. Status Bar Integration

**Changes**:
- Tracks coupons.json in git status
- Includes coupon changes in file count
- Publishes coupons.json with products
- Reloads coupons after successful publish
- Calls `markCouponsSaved()` after publish

**Updated Methods**:
```javascript
// Load coupons on app startup
dispatch(loadCoupons());

// Reload after publish
await dispatch(loadCoupons()).unwrap();
dispatch(markCouponsSaved());
```

---

### 4. Command Palette

**New Command**:
```javascript
{
  id: 'coupons',
  label: 'Show Coupons',
  icon: <Tag size={16} />,
  category: 'View',
  keywords: ['coupons', 'discounts', 'codes', 'promo'],
  action: () => setCurrentView('coupons')
}
```

---

## Git Workflow

### File Changes Detection

The existing git integration automatically detects changes to `coupons.json`:

1. User modifies coupons (add/edit/delete)
2. Redux saves to `coupons.json`
3. Git status check detects file modification
4. Status bar shows "Unsaved changes"
5. User clicks "Publish to Store"
6. Git commits with auto-generated message
7. Changes pushed to GitHub
8. GitHub Pages rebuilds site
9. Website loads new coupons

### Commit Message Examples

```
Update products and coupons
Update coupons
Add new coupon WELCOME10
Edit coupon SUMMER25
Delete coupon EXPIRED10
```

---

## Design System

### Color Palette

**Primary Blue** (Brand):
- `#58a6ff` - Primary actions, icons
- `#79c0ff` - Hover states, active filters
- `rgba(88, 166, 255, 0.1)` - Hover backgrounds

**Success Green**:
- `#3fb950` - Enabled indicator
- `rgba(63, 185, 80, 0.2)` - Toggle background

**Error Red**:
- `#f85149` - Delete actions
- `#ff7b72` - Error messages

**Neutral Grays**:
- `#0d1117` - Background
- `#1a1d24` - Card background
- `#2d3139` - Borders
- `#e6edf3` - Primary text
- `#8b949e` - Secondary text

### Typography

- **Headings**: System font stack, 700 weight
- **Body**: System font stack, 400-500 weight
- **Monospace**: 'Courier New' for coupon codes

### Spacing

- Grid gap: 20px
- Card padding: 20px
- Form padding: 24px
- Button padding: 12px 24px

### Animations

- Transitions: 0.2s ease
- Hover lifts: -4px translateY
- Modal slide-up: 0.3s ease

---

## Error Handling

### Validation Errors

Displayed inline under form fields:
- Invalid code format
- Duplicate code
- Invalid amount
- Invalid category

### File Operation Errors

Toast notifications for:
- Failed to load coupons
- Failed to save coupons
- Failed to create coupons.json
- Git operation failures

### Recovery Strategies

1. **Missing File**: Auto-create empty coupons.json
2. **Corrupted JSON**: Show error, offer to recreate
3. **Permission Errors**: Show detailed error message
4. **Network Errors**: Retry with exponential backoff

---

## Performance Optimizations

### React Optimizations

1. **useMemo** for filtered coupon lists
2. **useCallback** for event handlers
3. **React.memo** for card components (if needed)
4. **Debounced search** (300ms delay)

### Redux Optimizations

1. Normalized state structure
2. Selective re-renders with `useSelector`
3. Batch actions where possible

### File Operations

1. Throttled git status checks (5s interval)
2. Debounced auto-save (if implemented)
3. Optimistic UI updates

---

## Security Considerations

### Input Validation

- All inputs validated on client and data layer
- XSS prevention via React's built-in escaping
- SQL injection N/A (file-based storage)

### File System Access

- Path traversal prevented by Electron security
- File operations restricted to project directory
- UTF-8 encoding enforced

### Git Operations

- Credentials stored in Electron settings (encrypted)
- HTTPS transport for GitHub API
- Token-based authentication

---

## Browser Compatibility

**Electron 28 (Chromium 114)**:
- Modern JavaScript (ES2022)
- CSS Grid and Flexbox
- CSS Custom Properties
- Native fetch API

**No IE Support** (Electron-only app)

---

## Accessibility

### Keyboard Navigation

- Tab through all interactive elements
- Enter to submit forms
- Escape to close modals
- Arrow keys for navigation (future)

### ARIA Labels

- Form inputs have labels
- Buttons have descriptive text
- Status indicators have aria-live

### Screen Readers

- Semantic HTML elements
- Proper heading hierarchy
- Alt text for icons (via aria-label)

### Visual

- Sufficient color contrast (WCAG AA)
- Focus indicators visible
- No color-only information
- Responsive text sizing

---

## Troubleshooting

### Common Issues

**1. Coupons not loading**
- Check if coupons.json exists in project root
- Verify file has valid JSON syntax
- Check console for error messages

**2. Duplicate code error**
- Codes are case-insensitive (WELCOME10 = welcome10)
- Check existing coupons before creating

**3. Category not found**
- Category must exist in products.json first
- Use exact category name (case-sensitive)
- "All" is always available

**4. Git publish not including coupons**
- Ensure coupons.json is not in .gitignore
- Check git status shows the file
- Verify git repository initialized

**5. Form validation not working**
- Check browser console for errors
- Verify Yup schema loaded
- Try clearing form and re-entering

---

## Future Enhancements

### Planned Features

1. **Expiration Dates**: Add start/end date fields
2. **Usage Limits**: Max uses per coupon
3. **User Restrictions**: Limit to specific emails/users
4. **Stacking Rules**: Allow/prevent coupon stacking
5. **Product Restrictions**: Specific products only
6. **Bulk Operations**: Enable/disable multiple at once
7. **Import/Export**: CSV/Excel support
8. **Analytics**: Usage tracking and reporting
9. **Templates**: Quick create from presets
10. **Testing**: Simulate coupon application

### Technical Improvements

1. Add TypeScript for better type safety
2. Add unit tests (Jest + React Testing Library)
3. Add E2E tests (Playwright)
4. Implement caching for better performance
5. Add undo/redo for coupon operations
6. Add drag-and-drop reordering
7. Add keyboard shortcuts for coupon actions

---

## API Reference

### CouponService API

```javascript
// Initialize service
const couponService = new CouponService(projectPath);

// Load all coupons
const coupons = await couponService.loadCoupons();
// Returns: Promise<Coupon[]>

// Save coupons
await couponService.saveCoupons(coupons);
// Returns: Promise<boolean>

// Validate coupon
const result = await couponService.validateCouponData(
  coupon,
  existingCoupons,
  availableCategories,
  currentCode
);
// Returns: Promise<{ valid: boolean, errors: Error[], coupon: Coupon }>

// Generate next ID
const newId = couponService.generateNextCouponId(coupons);
// Returns: number

// Format code
const formatted = couponService.formatCouponCode('welcome10');
// Returns: 'WELCOME10'

// Get default coupon
const defaultCoupon = couponService.getDefaultCoupon();
// Returns: Coupon

// Apply discount
const discountedPrice = couponService.applyDiscount(1000, coupon);
// Returns: number

// Calculate discount amount
const discount = couponService.calculateDiscountAmount(1000, coupon);
// Returns: number
```

### Redux Actions

```javascript
// Load coupons
dispatch(loadCoupons());

// Add coupon
dispatch(addCoupon({ code: 'TEST10', type: 'percentage', amount: 10, ... }));

// Update coupon
dispatch(updateCoupon({ id: 1, updates: { amount: 15 } }));

// Delete coupon
dispatch(deleteCoupon(1));

// Toggle status
dispatch(toggleCouponStatus(1));

// Duplicate coupon
dispatch(duplicateCoupon(1));

// Mark saved
dispatch(markCouponsSaved());

// Clear error
dispatch(clearCouponError());
```

---

## Conclusion

The Coupon Management feature is fully integrated into the Sakr Store Manager application, following the same patterns and design principles as the existing Product Management feature. All requirements have been met, and the feature is ready for testing and deployment.

For questions or issues, refer to:
- Testing Checklist: `COUPON_FEATURE_TESTING_CHECKLIST.md`
- Original Requirements: Task document
- Code Documentation: Inline JSDoc comments
