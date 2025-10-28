# Product Schema - Part 3: Discount & Stock

## Implementation Complete ✅

This document outlines the implementation of Part 3 of the Product Schema, focusing on pricing logic and inventory management fields: `discount`, `discountedPrice`, and `stock`.

---

## 📋 Overview

**Part 3** extends the product validation system with:
1. **Discount field** - Boolean flag indicating if a product is on sale
2. **Discounted Price field** - Sale price (conditional based on discount flag)
3. **Stock field** - Inventory quantity tracking
4. **Stock Status Helper** - UI display logic for stock levels

---

## 🔧 Implementation Details

### 1. Discount Field (Boolean, Required)

**Location:** `src/services/productValidation.js`

#### Validation Function: `validateProductDiscount(discount)`

**Purpose:** Flag to indicate if a product is on sale

**Constraints:**
- **Type:** Boolean (required)
- **Values:** Must be `true` or `false`

**Behavior:**
- When `discount = true`, the `discountedPrice` field becomes visible and required
- When `discount = false`, `discountedPrice` should equal `price`

**Returns:** `{valid: boolean, error: string|null}`

**Example:**
```javascript
const result = validateProductDiscount(true);
// result = { valid: true, error: null }

const invalid = validateProductDiscount('yes');
// invalid = { valid: false, error: 'Discount must be a boolean (true or false)' }
```

#### UI Suggestion:
- Toggle switch or checkbox labeled "Product is on discount"
- When toggled ON, show discountedPrice input field
- When toggled OFF, hide or disable discountedPrice input

---

### 2. Discounted Price Field (Number, Conditional)

**Location:** `src/services/productValidation.js`

#### Validation Function: `validateProductDiscountedPrice(discountedPrice, regularPrice, discount)`

**Purpose:** The sale price when product is discounted

**Constraints:**
- **Type:** Number
- **Required:** Only when `discount = true`
- **Must be positive** (> 0)
- **Decimal places:** Maximum 2 decimal places
- **Crucial validation:** Must be **less than** `price` when `discount = true`

**Default Behavior:**
- If `discount = false`, this field should be set equal to `price` upon saving

**Returns:** `{valid: boolean, error: string|null}`

**Example:**
```javascript
// Valid: Discounted price less than regular price
const result = validateProductDiscountedPrice(19.99, 25.99, true);
// result = { valid: true, error: null }

// Invalid: Discounted price >= regular price when discount is true
const invalid = validateProductDiscountedPrice(30.00, 25.99, true);
// invalid = { valid: false, error: 'Discounted price must be less than regular price' }

// Valid: When discount is false, no comparison needed
const noDiscount = validateProductDiscountedPrice(25.99, 25.99, false);
// noDiscount = { valid: true, error: null }
```

#### Schema Definition:
```javascript
discountedPrice: {
  type: 'number',
  required: 'conditional', // Required when discount = true
  constraints: {
    positive: true,
    decimalPlaces: 2,
    lessThan: 'price' // Must be less than regular price when discount is true
  },
  currency: 'EGP',
  default: 'price', // Defaults to regular price when discount is false
  description: 'Sale price when product is discounted'
}
```

#### UI Suggestion:
- Number input (only shown/enabled when discount toggle is active)
- Add percentage calculator for usability:
  ```
  Discount Percentage: [___] %  [Apply]
  Discounted Price: [___] EGP
  You Save: XX.XX EGP (XX%)
  ```

---

### 3. Stock Field (Integer, Required)

**Location:** `src/services/productValidation.js`

#### Validation Function: `validateProductStock(stock)`

**Purpose:** Available inventory quantity

**Constraints:**
- **Type:** Integer (required)
- **Non-negative:** >= 0 (zero is allowed for out-of-stock items)
- **Maximum:** 9999

**Returns:** `{valid: boolean, error: string|null}`

**Example:**
```javascript
const result = validateProductStock(100);
// result = { valid: true, error: null }

const zero = validateProductStock(0);
// zero = { valid: true, error: null } // Zero is allowed

const negative = validateProductStock(-5);
// negative = { valid: false, error: 'Stock cannot be negative' }

const decimal = validateProductStock(10.5);
// decimal = { valid: false, error: 'Stock must be an integer' }
```

#### Schema Definition:
```javascript
stock: {
  type: 'integer',
  required: true,
  constraints: {
    nonNegative: true,
    min: 0,
    max: 9999
  },
  description: 'Available inventory quantity'
}
```

#### UI Suggestion:
- Number input with spinner (+/- buttons)
- Display validation errors inline
- Show current stock status badge (see Stock Status Logic below)

---

### 4. Stock Status Helper Function

**Location:** `src/services/productValidation.js`

#### Function: `getStockStatus(stock)`

**Purpose:** Determine stock status for UI display

**How it works:**
- If `stock > 10`: return "In Stock" (success/green)
- If `stock > 0 && stock <= 10`: return `"Only ${stock} left"` (warning/orange)
- If `stock === 0`: return "Out of Stock" (danger/red)
- If `stock < 0` or invalid: return "Invalid stock" (error/gray)

**Returns:** `{message: string, level: string, color: string}`

**Example:**
```javascript
getStockStatus(100);
// { message: 'In Stock', level: 'success', color: 'green' }

getStockStatus(5);
// { message: 'Only 5 left', level: 'warning', color: 'orange' }

getStockStatus(0);
// { message: 'Out of Stock', level: 'danger', color: 'red' }

getStockStatus(-1);
// { message: 'Invalid stock', level: 'error', color: 'gray' }
```

#### UI Integration:

**Product Card Example:**
```jsx
import { getStockStatus } from './services/productValidation';

function ProductCard({ product }) {
  const stockStatus = getStockStatus(product.stock);
  
  return (
    <div className="product-card">
      <h3>{product.name}</h3>
      <p className="price">
        {product.discount ? (
          <>
            <span className="original-price">{product.price} EGP</span>
            <span className="discounted-price">{product.discountedPrice} EGP</span>
          </>
        ) : (
          <span>{product.price} EGP</span>
        )}
      </p>
      <span className={`stock-badge ${stockStatus.level}`}>
        {stockStatus.message}
      </span>
    </div>
  );
}
```

**CSS Example:**
```css
.stock-badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: bold;
}

.stock-badge.success {
  background-color: #d4edda;
  color: #155724;
}

.stock-badge.warning {
  background-color: #fff3cd;
  color: #856404;
}

.stock-badge.danger {
  background-color: #f8d7da;
  color: #721c24;
}

.stock-badge.error {
  background-color: #e2e3e5;
  color: #383d41;
}
```

---

## 🧪 Testing

### Test Coverage

**Location:** `src/tests/productValidation.test.js`

#### Discount Validation Tests (4 cases):
- ✅ Valid discount (true)
- ✅ Valid discount (false)
- ✅ Invalid discount (string) - FAIL as expected
- ✅ Invalid discount (number) - FAIL as expected

#### Discounted Price Validation Tests (9 cases):
- ✅ Valid discounted price (< regular price, discount=true)
- ✅ Valid discounted price (discount=false)
- ✅ Invalid: discounted price >= regular price (discount=true) - FAIL as expected
- ✅ Invalid: discounted price > regular price - FAIL as expected
- ✅ Invalid: negative price - FAIL as expected
- ✅ Invalid: zero price - FAIL as expected
- ✅ Invalid: 3 decimal places - FAIL as expected
- ✅ Valid: 2 decimal places
- ✅ Valid: 1 decimal place (auto-formatted to 2)

#### Stock Validation Tests (7 cases):
- ✅ Valid stock (100)
- ✅ Zero stock (allowed)
- ✅ Maximum stock (9999)
- ✅ Invalid: negative stock - FAIL as expected
- ✅ Invalid: exceeds maximum (10000) - FAIL as expected
- ✅ Invalid: decimal stock (10.5) - FAIL as expected
- ✅ Invalid: string stock - FAIL as expected

#### Stock Status Tests (7 cases):
- ✅ Out of stock (0) - danger/red
- ✅ Low stock (1) - warning/orange
- ✅ Low stock (5) - warning/orange
- ✅ Low stock (10) - warning/orange
- ✅ In stock (11) - success/green
- ✅ In stock (100) - success/green
- ✅ Invalid stock (-1) - error/gray

#### Complete Product Validation Tests:
- ✅ Valid product with all fields (discount=false)
- ✅ Valid product with discount (discount=true, discountedPrice < price)
- ✅ Missing discount flag - FAIL as expected
- ✅ Missing stock - FAIL as expected
- ✅ Invalid discounted price (> regular price) - FAIL as expected
- ✅ Multiple validation errors across all fields

### Running Tests

```bash
node src/tests/productValidation.test.js
```

**Result:** All tests passing ✅ (100+ test cases total)

---

## 📦 Updated Product Schema

The complete product schema now includes 8 fields:

```javascript
export const productValidationSchema = {
  id: {
    type: 'integer',
    required: true,
    constraints: { positive: true, unique: true, immutable: true }
  },
  
  name: {
    type: 'string',
    required: true,
    constraints: { minLength: 3, maxLength: 200 }
  },
  
  price: {
    type: 'number',
    required: true,
    constraints: { min: 0.01, max: 999999.99, decimalPlaces: 2 },
    currency: 'EGP'
  },
  
  description: {
    type: 'string',
    required: true,
    constraints: { minLength: 10, maxLength: 1000, multiline: true }
  },
  
  category: {
    type: 'string',
    required: true,
    constraints: { minLength: 2, maxLength: 50, caseSensitive: true }
  },
  
  discount: {
    type: 'boolean',
    required: true,
    description: 'Flag to indicate if product is on sale'
  },
  
  discountedPrice: {
    type: 'number',
    required: 'conditional', // Required when discount = true
    constraints: { positive: true, decimalPlaces: 2, lessThan: 'price' },
    currency: 'EGP',
    default: 'price'
  },
  
  stock: {
    type: 'integer',
    required: true,
    constraints: { min: 0, max: 9999 }
  }
};
```

---

## 📂 Modified Files

1. **src/services/productValidation.js**
   - Added `validateProductDiscount()`
   - Added `validateProductDiscountedPrice()`
   - Added `validateProductStock()`
   - Added `getStockStatus()`
   - Updated `validateProduct()` to include new fields
   - Extended `productValidationSchema`

2. **src/tests/productValidation.test.js**
   - Added 27 new test cases for discount, discountedPrice, and stock
   - Updated complete product validation tests

---

## 🎯 Key Features Delivered

### ✅ Discount Field
- [x] Boolean validation (true/false only)
- [x] Integrated into product validation
- [x] UI behavior defined (toggle switch)
- [x] Conditional logic for discountedPrice

### ✅ Discounted Price Field
- [x] Positive number validation
- [x] Maximum 2 decimal places
- [x] Must be less than regular price when discount=true
- [x] Conditional requirement logic
- [x] Default value behavior (equals price when discount=false)

### ✅ Stock Field
- [x] Integer validation
- [x] Non-negative (0 allowed)
- [x] Maximum 9999
- [x] Comprehensive error messages

### ✅ Stock Status System
- [x] Three-tier status system (In Stock, Low Stock, Out of Stock)
- [x] Color-coded UI indicators (green, orange, red)
- [x] Dynamic messages
- [x] Invalid stock handling

---

## 🚀 Usage Examples

### Validate Discount
```javascript
import { validateProductDiscount } from './services/productValidation';

const result = validateProductDiscount(formData.discount);
if (!result.valid) {
  setErrors({ discount: result.error });
}
```

### Validate Discounted Price
```javascript
import { validateProductDiscountedPrice } from './services/productValidation';

const result = validateProductDiscountedPrice(
  formData.discountedPrice,
  formData.price,
  formData.discount
);
if (!result.valid) {
  setErrors({ discountedPrice: result.error });
}
```

### Validate Stock
```javascript
import { validateProductStock } from './services/productValidation';

const result = validateProductStock(formData.stock);
if (!result.valid) {
  setErrors({ stock: result.error });
}
```

### Get Stock Status for UI
```javascript
import { getStockStatus } from './services/productValidation';

const stockStatus = getStockStatus(product.stock);

return (
  <span className={`badge badge-${stockStatus.level}`}>
    {stockStatus.message}
  </span>
);
```

### Display Prices with Discount
```jsx
function ProductPrice({ product }) {
  if (product.discount) {
    return (
      <div className="price">
        <span className="original-price strikethrough">
          {product.price.toFixed(2)} EGP
        </span>
        <span className="discounted-price">
          {product.discountedPrice.toFixed(2)} EGP
        </span>
        <span className="savings">
          Save {(product.price - product.discountedPrice).toFixed(2)} EGP
        </span>
      </div>
    );
  }
  
  return (
    <span className="price">{product.price.toFixed(2)} EGP</span>
  );
}
```

---

## 💡 UI Implementation Notes

### Discount Toggle Behavior
```jsx
function ProductForm() {
  const [discount, setDiscount] = useState(false);
  const [price, setPrice] = useState(0);
  const [discountedPrice, setDiscountedPrice] = useState(0);
  
  const handleDiscountToggle = (checked) => {
    setDiscount(checked);
    if (!checked) {
      // When discount is turned off, set discountedPrice equal to price
      setDiscountedPrice(price);
    }
  };
  
  return (
    <form>
      <label>
        <input
          type="checkbox"
          checked={discount}
          onChange={(e) => handleDiscountToggle(e.target.checked)}
        />
        Product is on discount
      </label>
      
      {discount && (
        <div className="discount-section">
          <label>Discounted Price</label>
          <input
            type="number"
            value={discountedPrice}
            onChange={(e) => setDiscountedPrice(parseFloat(e.target.value))}
            step="0.01"
            max={price}
          />
        </div>
      )}
    </form>
  );
}
```

### Stock Status Badge Component
```jsx
import { getStockStatus } from './services/productValidation';

function StockBadge({ stock }) {
  const status = getStockStatus(stock);
  
  return (
    <span 
      className={`stock-badge stock-${status.level}`}
      style={{ 
        backgroundColor: status.color === 'green' ? '#d4edda' :
                        status.color === 'orange' ? '#fff3cd' :
                        status.color === 'red' ? '#f8d7da' : '#e2e3e5'
      }}
    >
      {status.message}
    </span>
  );
}
```

---

## ✅ Summary

**Status:** ✅ **COMPLETE**

**Part 3 Implementation:**
- ✅ Discount field (boolean validation)
- ✅ Discounted price field (conditional validation, < regular price)
- ✅ Stock field (integer, 0-9999)
- ✅ Stock status helper (3-tier system)
- ✅ Complete validation integration
- ✅ Comprehensive test coverage (27+ new tests)
- ✅ UI implementation guidance

The product validation system now supports **8 core fields** with full validation, helper functions, and UI integration patterns.

**Next Steps:**
- Update UI components to show discounted prices with strikethrough
- Update product list to use `getStockStatus()` for colored badges
- Implement discount percentage calculator in product form
- Add stock level warnings in admin dashboard
