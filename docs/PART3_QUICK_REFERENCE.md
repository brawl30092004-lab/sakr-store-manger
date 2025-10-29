# Product Schema Part 3 - Quick Reference

## Validation Functions

### Discount Validation
```javascript
validateProductDiscount(discount)
```
- **Type:** Boolean
- **Values:** `true` or `false`
- **Returns:** `{valid: boolean, error: string|null}`

### Discounted Price Validation
```javascript
validateProductDiscountedPrice(discountedPrice, regularPrice, discount)
```
- **Type:** Number
- **Required:** When `discount = true`
- **Must be:** Less than `regularPrice` when `discount = true`
- **Decimals:** Max 2 decimal places
- **Min:** > 0
- **Returns:** `{valid: boolean, error: string|null}`

### Stock Validation
```javascript
validateProductStock(stock)
```
- **Type:** Integer
- **Min:** 0 (zero allowed)
- **Max:** 9999
- **Returns:** `{valid: boolean, error: string|null}`

---

## Helper Functions

### Get Stock Status
```javascript
getStockStatus(stock)
```
**Returns:** `{message: string, level: string, color: string}`

**Logic:**
- `stock === 0` → "Out of Stock" (danger/red)
- `stock > 0 && stock <= 10` → "Only X left" (warning/orange)
- `stock > 10` → "In Stock" (success/green)
- `stock < 0` → "Invalid stock" (error/gray)

---

## Complete Product Example

```javascript
const product = {
  name: 'Wireless Mouse',              // 3-200 chars
  price: 29.99,                         // 0.01-999999.99 EGP
  description: 'Ergonomic mouse...',    // 10-1000 chars
  category: 'Electronics',              // 2-50 chars
  discount: true,                       // Boolean
  discountedPrice: 19.99,               // < price when discount=true
  stock: 50                             // 0-9999
};

const result = validateProduct(product, existingProducts, true);

if (result.valid) {
  // ✅ Product is valid
} else {
  // ❌ Show errors
  console.log(result.errors);
}
```

---

## UI Components

### Discount Toggle
```jsx
<label>
  <input
    type="checkbox"
    checked={product.discount}
    onChange={(e) => handleDiscountChange(e.target.checked)}
  />
  Product is on discount
</label>

{product.discount && (
  <input
    type="number"
    value={product.discountedPrice}
    max={product.price}
    step="0.01"
    placeholder="Sale price"
  />
)}
```

### Price Display with Discount
```jsx
{product.discount ? (
  <div className="price">
    <span className="original-price strikethrough">
      {product.price.toFixed(2)} EGP
    </span>
    <span className="sale-price">
      {product.discountedPrice.toFixed(2)} EGP
    </span>
  </div>
) : (
  <span className="price">
    {product.price.toFixed(2)} EGP
  </span>
)}
```

### Stock Status Badge
```jsx
import { getStockStatus } from './services/productValidation';

function StockBadge({ stock }) {
  const status = getStockStatus(stock);
  
  return (
    <span className={`badge badge-${status.level}`}>
      {status.message}
    </span>
  );
}

// Usage
<StockBadge stock={product.stock} />
```

**CSS:**
```css
.badge.badge-success { 
  background: #d4edda; 
  color: #155724; 
}

.badge.badge-warning { 
  background: #fff3cd; 
  color: #856404; 
}

.badge.badge-danger { 
  background: #f8d7da; 
  color: #721c24; 
}
```

### Stock Input with Spinner
```jsx
<div className="stock-input">
  <button onClick={() => setStock(stock - 1)}>-</button>
  <input
    type="number"
    value={stock}
    onChange={(e) => setStock(parseInt(e.target.value))}
    min="0"
    max="9999"
  />
  <button onClick={() => setStock(stock + 1)}>+</button>
</div>
```

---

## Form Validation Example

```jsx
import { 
  validateProductDiscount,
  validateProductDiscountedPrice,
  validateProductStock 
} from './services/productValidation';

function ProductForm() {
  const [formData, setFormData] = useState({
    discount: false,
    discountedPrice: 0,
    stock: 0,
    price: 0
  });
  const [errors, setErrors] = useState({});
  
  const validateField = (field, value) => {
    let result;
    
    switch(field) {
      case 'discount':
        result = validateProductDiscount(value);
        break;
      case 'discountedPrice':
        result = validateProductDiscountedPrice(
          value, 
          formData.price, 
          formData.discount
        );
        break;
      case 'stock':
        result = validateProductStock(value);
        break;
    }
    
    setErrors(prev => ({
      ...prev,
      [field]: result.valid ? null : result.error
    }));
  };
  
  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    validateField(field, value);
  };
  
  return (
    <form>
      {/* Discount toggle */}
      <div>
        <label>
          <input
            type="checkbox"
            checked={formData.discount}
            onChange={(e) => handleChange('discount', e.target.checked)}
          />
          On Discount
        </label>
        {errors.discount && <span className="error">{errors.discount}</span>}
      </div>
      
      {/* Discounted price (conditional) */}
      {formData.discount && (
        <div>
          <label>Sale Price</label>
          <input
            type="number"
            value={formData.discountedPrice}
            onChange={(e) => handleChange('discountedPrice', parseFloat(e.target.value))}
            step="0.01"
            max={formData.price}
          />
          {errors.discountedPrice && (
            <span className="error">{errors.discountedPrice}</span>
          )}
        </div>
      )}
      
      {/* Stock input */}
      <div>
        <label>Stock</label>
        <input
          type="number"
          value={formData.stock}
          onChange={(e) => handleChange('stock', parseInt(e.target.value))}
          min="0"
          max="9999"
        />
        {errors.stock && <span className="error">{errors.stock}</span>}
      </div>
    </form>
  );
}
```

---

## Common Validation Errors

### Discount Errors
- ❌ "Discount must be a boolean (true or false)"

### Discounted Price Errors
- ❌ "Discounted price must be a valid number"
- ❌ "Discounted price must be greater than 0"
- ❌ "Discounted price must have exactly 2 decimal places"
- ❌ "Discounted price must be less than regular price"

### Stock Errors
- ❌ "Stock must be a valid number"
- ❌ "Stock must be an integer"
- ❌ "Stock cannot be negative"
- ❌ "Stock cannot exceed 9999"

---

## Testing

```bash
# Run validation tests
node src/tests/productValidation.test.js
```

**Test Coverage:**
- ✅ 4 discount tests
- ✅ 9 discounted price tests
- ✅ 7 stock tests
- ✅ 7 stock status tests
- ✅ Complete product validation with all fields

---

## Import Paths

```javascript
// Named imports
import {
  validateProductDiscount,
  validateProductDiscountedPrice,
  validateProductStock,
  getStockStatus
} from './services/productValidation.js';

// Default import
import validation from './services/productValidation.js';
validation.validateProductDiscount(true);
```

---

## Tips

1. **Discount Field:**
   - Use toggle switch for better UX
   - Show/hide discountedPrice field based on toggle state
   - Auto-set discountedPrice = price when discount = false

2. **Discounted Price Field:**
   - Add percentage calculator: `discountedPrice = price * (1 - percentage/100)`
   - Show savings amount: `price - discountedPrice`
   - Validate on blur and change events
   - Ensure max value = price (prevent higher sale price)

3. **Stock Field:**
   - Use number input with spinner (+/- buttons)
   - Show stock status badge inline
   - Warn when stock <= 10
   - Disable "Add to Cart" when stock === 0

4. **Stock Status:**
   - Cache `getStockStatus()` result with `useMemo`
   - Use consistent colors across the app
   - Show status on product cards and detail pages
   - Update in real-time when stock changes

5. **Performance:**
   - Debounce validation on user input
   - Use `useMemo` for status calculations
   - Validate entire product on form submit

6. **User Experience:**
   - Show inline validation errors
   - Use color-coded borders (red for invalid)
   - Display helpful messages
   - Prevent form submission if invalid
