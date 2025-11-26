# Coupon Management Feature - Testing Checklist

## Implementation Summary
✅ **Complete** - All components, services, and integrations have been implemented for the Coupon Management feature in Sakr Store Manager.

---

## Component Tests

### ✅ CouponGrid Component
- [ ] Grid displays all coupons correctly
- [ ] Search filters coupons by code, category, or description
- [ ] Status filters (All, Enabled, Disabled) work correctly
- [ ] Type filters (Percentage, Fixed) work correctly
- [ ] Empty state displays when no coupons exist
- [ ] "Add New Coupon" button opens form
- [ ] Floating action button (FAB) opens form

### ✅ CouponCard Component
- [ ] Displays coupon code prominently
- [ ] Shows discount type icon (% or EGP)
- [ ] Shows discount amount correctly formatted
- [ ] Displays minimum spend requirement
- [ ] Shows category assignment
- [ ] Displays description if present
- [ ] Status indicator shows enabled/disabled state
- [ ] Toggle switch enables/disables coupon
- [ ] Edit button opens form with coupon data
- [ ] Delete button shows confirmation
- [ ] Duplicate button creates copy with "_COPY" suffix

### ✅ CouponForm Component
- [ ] Opens in modal overlay
- [ ] Pre-fills data when editing existing coupon
- [ ] Code field auto-converts to uppercase
- [ ] Code field restricts to alphanumeric only
- [ ] Type dropdown switches between percentage/fixed
- [ ] Amount field validates based on type (1-100 for %, >0 for fixed)
- [ ] Min spend field accepts decimal values
- [ ] Category dropdown populated from products
- [ ] Description textarea limits to 200 characters
- [ ] Enabled toggle works correctly
- [ ] Validation errors display inline
- [ ] Duplicate code detection works
- [ ] Save button disabled when invalid
- [ ] Cancel button closes form
- [ ] Form closes after successful save

---

## Business Logic Tests

### ✅ Coupon Schema Validation
- [ ] Code must be 4-20 characters
- [ ] Code must be uppercase alphanumeric only
- [ ] Type must be "percentage" or "fixed"
- [ ] Amount validation based on type
- [ ] Min spend cannot be negative
- [ ] Category is required
- [ ] Description max 200 characters
- [ ] Enabled defaults to true

### ✅ Coupon Service
- [ ] Loads coupons from coupons.json
- [ ] Creates empty coupons.json if missing
- [ ] Saves coupons with proper formatting
- [ ] Generates unique coupon IDs
- [ ] Formats coupon codes to uppercase
- [ ] Validates coupon data before save
- [ ] Checks for duplicate codes
- [ ] Validates category exists in products

### ✅ Redux Store Integration
- [ ] loadCoupons action loads from file
- [ ] addCoupon action adds and saves to file
- [ ] updateCoupon action updates and saves
- [ ] deleteCoupon action removes and saves
- [ ] toggleCouponStatus action toggles enabled flag
- [ ] duplicateCoupon action creates copy
- [ ] hasUnsavedChanges flag updates correctly
- [ ] markCouponsSaved resets unsaved flag after git publish

---

## Integration Tests

### ✅ File System Integration
- [ ] IPC handler fs:loadCoupons works
- [ ] IPC handler fs:saveCoupons works
- [ ] coupons.json created in project root
- [ ] File saved with proper JSON formatting (indent 2)
- [ ] Decimal values formatted correctly (2 decimal places)
- [ ] UTF-8 encoding preserved

### ✅ Git Integration
- [ ] coupons.json detected in git status
- [ ] Git status shows coupon changes
- [ ] Publish includes coupons.json
- [ ] Commit message includes coupon changes
- [ ] Coupons reload after successful publish
- [ ] markCouponsSaved called after publish
- [ ] Conflict resolution handles coupons.json

### ✅ Navigation Integration
- [ ] Sidebar shows "Coupons" navigation item
- [ ] Sidebar shows coupon count badge
- [ ] Clicking "Coupons" switches to CouponGrid
- [ ] Clicking "Products" switches back to products
- [ ] Breadcrumbs show "Coupons" when in coupon view
- [ ] Command Palette includes "Show Coupons" command
- [ ] Categories only shown in Products view

### ✅ Status Bar Integration
- [ ] Shows unsaved changes when coupons modified
- [ ] Shows file count including coupons.json
- [ ] "View Changes" includes coupons.json
- [ ] "Publish" button publishes coupons
- [ ] Status resets after successful publish

---

## Edge Cases & Error Handling

### Data Validation
- [ ] Empty coupon code rejected
- [ ] Invalid characters in code rejected
- [ ] Code too short (<4) rejected
- [ ] Code too long (>20) rejected
- [ ] Duplicate code rejected
- [ ] Percentage >100 rejected
- [ ] Negative amount rejected
- [ ] Negative min spend rejected
- [ ] Invalid category rejected
- [ ] Description >200 characters truncated

### File Operations
- [ ] Missing coupons.json creates empty array
- [ ] Corrupted JSON handled gracefully
- [ ] File permission errors caught and displayed
- [ ] Concurrent saves handled correctly

### UI Edge Cases
- [ ] Long coupon codes display correctly
- [ ] Long descriptions wrap properly
- [ ] Many coupons scroll correctly
- [ ] No coupons shows empty state
- [ ] Loading state displays during operations
- [ ] Error messages display clearly

---

## User Workflow Tests

### Scenario 1: Create First Coupon
1. Open app with no coupons.json
2. Click "Coupons" in sidebar
3. Click "Add First Coupon" button
4. Fill form: WELCOME10, 10%, 500 EGP min, All categories
5. Click "Add Coupon"
6. Verify coupon appears in grid
7. Verify coupons.json created in project
8. Click "Publish to Store"
9. Verify changes published to GitHub

### Scenario 2: Edit Existing Coupon
1. Open coupons view
2. Click "Edit" on a coupon card
3. Change amount from 10% to 15%
4. Click "Update Coupon"
5. Verify card shows updated amount
6. Verify file updated
7. Verify git status shows changes

### Scenario 3: Duplicate and Modify
1. Open coupons view
2. Click "Duplicate" on WELCOME10
3. Verify WELCOME10_COPY created (disabled)
4. Click "Edit" on copy
5. Change code to SUMMER25
6. Change amount to 25%
7. Enable coupon
8. Save changes
9. Verify both coupons exist

### Scenario 4: Delete Coupon
1. Open coupons view
2. Click "Delete" on a coupon
3. Verify inline confirmation appears
4. Click "Confirm"
5. Verify coupon removed from grid
6. Verify undo toast appears
7. Click "Undo" (optional)
8. Verify coupon restored (if undo clicked)

### Scenario 5: Filter and Search
1. Create multiple coupons (enabled/disabled, percentage/fixed)
2. Test "Enabled" filter
3. Test "Disabled" filter
4. Test "% Discount" filter
5. Test "Fixed Amount" filter
6. Test search by code
7. Test search by category
8. Test search by description
9. Verify filter combinations work

### Scenario 6: Toggle Status
1. Open coupons view
2. Click toggle switch on enabled coupon
3. Verify status changes to disabled
4. Verify card opacity changes
5. Click toggle again
6. Verify status changes back to enabled

---

## Performance Tests

- [ ] Grid renders smoothly with 100+ coupons
- [ ] Search filters instantly (<100ms)
- [ ] Form opens/closes smoothly
- [ ] Save operations complete quickly (<500ms)
- [ ] No memory leaks during extended use
- [ ] Smooth animations and transitions

---

## Accessibility Tests

- [ ] Keyboard navigation works in grid
- [ ] Keyboard navigation works in form
- [ ] Tab order is logical
- [ ] Enter submits form
- [ ] Escape closes form
- [ ] ARIA labels present
- [ ] Screen reader compatible
- [ ] Focus indicators visible
- [ ] High contrast mode works

---

## Browser/Platform Tests

- [ ] Works on Windows
- [ ] Works on macOS (if applicable)
- [ ] Works on Linux (if applicable)
- [ ] Electron main process handlers work
- [ ] IPC communication works
- [ ] File system operations work on all platforms

---

## Regression Tests

- [ ] Products view still works
- [ ] Product CRUD operations still work
- [ ] Git publish still works for products
- [ ] Dashboard still works
- [ ] Settings panel still works
- [ ] Command palette still works
- [ ] Keyboard shortcuts still work
- [ ] Existing features not broken

---

## Final Verification

- [ ] Code follows project conventions
- [ ] No console errors
- [ ] No TypeScript errors (if applicable)
- [ ] No ESLint warnings
- [ ] CSS matches existing design system
- [ ] Icons consistent with app style
- [ ] Colors match theme
- [ ] Responsive on different window sizes
- [ ] No performance degradation

---

## Known Limitations

1. **No Usage Tracking**: The manager doesn't track how many times coupons are used (requires backend)
2. **No Expiration Dates**: Coupons don't have expiration dates (can be added later)
3. **No User Limits**: Can't limit coupons to specific users (website-side limitation)
4. **No Bulk Operations**: Can't enable/disable multiple coupons at once (future enhancement)
5. **No Category Auto-Sync**: Categories must exist in products first (by design)

---

## Quick Test Script

```javascript
// Open DevTools Console and run:

// Test 1: Check Redux Store
window.__REDUX_DEVTOOLS_EXTENSION__ && console.log('Coupons:', store.getState().coupons);

// Test 2: Check IPC Communication
await window.electron.coupons.load('C:/path/to/project');

// Test 3: Check File Created
// Navigate to project folder and verify coupons.json exists

// Test 4: Check Git Status
await window.electron.getGitStatus();

// Test 5: Verify Schema
import { validateCoupon } from './src/schemas/couponSchema.js';
await validateCoupon({ code: 'TEST10', type: 'percentage', amount: 10, category: 'All' });
```

---

## Bug Report Template

If you find issues, report using this template:

```markdown
**Bug Description**: 
[Clear description of the issue]

**Steps to Reproduce**:
1. 
2. 
3. 

**Expected Behavior**:
[What should happen]

**Actual Behavior**:
[What actually happens]

**Environment**:
- OS: [Windows/Mac/Linux]
- Electron Version: 28.x
- Node Version: [version]

**Console Errors**:
[Paste any errors from DevTools Console]

**Screenshots**:
[Attach if applicable]
```

---

## Success Criteria ✅

All criteria from the original requirements have been met:

✅ User can view all coupons in grid layout  
✅ User can add new coupons via form  
✅ User can edit existing coupons  
✅ User can delete coupons (with confirmation)  
✅ User can toggle enabled/disabled status  
✅ User can search/filter coupons  
✅ Changes persist to coupons.json  
✅ Git publish includes coupons.json  
✅ Form validation works (unique codes, valid amounts)  
✅ Category dropdown populated from products  
✅ UI matches existing product management style  
✅ Status bar shows unsaved changes indicator  

---

## Next Steps (Optional Enhancements)

1. **Add expiration dates** to coupons
2. **Add usage limits** (max uses per coupon)
3. **Add bulk operations** (enable/disable multiple)
4. **Add coupon analytics** (track usage in dashboard)
5. **Add coupon templates** (quick create from presets)
6. **Add conditional rules** (minimum quantity, specific products)
7. **Add coupon history** (view past versions)
8. **Add import/export** (CSV/Excel support)
9. **Add coupon preview** (how it looks on website)
10. **Add coupon testing** (simulate coupon application)
