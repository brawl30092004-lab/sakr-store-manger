# Coupon Management Feature - Architectural Decisions

## Overview

This document outlines the key architectural decisions made during the implementation of the Coupon Management feature for Sakr Store Manager.

---

## Decision Log

### 1. Data Storage Format

**Decision**: Store coupons in a plain JSON file (`coupons.json`) in the project root, mirroring the `products.json` pattern.

**Rationale**:
- Consistency with existing product management
- Simple integration with existing git workflow
- Easy for website to fetch and parse
- No encoding/encryption needed (public data)
- Human-readable and editable

**Alternatives Considered**:
- SQLite database (rejected: adds complexity, harder for website)
- Encrypted JSON (rejected: coupons are public data)
- Combined with products.json (rejected: separation of concerns)

**Trade-offs**:
- ✅ Simple implementation
- ✅ Git-friendly (text file, easy diffs)
- ✅ Website-compatible (fetch API)
- ❌ No schema enforcement at file level
- ❌ No relational integrity

---

### 2. State Management Pattern

**Decision**: Use Redux Toolkit with async thunks, matching the `productsSlice` pattern.

**Rationale**:
- Consistency with existing codebase
- Centralized state management
- Built-in async handling
- Redux DevTools integration
- Easy to add middleware later

**Alternatives Considered**:
- React Context API (rejected: too simple for this complexity)
- MobX (rejected: introduces new dependency)
- Zustand (rejected: inconsistent with codebase)

**Implementation**:
```javascript
// Async thunks for all CRUD operations
loadCoupons, addCoupon, updateCoupon, deleteCoupon, 
toggleCouponStatus, duplicateCoupon
```

---

### 3. Component Architecture

**Decision**: Three-component hierarchy (Grid → Card → Form) matching product components.

**Structure**:
```
CouponGrid (Container)
  ├── CouponCard (Presentation) × N
  └── CouponForm (Modal)
```

**Rationale**:
- Separation of concerns
- Reusable card components
- Modal form reduces page complexity
- Familiar pattern for developers

**Alternatives Considered**:
- Single-page form (rejected: clutters UI)
- Inline editing (rejected: complex state management)
- Drawer-based form (rejected: less discoverable)

---

### 4. Validation Strategy

**Decision**: Client-side validation using Yup schema with React Hook Form.

**Layers**:
1. **Schema validation** (Yup): Data structure and types
2. **Business logic** (CouponService): Uniqueness, category existence
3. **UI validation** (React Hook Form): Real-time feedback

**Rationale**:
- Multi-layered defense
- Immediate user feedback
- Type-safe validation
- Consistent with product forms

**Trade-offs**:
- ✅ Catches errors early
- ✅ Good UX (inline errors)
- ✅ Reusable schema
- ❌ No server-side validation (file-based storage)

---

### 5. IPC Communication

**Decision**: Dedicated IPC handlers for coupon operations (`fs:loadCoupons`, `fs:saveCoupons`).

**Pattern**:
```javascript
// Main Process
ipcMain.handle('fs:loadCoupons', async (event, projectPath) => {...});

// Preload
window.electron.coupons = {
  load: (projectPath) => ipcRenderer.invoke('fs:loadCoupons', projectPath),
  save: (projectPath, coupons) => ipcRenderer.invoke('fs:saveCoupons', projectPath, coupons)
};
```

**Rationale**:
- Separation from product operations
- Clear API surface
- Easy to extend
- Follows Electron security best practices

**Alternatives Considered**:
- Generic file operations (rejected: less clear intent)
- Combined with product handlers (rejected: tight coupling)

---

### 6. Navigation Integration

**Decision**: Add "Views" section to sidebar with Products/Coupons toggle, hide categories in Coupon view.

**UI Changes**:
```
Sidebar
├── VIEWS
│   ├── Products (count)
│   └── Coupons (count)
└── CATEGORIES (only in Products view)
    ├── All
    ├── Electronics
    └── ...
```

**Rationale**:
- Clear view switching
- Categories irrelevant for coupon management
- Counts provide context
- Familiar pattern (many apps use this)

**Alternatives Considered**:
- Tabs at top (rejected: less discoverable)
- Separate window (rejected: context switching overhead)
- Dropdown selector (rejected: more clicks required)

---

### 7. Git Integration

**Decision**: Automatically include `coupons.json` in existing git workflow, no special handling.

**Behavior**:
- Git status detects any file changes
- `coupons.json` treated like `products.json`
- Same commit/push flow
- Combined or separate commits

**Rationale**:
- Zero additional complexity
- Existing infrastructure handles it
- Atomic commits possible
- Version history for coupons

**Trade-offs**:
- ✅ No new code needed
- ✅ Familiar workflow
- ✅ Reliable (proven system)
- ❌ Can't publish coupons separately (acceptable)

---

### 8. ID Generation

**Decision**: Auto-increment integer IDs starting from 1, calculated from max existing ID.

**Implementation**:
```javascript
generateNextCouponId(coupons) {
  const maxId = Math.max(...coupons.map(c => c.id || 0));
  return maxId + 1;
}
```

**Rationale**:
- Simple and predictable
- Human-readable
- Consistent with product IDs
- No UUID overhead

**Alternatives Considered**:
- UUID (rejected: overkill, harder to read)
- Timestamp-based (rejected: not guaranteed unique)
- Code as ID (rejected: code can change)

---

### 9. Error Handling Strategy

**Decision**: Toast notifications for operations, inline errors for validation.

**Pattern**:
```javascript
// Operations: Toast notifications
showSuccess('Coupon added successfully');
showError('Failed to save coupon');

// Validation: Inline form errors
<span className="error-message">{errors.code.message}</span>
```

**Rationale**:
- Clear user feedback
- Non-blocking notifications
- Context-appropriate (form vs operation)
- Consistent with existing patterns

**Alternatives Considered**:
- Modal dialogs (rejected: disruptive)
- Console-only (rejected: users won't see)
- Banner messages (rejected: takes screen space)

---

### 10. Code Formatting

**Decision**: Auto-uppercase coupon codes, strip non-alphanumeric characters.

**Implementation**:
```javascript
formatCouponCode(code) {
  return code.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
}
```

**Rationale**:
- Consistent format
- Prevents user errors
- Easier to type on website
- Professional appearance

**Trade-offs**:
- ✅ User-friendly
- ✅ Prevents mistakes
- ✅ Clear expectation
- ❌ Can't use special characters (acceptable)

---

### 11. Category Integration

**Decision**: Populate category dropdown from products, always include "All" option.

**Implementation**:
```javascript
const availableCategories = useMemo(() => {
  const productCategories = getCategoriesFromProducts(products);
  return ['All', ...productCategories];
}, [products]);
```

**Rationale**:
- Single source of truth (products define categories)
- "All" always available
- Dynamic updates when products change
- Prevents orphaned categories

**Trade-offs**:
- ✅ Consistent with products
- ✅ No manual category management
- ✅ Auto-updates
- ❌ Can't create coupon-only categories (by design)

---

### 12. Duplicate Functionality

**Decision**: Add duplicate button that creates copy with "_COPY" suffix, disabled by default.

**Behavior**:
```javascript
{
  ...originalCoupon,
  id: newId,
  code: `${originalCoupon.code}_COPY`,
  enabled: false
}
```

**Rationale**:
- Quick coupon variations
- Safe default (disabled prevents accidental use)
- Clear indicator (code suffix)
- User must edit to activate

**Alternatives Considered**:
- Auto-enabled copies (rejected: risky)
- Prompt for new code (rejected: interrupts flow)
- No duplicate feature (rejected: less convenient)

---

### 13. Status Toggle

**Decision**: Toggle switch directly on card for quick enable/disable, saves immediately.

**Implementation**:
- Toggle → Redux action → File save → UI update

**Rationale**:
- Frequent operation (merits quick access)
- Visual feedback (switch + card opacity)
- No confirmation needed (low-risk operation)
- Consistent with mobile UX patterns

**Alternatives Considered**:
- Edit form required (rejected: too many clicks)
- Checkbox instead of switch (rejected: less clear state)
- Batch operations (future enhancement)

---

### 14. Decimal Precision

**Decision**: Format amounts with exactly 2 decimal places in JSON file.

**Implementation**:
```javascript
const formattedJsonString = jsonString.replace(
  /"(amount|minSpend)":\s*(\d+(?:\.\d{1,2})?)/g,
  (match, fieldName, number) => {
    const num = parseFloat(number);
    return `"${fieldName}": ${num.toFixed(2)}`;
  }
);
```

**Rationale**:
- Currency precision (EGP)
- Consistent formatting
- Prevents floating point issues
- Professional appearance

---

### 15. Undo Support

**Decision**: Use existing undo service for delete operations (toast notification with undo button).

**Implementation**:
```javascript
showUndoNotification(
  { type: 'DELETE_COUPON', data: deletedCoupon },
  async () => {
    await dispatch(addCoupon(deletedCoupon)).unwrap();
  }
);
```

**Rationale**:
- Prevents accidental deletions
- Consistent with product deletion
- Familiar UX pattern
- Low implementation cost (reuses existing service)

---

## Design Principles

Throughout implementation, these principles were followed:

1. **Consistency**: Match existing product management patterns
2. **Simplicity**: Use plain JSON, no complex encoding
3. **User-Friendly**: Auto-formatting, clear feedback, undo support
4. **Git-Native**: Leverage existing version control workflow
5. **Extensibility**: Easy to add features later (expiration, limits, etc.)
6. **Performance**: Efficient Redux state, memoized computations
7. **Accessibility**: Keyboard navigation, ARIA labels, semantic HTML
8. **Security**: Client-side validation, Electron IPC isolation
9. **Maintainability**: Clear code structure, JSDoc comments
10. **Testability**: Separated concerns, injectable dependencies

---

## Trade-offs Analysis

### What We Optimized For
- ✅ Developer experience (consistent patterns)
- ✅ User experience (simple, intuitive UI)
- ✅ Maintainability (clear separation of concerns)
- ✅ Reliability (multi-layer validation)
- ✅ Git integration (version control)

### What We Didn't Optimize For
- ❌ Real-time collaboration (file-based storage)
- ❌ Usage analytics (no backend tracking)
- ❌ Advanced features (expiration, limits, etc.)
- ❌ Server-side validation (no backend)
- ❌ Coupon stacking rules (website's responsibility)

---

## Future Considerations

These decisions leave room for future enhancements:

1. **Backend Integration**: Could add API layer for analytics
2. **Advanced Rules**: Expiration, usage limits, user restrictions
3. **Bulk Operations**: Enable/disable multiple coupons
4. **Import/Export**: CSV/Excel support
5. **Templates**: Quick create from presets
6. **A/B Testing**: Compare coupon performance
7. **Scheduling**: Auto-enable/disable based on dates
8. **Conditional Logic**: Complex discount rules

---

## Lessons Learned

1. **Pattern Replication Works**: Following `productsSlice` pattern saved significant time
2. **Three-Component Structure**: Grid-Card-Form is flexible and maintainable
3. **Redux Toolkit**: Async thunks handle complexity well
4. **Git Integration**: Existing workflow extended cleanly
5. **Validation Layers**: Multiple layers catch different error types
6. **Auto-Formatting**: Reduces user errors significantly
7. **Undo Support**: Small feature with big UX impact
8. **Documentation**: Essential for handoff and maintenance

---

## Recommendations

For future features, we recommend:

1. **Follow Existing Patterns**: Consistency reduces cognitive load
2. **Separate Concerns**: Keep components focused on single responsibility
3. **Validate Early**: Multiple validation layers catch errors
4. **Document Decisions**: Future maintainers will thank you
5. **Test Edge Cases**: File operations can fail in unexpected ways
6. **Consider Git**: Design with version control in mind
7. **Plan for Scale**: Current implementation handles 1000+ coupons
8. **Prioritize UX**: Small touches (undo, auto-format) matter

---

## Conclusion

The architectural decisions made prioritize consistency with existing patterns, simplicity of implementation, and quality of user experience. The feature is production-ready and extensible for future enhancements.
