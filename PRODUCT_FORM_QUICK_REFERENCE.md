# Product Form Part 1 - Quick Reference

## 🚀 Quick Start

```bash
# Start development server
npm run dev

# Open browser to http://localhost:5173/
# Click "+ New Product" or "Edit" on any product
```

---

## 📋 Form Fields Reference

### Required Fields (marked with red *)

| Field Name | Type | Validation | Default |
|------------|------|------------|---------|
| Product Name | Text | 3-200 chars | "" |
| Category | Select | Required | "Apparel" |
| Description | Textarea | 10-1000 chars | "" |
| Regular Price | Number | 0.01-999999.99, 2 decimals | 0.00 |
| Stock Level | Number | 0-9999, integer | 0 |

### Optional Fields

| Field Name | Type | Validation | Default |
|------------|------|------------|---------|
| Product is on discount | Checkbox | Boolean | false |
| Discounted Price | Number | < Regular Price (if discount=true) | 0.00 |
| Mark as New | Checkbox | Boolean | true |

---

## 🎯 Test Scenarios

### ✅ Validation Tests

```javascript
// Name Validation
"A"          → ❌ "Name must be at least 3 characters long"
"AB"         → ❌ "Name must be at least 3 characters long"
"ABC"        → ✅ Valid
"   "        → ❌ "Name cannot be empty or only whitespace"

// Price Validation
0            → ❌ "Price must be greater than 0"
-5           → ❌ "Price must be greater than 0"
0.001        → ❌ "Price must have exactly 2 decimal places"
99.99        → ✅ Valid
1000000      → ❌ "Price must not exceed 999,999.99 EGP"

// Stock Validation
-1           → ❌ "Stock cannot be negative"
5.5          → ❌ "Stock must be an integer"
50           → ✅ Valid
10000        → ❌ "Stock cannot exceed 9999"

// Discounted Price (when discount = true)
Price=100, DiscountedPrice=120  → ❌ "Must be less than regular price"
Price=100, DiscountedPrice=80   → ✅ Valid
```

### ✅ Conditional Field Test

```
1. Open form
2. Verify "Discounted Price" is HIDDEN
3. Check "Product is on discount"
4. Verify "Discounted Price" appears with animation
5. Uncheck "Product is on discount"
6. Verify "Discounted Price" disappears
```

### ✅ Button State Test

```
Invalid Form   → Save button DISABLED (grayed out)
Valid Form     → Save button ENABLED (blue/green)
Click Cancel   → Form closes, no save
Click Save     → Saves, keeps form open
Click Save & Close → Saves and closes form
```

---

## 🔧 Component Usage

### Opening Form for New Product

```javascript
// Automatically handled by "+ New Product" button
// Uses defaultProduct from productsSlice.js
```

### Opening Form for Edit Product

```javascript
// Automatically handled by "Edit" button on product cards
// Passes existing product data to form
```

### Form Props

```javascript
<ProductForm
  product={existingProduct || defaultProduct}
  onClose={() => setIsFormOpen(false)}
  onSave={(data) => dispatch(addProductLocal(data))}
/>
```

---

## 📁 Key Files

```
src/
├── components/
│   ├── ProductForm.jsx         ← Main form component
│   ├── ProductForm.css         ← Form styling
│   ├── MainContent.jsx         ← Updated with form integration
│   └── MainContent.css         ← Added toolbar styles
├── services/
│   └── productSchema.js        ← Yup validation schema
└── store/slices/
    └── productsSlice.js        ← Redux state & actions
```

---

## 🎨 CSS Classes Reference

### Form Structure
- `.product-form-overlay` - Modal backdrop
- `.product-form-container` - Form container
- `.product-form-header` - Header with title
- `.product-form` - Form element
- `.form-section` - Section container
- `.section-title` - Section heading

### Form Fields
- `.form-group` - Field container
- `.form-label` - Field label
- `.form-input` - Text/number input
- `.form-textarea` - Textarea
- `.form-select` - Dropdown select
- `.form-checkbox` - Checkbox input

### States
- `.input-error` - Error state (red border)
- `.error-message` - Error text
- `.required` - Required indicator (*)
- `:disabled` - Disabled button state

### Buttons
- `.btn` - Base button
- `.btn-primary` - Save button
- `.btn-success` - Save & Close button
- `.btn-secondary` - Cancel button
- `.btn-close` - X close button

---

## 🐛 Troubleshooting

### Form doesn't open
- ✅ Check console for errors
- ✅ Verify "+ New Product" button renders
- ✅ Check `isFormOpen` state

### Validation not working
- ✅ Verify `@hookform/resolvers` is installed
- ✅ Check `yupResolver` is imported
- ✅ Verify `productSchema` is imported

### Save button always disabled
- ✅ Check all required fields are filled
- ✅ Verify no validation errors
- ✅ Check console for validation messages

### Discounted Price doesn't appear
- ✅ Verify "Product is on discount" is checked
- ✅ Check `watch('discount')` is working
- ✅ Verify conditional rendering logic

---

## 📊 Form State Flow

```
New Product:
  Click "+ New Product"
    ↓
  isFormOpen = true
  editingProduct = null
    ↓
  Form renders with defaultProduct
    ↓
  User fills form
    ↓
  Click "Save & Close"
    ↓
  dispatch(addProductLocal(data))
    ↓
  Form closes

Edit Product:
  Click "Edit" on product card
    ↓
  isFormOpen = true
  editingProduct = product
    ↓
  Form renders with product data
    ↓
  User modifies form
    ↓
  Click "Save & Close"
    ↓
  dispatch(updateProductLocal({ id, data }))
    ↓
  Form closes
```

---

## ⌨️ Keyboard Shortcuts

- `Tab` - Navigate forward through fields
- `Shift + Tab` - Navigate backward through fields
- `Enter` - Submit form (when focused on button)
- `Space` - Toggle checkboxes
- `Esc` - Close form (future enhancement)

---

## 📱 Responsive Breakpoints

```css
Desktop:  > 768px  (Full width, side-by-side buttons)
Mobile:   ≤ 768px  (95% width, stacked buttons)
```

---

## 🌐 Browser Support

- ✅ Electron (Chromium) - Primary target
- ✅ Chrome/Edge (Latest)
- ✅ Firefox (Latest)
- ✅ Safari (Latest - with minor CSS differences)

---

## 📝 Quick Validation Reference

```javascript
// All fields use productSchema.js
import { productSchema } from '../services/productSchema';
import { yupResolver } from '@hookform/resolvers/yup';

// Form setup
const { register, handleSubmit, formState: { errors, isValid }, watch } = useForm({
  resolver: yupResolver(productSchema),
  mode: 'onChange',  // Real-time validation
  defaultValues: product || defaultProduct
});

// Register field
<input {...register('name')} />

// Display error
{errors.name && <span>{errors.name.message}</span>}

// Conditional rendering
{watch('discount') && <input {...register('discountedPrice')} />}

// Check form validity
<button disabled={!isValid}>Save</button>
```

---

## 🎯 Common Use Cases

### Create New Product
1. Click "+ New Product"
2. Fill in: Name, Description, Price, Stock
3. Select Category
4. Click "Save & Close"

### Edit Product Price
1. Click "Edit" on product
2. Change Price field
3. Click "Save & Close"

### Add Discount
1. Click "Edit" on product
2. Check "Product is on discount"
3. Enter Discounted Price (< Regular Price)
4. Click "Save & Close"

### Remove "New" Badge
1. Click "Edit" on product
2. Uncheck "Mark as New"
3. Click "Save & Close"

---

## 🔗 Related Documentation

- `PRODUCT_FORM_PART1_SUMMARY.md` - Full implementation details
- `PRODUCT_FORM_TESTING_GUIDE.md` - Comprehensive test cases
- `PRODUCTSERVICE_IMPLEMENTATION.md` - Product service documentation
- `SCHEMA_VALIDATION_SUMMARY.md` - Validation schema details

---

## 💡 Tips & Best Practices

1. **Always fill required fields first** - Form won't save until valid
2. **Watch for red borders** - Indicates validation errors
3. **Read error messages** - They tell you exactly what's wrong
4. **Use Save vs Save & Close** - Save keeps form open for more edits
5. **Test with edge cases** - Try minimum/maximum values
6. **Check discount logic** - Discounted price must be less than regular price

---

## 🎉 Success Indicators

✅ Form opens when clicking "+ New Product"  
✅ Form opens with data when clicking "Edit"  
✅ Validation errors appear in real-time  
✅ Save button is disabled for invalid forms  
✅ Discounted Price appears when discount is checked  
✅ Products appear in list after saving  
✅ Edits reflect immediately in product cards  
✅ No console errors  

---

**Quick Access:** All form functionality is accessible from the main product list interface. No configuration needed!
