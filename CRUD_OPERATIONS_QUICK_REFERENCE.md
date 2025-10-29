# CRUD Operations - Quick Reference Guide

## 🚀 Quick Start

Development server is running at: **http://localhost:5173/**

All CRUD operations are now fully functional!

---

## 📋 Operations Overview

| Operation | Button | Confirmation | Updates File | Sets hasUnsavedChanges |
|-----------|--------|--------------|--------------|------------------------|
| **Create** | + New Product | No | ✅ | ✅ |
| **Read** | (Auto-load) | No | ❌ | ❌ |
| **Update** | ✏️ Edit | No | ✅ | ✅ |
| **Delete** | 🗑️ Delete | ✅ Yes | ✅ | ✅ |
| **Duplicate** | 📋 Duplicate | No | ✅ | ✅ |

---

## 🎯 Quick Test Guide

### ✅ Test 1: Add Product (30 seconds)
```
1. Click "+ New Product"
2. Fill: Name="Test Product", Description="Test description here", Price=99.99, Stock=50
3. Click "Save & Close"
4. ✓ Product appears in list
5. ✓ Check products.json file
```

### ✅ Test 2: Edit Product (20 seconds)
```
1. Click "Edit" on any product
2. Change price to 79.99
3. Click "Save & Close"
4. ✓ Product card shows new price
5. ✓ Check products.json file
```

### ✅ Test 3: Delete Product (15 seconds)
```
1. Click "Delete" on any product
2. Confirmation modal appears
3. Click "Delete" button
4. ✓ Product removed from list
5. ✓ Check products.json file
```

### ✅ Test 4: Duplicate Product (10 seconds)
```
1. Click "Duplicate" on any product
2. ✓ New product appears with "(Copy)" in name
3. ✓ New product has different ID
4. ✓ Check products.json file
```

---

## 🔧 Redux Thunks Usage

### Import
```javascript
import { addProduct, updateProduct, deleteProduct, duplicateProduct } from '../store/slices/productsSlice';
```

### Add Product
```javascript
const newProduct = {
  name: "Product Name",
  description: "Product description",
  price: 99.99,
  stock: 100,
  category: "Apparel",
  discount: false,
  discountedPrice: 0.00,
  isNew: true,
  images: { primary: "", gallery: [] }
};

dispatch(addProduct(newProduct));
```

### Update Product
```javascript
dispatch(updateProduct({
  id: 5,
  updates: {
    name: "Updated Name",
    price: 79.99
  }
}));
```

### Delete Product
```javascript
dispatch(deleteProduct(5));
```

### Duplicate Product
```javascript
dispatch(duplicateProduct(5));
```

---

## 📁 Files Modified

```
✅ src/services/productService.js        (+30 lines)
   └─ Added duplicateProduct() method

✅ src/store/slices/productsSlice.js     (+150 lines)
   └─ Added 4 async thunks + reducers

✅ src/components/MainContent.jsx        (+60 lines)
   └─ Updated handlers + delete modal

✅ src/components/MainContent.css        (+90 lines)
   └─ Added confirmation modal styles
```

---

## 🔍 What Happens Behind the Scenes

### Add Product Flow:
```
User submits form
  ↓
dispatch(addProduct(data))
  ↓
ProductService.addProduct()
  ├─ Generate ID (max + 1)
  ├─ Set image = images.primary
  ├─ Validate
  └─ Save to products.json
  ↓
Redux: state.items = updatedArray
Redux: hasUnsavedChanges = true
```

### Duplicate Product Flow:
```
User clicks "Duplicate"
  ↓
dispatch(duplicateProduct(id))
  ↓
ProductService.duplicateProduct()
  ├─ Find product by ID
  ├─ Copy without ID
  ├─ Append "(Copy)" to name
  └─ Call addProduct(copy)
      ├─ Generate new ID
      └─ Save to products.json
  ↓
Redux: state.items = updatedArray
Redux: hasUnsavedChanges = true
```

---

## 🎨 Delete Confirmation Modal

### Modal Structure:
```
┌─────────────────────────────┐
│ Confirm Delete              │
│                             │
│ Are you sure you want to    │
│ delete this product?        │
│                             │
│ This action cannot be       │
│ undone. (in red)           │
│                             │
│        [Cancel]  [Delete]   │
└─────────────────────────────┘
```

### Behavior:
- Appears on clicking "Delete" button
- Cancel → Closes modal, no action
- Delete → Removes product, updates file
- Overlay backdrop (semi-transparent)
- Smooth animations

---

## 💡 Key Features

### ✅ Automatic ID Generation
- Uses `generateNextProductId()` from validation
- Finds max ID and adds 1
- Works for both add and duplicate

### ✅ Automatic Image Sync
- `product.image = product.images.primary`
- Applied on every save operation
- Maintains backward compatibility

### ✅ Full Validation
- All operations validate before saving
- Invalid data cannot be persisted
- Descriptive error messages

### ✅ State Management
- `hasUnsavedChanges` flag tracks modifications
- Can trigger "unsaved changes" warnings
- Useful for Git integration prompts

---

## 🧪 Verification Checklist

After each operation, verify:

- [ ] Product list updates immediately
- [ ] `products.json` file is updated
- [ ] No console errors
- [ ] Redux state shows `hasUnsavedChanges = true`
- [ ] Product IDs are unique
- [ ] Validation rules still apply

---

## 🐛 Troubleshooting

### Product not appearing after add?
- ✅ Check console for errors
- ✅ Verify all required fields filled
- ✅ Check `products.json` file directly
- ✅ Verify project path is set in settings

### Delete button doesn't work?
- ✅ Confirmation modal should appear first
- ✅ Click "Delete" in modal, not "Cancel"
- ✅ Check console for errors

### Duplicate creates weird name?
- ✅ It should append "(Copy)" to original name
- ✅ Example: "T-Shirt" → "T-Shirt (Copy)"
- ✅ This is expected behavior

### Changes not saving to file?
- ✅ Verify project path is set
- ✅ Check file permissions
- ✅ Look for errors in console
- ✅ Verify Electron IPC is working

---

## 📊 State Structure

```javascript
// Redux products state
{
  items: [...products],      // Array of all products
  loading: false,            // True during async operations
  error: null,               // Error message if operation fails
  hasUnsavedChanges: false   // True after any CRUD operation
}
```

---

## 🎯 Common Scenarios

### Scenario 1: Create Product Template
```javascript
// User wants to create similar products
1. Create first product manually
2. Click "Duplicate" on it
3. Click "Edit" on duplicate
4. Change name and specific fields
5. Click "Save & Close"
6. Repeat for more variants
```

### Scenario 2: Update Multiple Products
```javascript
// User wants to update prices
1. Click "Edit" on product
2. Change price
3. Click "Save" (not "Save & Close")
4. Continue editing or close
5. Repeat for other products
```

### Scenario 3: Clean Up Products
```javascript
// User wants to remove old products
1. Click "Delete" on product
2. Confirm deletion
3. Product removed immediately
4. Repeat for other products
```

---

## 🚀 Performance Notes

- ✅ All operations are async (non-blocking)
- ✅ File operations happen in main process (Electron)
- ✅ UI updates immediately via Redux
- ✅ Validation runs before save (prevents invalid data)
- ✅ Array replacement ensures consistency

---

## 📞 Quick Help

### Check if CRUD is working:
```javascript
// Open browser console
// Check Redux state
window.__REDUX_DEVTOOLS_EXTENSION__

// Or use React DevTools
// Navigate to products slice
```

### Verify file updates:
```
1. Open: mockup products and images/products.json
2. Perform operation (add/edit/delete/duplicate)
3. Refresh file view
4. See changes immediately
```

---

## ✨ Next Features (Part 3)

- Image upload and management
- Batch operations
- Advanced filtering
- Undo/Redo functionality
- Toast notifications
- Loading indicators

---

**Quick Access:**
- Server: http://localhost:5173/
- Redux DevTools: Right-click → Inspect → Redux tab
- Products File: `mockup products and images/products.json`

**All CRUD operations are production-ready!** 🎉
