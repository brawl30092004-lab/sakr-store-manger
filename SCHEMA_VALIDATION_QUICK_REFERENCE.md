# Schema Validation Quick Reference

## Import

```javascript
import {
  productSchema,
  validateProductYup,
  validateProductYupSync,
  validateProductWithDetails,
  isProductValid
} from './services/productSchema';
```

---

## Validation Functions

### 1. validateProductYup (Async) - Recommended
```javascript
const result = await validateProductYup(product);
// { valid: true, errors: [] }
// or
// { valid: false, errors: ["Name is required", "Price must be positive"] }
```

### 2. validateProductYupSync (Sync)
```javascript
const result = validateProductYupSync(product);
// Same return structure as async version
```

### 3. validateProductWithDetails (Async)
```javascript
const result = await validateProductWithDetails(product);
// { valid: false, errors: { name: "Name is required", price: "..." } }
```

### 4. isProductValid (Async)
```javascript
const isValid = await isProductValid(product);
// true or false
```

---

## Product Schema

```javascript
{
  id: yup.number().integer().positive(),
  name: yup.string().required().min(3).max(200),
  price: yup.number().required().positive().min(0.01).max(999999.99),
  description: yup.string().required().min(10).max(1000),
  category: yup.string().required().min(2).max(50),
  discount: yup.boolean().required(),
  discountedPrice: yup.number().required().positive()
    .when('discount', { is: true, then: lessThan(price) }),
  stock: yup.number().required().integer().min(0).max(9999),
  isNew: yup.boolean().required(),
  images: yup.object().shape({
    primary: yup.string().required(),
    gallery: yup.array().of(yup.string()).max(10)
  }).required(),
  image: yup.string()
}
```

---

## Validation Rules

| Field | Min | Max | Type | Required |
|-------|-----|-----|------|----------|
| `id` | 1 | ∞ | Integer | Yes |
| `name` | 3 chars | 200 chars | String | Yes |
| `price` | 0.01 | 999999.99 | Number (2 decimals) | Yes |
| `description` | 10 chars | 1000 chars | String | Yes |
| `category` | 2 chars | 50 chars | String | Yes |
| `discount` | - | - | Boolean | Yes |
| `discountedPrice` | 0.01 | ∞ | Number (2 decimals) | Yes |
| `stock` | 0 | 9999 | Integer | Yes |
| `isNew` | - | - | Boolean | Yes |
| `images.primary` | 1 char | ∞ | String | Yes |
| `images.gallery` | 0 | 10 items | Array | No |
| `image` | - | - | String | No |

---

## Special Rules

### Discount Price
- When `discount = true`: must be less than `price`
- When `discount = false`: can equal `price`

### Whitespace
- Name, description, category cannot be only whitespace
- Trimmed value must meet minimum length

### Decimal Places
- Price and discountedPrice must have max 2 decimal places
- Whole numbers accepted (10 → 10.00)

---

## Error Messages

### Common Errors
```javascript
"Name is required"
"Name must be at least 3 characters long"
"Name must not exceed 200 characters"
"Name cannot be empty or only whitespace"

"Price is required"
"Price must be greater than 0"
"Price must be at least 0.01 EGP"
"Price must not exceed 999,999.99 EGP"
"Price must have exactly 2 decimal places"

"Discounted price must be less than regular price"

"Stock cannot be negative"
"Stock cannot exceed 9999"
"Stock must be an integer"

"Primary image is required"
"Primary image cannot be empty"
"Gallery cannot exceed 10 images"
```

---

## Usage Examples

### Example 1: Validate Before Save
```javascript
async function saveProduct(product) {
  const result = await validateProductYup(product);
  
  if (!result.valid) {
    throw new Error(`Validation failed: ${result.errors.join(', ')}`);
  }
  
  // Save product
  await productService.saveProducts([product]);
}
```

### Example 2: Form Validation
```javascript
async function handleSubmit(formData) {
  const result = await validateProductWithDetails(formData);
  
  if (!result.valid) {
    // Set errors for each field
    Object.keys(result.errors).forEach(field => {
      setFieldError(field, result.errors[field]);
    });
    return;
  }
  
  // Submit form
  await addProduct(formData);
}
```

### Example 3: Quick Validation
```javascript
if (await isProductValid(product)) {
  console.log('✅ Product is valid');
} else {
  console.log('❌ Product has errors');
}
```

---

## Test Commands

```bash
# Run all tests
npm test

# Run tests once
npm run test:run

# Run with UI
npm run test:ui

# Run specific test file
npm run test:run src/tests/productSchema.test.js
```

---

## Valid Product Example

```javascript
const validProduct = {
  id: 1,
  name: "Blue Cotton T-Shirt",
  price: 299.99,
  description: "Comfortable cotton t-shirt perfect for casual wear.",
  category: "Apparel",
  discount: false,
  discountedPrice: 299.99,
  stock: 50,
  isNew: true,
  images: {
    primary: "images/tshirt-blue.jpg",
    gallery: ["images/tshirt-blue-back.jpg"]
  },
  image: "images/tshirt-blue.jpg"
};
```

---

## Invalid Product Examples

### Name Too Short
```javascript
{ name: "AB" } // ❌ Must be at least 3 characters
```

### Price Zero
```javascript
{ price: 0 } // ❌ Must be greater than 0
```

### Discount Price Invalid
```javascript
{
  discount: true,
  price: 100,
  discountedPrice: 150 // ❌ Must be less than 100
}
```

### Negative Stock
```javascript
{ stock: -5 } // ❌ Cannot be negative
```

### Empty Primary Image
```javascript
{
  images: {
    primary: "", // ❌ Cannot be empty
    gallery: []
  }
}
```

### Too Many Gallery Images
```javascript
{
  images: {
    primary: "img.jpg",
    gallery: ["1","2","3","4","5","6","7","8","9","10","11"] // ❌ Max 10
  }
}
```

---

## Migration from Old Validation

### Before
```javascript
import { validateProduct } from './productValidation';

const validation = validateProduct(product, existingProducts, true);
if (!validation.valid) {
  console.error(validation.errors);
}
```

### After
```javascript
import { validateProductYup } from './productSchema';

const result = await validateProductYup(product);
if (!result.valid) {
  console.error(result.errors);
}
```

---

## Tips

1. **Use Async Version:** `validateProductYup()` is recommended
2. **Collect All Errors:** Schema uses `abortEarly: false`
3. **Field-Level Errors:** Use `validateProductWithDetails()` for forms
4. **Quick Checks:** Use `isProductValid()` for boolean checks
5. **Type Safety:** Yup coerces types automatically

---

**Quick Tip:** All validation is centralized in `productSchema.js`. Update the schema once, and all validations update automatically! 🎯
