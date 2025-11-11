# Category Rename - Quick Reference

## 🎯 Quick Start

**Rename a category in 3 steps:**
1. Hover over any category in the sidebar
2. Click the edit icon (✏️)
3. Enter new name and click "Rename Category"

## 📍 Where to Find It

**Location**: Sidebar → Categories Section

The edit button appears on hover for all categories except "All".

## ⌨️ Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Escape` | Close rename dialog |

## ✅ Validation Rules

- **Minimum**: 2 characters
- **Maximum**: 50 characters
- **Must be different** from current name

## 💡 What Happens

When you rename a category:
- ✓ All products in that category are updated instantly
- ✓ Changes are saved to products.json
- ✓ Sidebar updates to show new category name
- ✓ Product count remains the same
- ✓ Toast notification confirms success

## 📊 Example

```
Current Category: "Home Goods" (15 products)
New Category: "Home & Living"
Result: All 15 products now have category "Home & Living"
```

## 🚫 Common Errors

| Error | Solution |
|-------|----------|
| "Too short" | Use at least 2 characters |
| "Too long" | Keep under 50 characters |
| "Same name" | Choose a different name |
| "No products" | Category must have products |

## 🔧 Technical Details

**Files Modified:**
- `src/components/Sidebar.jsx` - Added rename button
- `src/components/RenameCategoryDialog.jsx` - Dialog component
- `src/store/slices/productsSlice.js` - Redux action
- `src/services/productService.js` - Bulk update logic

**Redux Action:**
```javascript
dispatch(renameCategory({
  oldCategory: "Electronics",
  newCategory: "Tech & Electronics"
}))
```

## 📝 Notes

- The "All" category cannot be renamed (it's a built-in filter)
- Renaming is case-sensitive
- Changes are immediately saved to disk
- Works with both local and GitHub data sources

---

**Quick Tip**: Use this feature to fix typos, rebrand categories, or standardize naming across your product catalog!
