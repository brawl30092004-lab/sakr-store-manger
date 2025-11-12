# Field-Level Conflict Resolution Feature

**Date Implemented:** November 12, 2025  
**Feature Type:** Enhancement  
**Status:** ✅ Complete

---

## 🎯 Overview

This feature adds **granular field-level conflict resolution** to the Sakr Store Manager, allowing users to select which specific fields to keep from local vs GitHub versions on a per-field basis, rather than choosing all-or-nothing for entire products.

---

## 💡 Problem Statement

**Previous Behavior:**
When conflicts occurred, users had only 3 options:
1. **Use My Version** - Keep ALL local changes, lose ALL GitHub changes
2. **Keep Store Version** - Keep ALL GitHub changes, lose ALL local changes
3. **Smart Merge** - Automatic merge (great when it works, but limited control)

**User Request:**
> "The user can select each category separately. For example:
> - local price = $69.99 | GitHub price = $99.99
> - local stock = 10 | GitHub stock = 15
> 
> The user can select what to keep separately, not just (smart - only local or only GitHub) for all."

---

## ✨ Solution

### Advanced Mode UI
Added a new **"Choose Individual Fields (Advanced)"** mode that:
- Shows all conflicting fields for each product
- Allows clicking on individual fields to select which version to keep
- Provides visual feedback (selected fields are highlighted)
- Includes quick-select buttons ("Use All My Values" / "Use All Store Values")
- Maintains the simple mode for users who prefer quick decisions

---

## 🎨 User Interface

### Simple Mode (Default)
```
┌─────────────────────────────────────┐
│  Merge Conflict Detected            │
├─────────────────────────────────────┤
│  Product: Office Chair              │
│  Price:                             │
│  Store: $199.99  →  Your: $249.99   │
│  Description:                       │
│  Store: "New desc"  →  Your: "Old"  │
├─────────────────────────────────────┤
│  [Smart Merge] [Use My Version]     │
│  [Keep Store] [Cancel]              │
│                                     │
│  [🎯 Choose Individual Fields]      │
└─────────────────────────────────────┘
```

### Advanced Mode (New!)
```
┌─────────────────────────────────────┐
│  🎯 Custom Field Selection          │
│  Click any field to choose version  │
│  [← Back to Simple Mode]            │
├─────────────────────────────────────┤
│  Product: Office Chair              │
│  [Use All My Values][Use All Store] │
│                                     │
│  Price:                             │
│  ○ Store: $199.99  ● Your: $249.99  │
│     ↑ Click to select               │
│                                     │
│  Description:                       │
│  ● Store: "New desc"  ○ Your: "Old" │
│     ↑ Selected                      │
├─────────────────────────────────────┤
│  [✓ Apply Custom Selection]         │
│  [Cancel]                           │
└─────────────────────────────────────┘
```

**Visual Indicators:**
- ✅ Selected fields have green border + highlight
- 🎯 Radio buttons show current selection
- 🖱️ Hover effects for interactive feedback
- 📦 Product grouping with quick-select buttons

---

## 🔧 Technical Implementation

### 1. Backend - `gitService.js`

**New Method:** `resolveConflictWithFieldSelections(fieldSelections)`

```javascript
// Input format:
[
  { productId: '123', field: 'price', useLocal: true },
  { productId: '123', field: 'description', useLocal: false },
  { productId: '456', field: 'stock', useLocal: true }
]

// Process:
1. Detect conflict type (merge vs stash-pop)
2. Load clean versions from git
3. Merge products field-by-field based on selections
4. Write merged content to file
5. Stage and commit resolution
```

**Key Features:**
- Handles both merge and stash-pop conflicts correctly
- Preserves all product fields (not just selected ones)
- Validates selections before applying
- Atomic operation (all or nothing)

### 2. Frontend - `ConflictResolutionDialog.jsx`

**New State:**
```javascript
const [showAdvancedMode, setShowAdvancedMode] = useState(false);
const [fieldSelections, setFieldSelections] = useState({});
// Format: { productId: { field: useLocal (boolean) } }
```

**New Functions:**
- `toggleFieldSelection(productId, field)` - Toggle individual field
- `selectAllForProduct(productId, useLocal)` - Quick select all fields
- `handleAdvancedResolve()` - Apply custom selections

**UI Components:**
- Toggle button to enter advanced mode
- Interactive field boxes (clickable)
- Radio buttons for clear selection state
- Product-level quick-select buttons
- Back button to return to simple mode

### 3. IPC Layer

**New Handler:** `git:resolveConflictWithFieldSelections`
- Added to `electron/main.cjs`
- Added to `electron/preload.js` API
- Integrated with existing git service infrastructure

### 4. Conflict Handler Hook

**Updated:** `useConflictHandler.js`
- Recognizes 'custom' resolution type
- Shows appropriate success message
- Continues publish workflow after custom resolution

---

## 📊 Files Modified

| File | Changes | Lines |
|------|---------|-------|
| `src/services/gitService.js` | Added `resolveConflictWithFieldSelections()` | +150 |
| `src/components/ConflictResolutionDialog.jsx` | Advanced mode UI + logic | +200 |
| `src/components/ConflictResolutionDialog.css` | Advanced mode styles | +180 |
| `src/hooks/useConflictHandler.js` | Handle custom resolution | +10 |
| `electron/main.cjs` | IPC handler | +35 |
| `electron/preload.js` | API exposure | +1 |
| **Total** | | **~576 lines** |

---

## 🎯 Usage Examples

### Example 1: Mix Local and Remote Changes

**Scenario:** You updated the price locally ($249.99), but GitHub has a better description.

**Steps:**
1. Conflict dialog appears
2. Click "🎯 Choose Individual Fields (Advanced)"
3. For "Office Chair":
   - Click on "Your Version" under Price (keep $249.99)
   - Click on "Store" under Description (keep GitHub's description)
4. Click "✓ Apply Custom Selection"
5. Result: Product has YOUR price + GITHUB's description ✅

### Example 2: Quick Select for Multiple Fields

**Scenario:** Product has 5 conflicting fields, you want ALL your values.

**Steps:**
1. Enter advanced mode
2. Click "Use All My Values" button
3. All fields auto-selected to "Your Version"
4. Adjust individual fields if needed (optional)
5. Apply

### Example 3: Per-Product Different Choices

**Scenario:** 2 products in conflict.

**Steps:**
1. Product A: Click "Use All Store Values"
2. Product B: Manually select: Your price, Store stock, Your description
3. Apply
4. Result: Each product resolved differently ✅

---

## 🧪 Testing Scenarios

### Test 1: Basic Field Selection
```
1. Create conflict with 2 fields (price + description)
2. Enter advanced mode
3. Select: Your price, Store description
4. Apply → Verify mixed result on GitHub
```

### Test 2: Toggle Selection
```
1. Select "Your Version" for price
2. Click again → switches to "Store" 
3. Radio button updates
4. Visual highlight changes
```

### Test 3: Quick Select Buttons
```
1. Click "Use All My Values" → All radio buttons on "Your Version"
2. Click "Use All Store Values" → All switch to "Store"
3. Manually change one field → Others stay selected
```

### Test 4: Multiple Products
```
1. Create conflict with 3 products
2. Product 1: Use All My Values
3. Product 2: Mix selections
4. Product 3: Use All Store Values
5. Apply → Each resolved correctly
```

### Test 5: Cancel and Back
```
1. Enter advanced mode
2. Make some selections
3. Click "← Back to Simple Mode"
4. Re-enter advanced mode → Selections reset to defaults
5. Click "Cancel" → Conflict aborted cleanly
```

---

## 🎨 Design Decisions

### Why Radio Buttons?
- **Clear binary choice** (can't select both versions)
- **Standard UI pattern** users understand
- **Visual confirmation** of selection state

### Why "Advanced Mode" Toggle?
- **Don't overwhelm beginners** with complex UI immediately
- **Progressive disclosure** - show advanced options only when needed
- **Keep simple mode clean** for 90% of use cases

### Why Click-to-Select?
- **Faster** than dropdowns or separate buttons
- **Visual** - users see both versions side-by-side
- **Intuitive** - click what you want to keep

### Why Highlight Selected Fields?
- **Immediate feedback** - no guessing what's selected
- **Easier review** - scan quickly before applying
- **Reduced errors** - clear visual confirmation

---

## 🚀 Benefits

### User Benefits
✅ **Granular control** - Keep exact combination of changes wanted  
✅ **No data loss** - Don't have to sacrifice one entire version  
✅ **Flexibility** - Handle complex multi-field conflicts easily  
✅ **Time-saving** - No need to manually re-edit after resolution  
✅ **Confidence** - See exactly what you're choosing

### Developer Benefits
✅ **Extensible** - Easy to add more fields  
✅ **Reusable** - Field selection pattern can apply to other features  
✅ **Well-tested** - Clear input/output, easy to validate  
✅ **Maintainable** - Clean separation of concerns

---

## 📝 Future Enhancements (Ideas)

### V2 Enhancements:
1. **Diff Highlighting** - Show exactly what changed in each field
2. **Smart Suggestions** - AI-powered recommendation of which to keep
3. **Undo/Redo** - Let users try selections and revert
4. **Presets** - Save common selection patterns ("Always keep my prices")
5. **Comparison View** - Side-by-side full product preview
6. **Conflict History** - Track how past conflicts were resolved

### Advanced Features:
- **Three-way merge** - Show base version + both changes
- **Manual edit** - Allow typing new value in dialog
- **Conditional rules** - "If price changed by me, keep mine"
- **Team sync** - See who made which changes

---

## 🎓 Code Examples

### Using the Feature Programmatically

```javascript
// Format field selections
const selections = [
  { productId: 'prod-001', field: 'price', useLocal: true },
  { productId: 'prod-001', field: 'description', useLocal: false },
  { productId: 'prod-002', field: 'stock', useLocal: true }
];

// Resolve with selections
const result = await window.electron.resolveConflictWithFieldSelections(selections);

if (result.success) {
  console.log('Resolved with custom selections!');
  // Continue with publish...
}
```

### Backend Resolution Logic

```javascript
// Merge products based on field selections
const merged = { id: productId };

for (const field of fields) {
  if (selections[field] === true) {
    merged[field] = localProduct[field]; // User selected local
  } else {
    merged[field] = remoteProduct[field]; // User selected remote
  }
}

// Write merged content
await fs.writeFile(path, JSON.stringify(mergedProducts, null, 2));
```

---

## ✅ Completion Checklist

- [x] Backend method for field-level resolution
- [x] IPC handler in main process
- [x] Preload API exposure
- [x] Advanced mode UI in dialog
- [x] Interactive field selection
- [x] Radio button indicators
- [x] Quick-select buttons
- [x] Visual feedback (highlights)
- [x] CSS styling for advanced mode
- [x] Conflict handler integration
- [x] Success messages
- [x] Error handling
- [x] Documentation

---

## 🎉 Summary

The field-level conflict resolution feature provides users with **precise control** over how conflicts are resolved, eliminating the all-or-nothing limitation of the previous system. Users can now:

- 🎯 Choose individual fields to keep
- 📊 See both versions side-by-side
- ⚡ Quickly select all fields from one source
- 🔄 Toggle between simple and advanced modes
- ✅ Apply custom selections with confidence

**Result:** More flexible, user-friendly conflict resolution that adapts to users' needs! 🚀
