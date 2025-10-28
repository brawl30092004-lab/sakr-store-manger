# Part 4 Quick Reference

## Product Schema - Images & Flags

### Field Specifications

#### images (Object, Required)
```javascript
images: {
  primary: "images/product.jpg",  // Required: Main image path
  gallery: []                      // Optional: Array of additional images (max 10)
}
```

#### image (String, Auto-Populated)
```javascript
image: "images/product.jpg"  // ✅ Automatically synced with images.primary
                              // ⚠️ Hidden from UI - managed automatically
```

#### isNew (Boolean, Required)
```javascript
isNew: true   // Shows "New" badge
isNew: false  // No badge
```

---

## Validation Quick Reference

### images.primary
- ✅ **Type:** String
- ✅ **Required:** Yes
- ✅ **Constraint:** Non-empty string
- ❌ **Invalid:** `""`, `null`, `undefined`, numbers

### images.gallery
- ✅ **Type:** Array of Strings
- ✅ **Required:** No (defaults to `[]`)
- ✅ **Constraint:** Max 10 images
- ❌ **Invalid:** Not an array, non-string elements, >10 items

### isNew
- ✅ **Type:** Boolean
- ✅ **Required:** Yes
- ✅ **Default:** `true` (for new products)
- ❌ **Invalid:** `"true"`, `1`, `0`, strings, numbers

---

## Code Examples

### Valid Product (Part 4)
```javascript
{
  images: {
    primary: "images/tshirt-blue.jpg",
    gallery: [
      "images/tshirt-blue-back.jpg",
      "images/tshirt-blue-detail.jpg"
    ]
  },
  image: "images/tshirt-blue.jpg",  // Auto-populated
  isNew: true
}
```

### Default Product Template
```javascript
import { defaultProduct } from './store/slices/productsSlice';

const newProduct = {
  ...defaultProduct,
  name: "My Product",
  price: 99.99,
  // images.primary, image will be auto-synced on save
  // isNew is already true by default
};
```

---

## Validation Functions

```javascript
import {
  validateProductImages,
  validateProductImagePrimary,
  validateProductImageGallery,
  validateProductIsNew
} from './services/productValidation';

// Validate complete images object
validateProductImages({ primary: "img.jpg", gallery: [] });
// { valid: true, error: null }

// Validate primary image
validateProductImagePrimary("images/product.jpg");
// { valid: true, error: null }

// Validate gallery
validateProductImageGallery(["img1.jpg", "img2.jpg"]);
// { valid: true, error: null }

// Validate isNew flag
validateProductIsNew(true);
// { valid: true, error: null }
```

---

## Auto-Population

The `image` field is **automatically synchronized** with `images.primary`:

```javascript
// ❌ DON'T do this manually:
product.image = product.images.primary;

// ✅ Just use productService methods:
await productService.addProduct(product);
await productService.updateProduct(id, product);

// The image field is synced automatically before saving
```

---

## UI Display

### "New" Badge
```jsx
{product.isNew && <span className="badge badge-new">New</span>}
```

**Styling:**
- Background: Green (#4CAF50)
- Position: Top-right corner of product image
- Text: "NEW" (uppercase)

### Both Badges
```jsx
{product.isNew && <span className="badge badge-new">New</span>}
{product.discount && <span className="badge badge-discount">Sale</span>}
```

---

## Common Patterns

### Creating New Product
```javascript
import { defaultProduct } from './store/slices/productsSlice';

const product = {
  ...defaultProduct,
  name: "Blue T-Shirt",
  price: 299.99,
  description: "Comfortable cotton t-shirt",
  images: {
    primary: "images/tshirt-blue.jpg",
    gallery: ["images/tshirt-blue-back.jpg"]
  },
  stock: 50
  // isNew: true (already set by default)
  // image: will be auto-populated
};
```

### Marking Product as No Longer New
```javascript
await productService.updateProduct(productId, {
  isNew: false
});
```

---

## Error Messages

| Error | Cause | Solution |
|-------|-------|----------|
| "Images must be an object" | `images` is not an object | Use `{ primary: "...", gallery: [] }` |
| "Images object must have a primary property" | Missing `primary` | Add `primary: "path/to/image.jpg"` |
| "Primary image cannot be empty" | `primary: ""` | Provide a valid file path |
| "Gallery must be an array" | `gallery` is not an array | Use `gallery: []` or `gallery: ["img1.jpg"]` |
| "Gallery cannot exceed 10 images" | More than 10 items in array | Limit to 10 images maximum |
| "Gallery image at index X must be a string" | Non-string in gallery | Ensure all elements are strings |
| "isNew must be a boolean" | Not `true` or `false` | Use `true` or `false` only |

---

## Testing Checklist

- [ ] Images object has primary property
- [ ] Primary is a non-empty string
- [ ] Gallery is an array
- [ ] Gallery has max 10 items
- [ ] All gallery items are strings
- [ ] isNew is a boolean
- [ ] image field auto-syncs on save
- [ ] "New" badge shows when isNew is true
- [ ] "New" badge hidden when isNew is false

---

## Import Paths

```javascript
// Validation functions
import {
  validateProductImages,
  validateProductImagePrimary,
  validateProductImageGallery,
  validateProductIsNew
} from './services/productValidation';

// Default product template
import { defaultProduct } from './store/slices/productsSlice';

// Product service (auto-syncs image field)
import ProductService from './services/productService';
```

---

**Quick Tip:** The `image` field is for backward compatibility only. Always use the modern `images` object in your UI and forms. The legacy field is managed automatically! 🎯
