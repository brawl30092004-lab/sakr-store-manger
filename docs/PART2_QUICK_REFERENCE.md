# Product Schema Part 2 - Quick Reference

## Validation Functions

### Description Validation
```javascript
validateProductDescription(description)
```
- **Min:** 10 chars (trimmed)
- **Max:** 1000 chars
- **Type:** String
- **Supports:** Multiline, English, Arabic, Mixed
- **Returns:** `{valid: boolean, error: string|null}`

### Category Validation
```javascript
validateProductCategory(category)
```
- **Min:** 2 chars (trimmed)
- **Max:** 50 chars
- **Type:** String
- **Case-sensitive:** Yes
- **Custom allowed:** Yes
- **Returns:** `{valid: boolean, error: string|null}`

---

## Helper Functions

### Truncate Text
```javascript
truncateText(text, maxLength = 50)
```
**Purpose:** Shorten text for product cards
**Example:**
```javascript
truncateText('Long description...', 30)
// Returns: "Long description that is t..."
```

### Get Categories
```javascript
getCategoriesFromProducts(products)
```
**Purpose:** Extract unique categories from products
**Returns:** Sorted array of category names
**Example:**
```javascript
getCategoriesFromProducts(products)
// Returns: ['Books', 'Electronics', 'Food']
```

---

## Complete Product Validation

```javascript
const product = {
  name: 'Product Name',           // 3-200 chars
  price: 29.99,                   // 0.01-999999.99 EGP
  description: 'Description...',  // 10-1000 chars
  category: 'Category Name'       // 2-50 chars
};

const result = validateProduct(product, existingProducts, true);

if (result.valid) {
  // ✅ Product is valid
} else {
  // ❌ Show errors
  console.log(result.errors);
  // { description: 'Description must be at least 10 characters long' }
}
```

---

## UI Integration

### Product Card (Truncated Description)
```jsx
import { truncateText } from './services/productValidation';

<div className="product-card">
  <h3>{product.name}</h3>
  <p>{truncateText(product.description, 100)}</p>
  <span className="category">{product.category}</span>
</div>
```

### Category Dropdown
```jsx
import { getCategoriesFromProducts } from './services/productValidation';

function CategorySelect({ products, value, onChange }) {
  const categories = getCategoriesFromProducts(products);
  
  return (
    <select value={value} onChange={onChange}>
      <option value="">Select category...</option>
      {categories.map(cat => (
        <option key={cat} value={cat}>{cat}</option>
      ))}
    </select>
  );
}
```

### Dynamic Sidebar (Auto Categories)
```jsx
import { useSelector } from 'react-redux';
import { getCategoriesFromProducts } from '../services/productValidation';

function Sidebar() {
  const { items: products } = useSelector(state => state.products);
  const categories = getCategoriesFromProducts(products);
  
  return (
    <ul>
      <li>All ({products.length})</li>
      {categories.map(cat => (
        <li key={cat}>
          {cat} ({products.filter(p => p.category === cat).length})
        </li>
      ))}
    </ul>
  );
}
```

---

## Form Validation Example

```jsx
import { useState } from 'react';
import { validateProductDescription, validateProductCategory } from './services/productValidation';

function ProductForm() {
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [errors, setErrors] = useState({});
  
  const handleDescriptionChange = (e) => {
    const value = e.target.value;
    setDescription(value);
    
    const result = validateProductDescription(value);
    setErrors(prev => ({
      ...prev,
      description: result.valid ? null : result.error
    }));
  };
  
  const handleCategoryChange = (e) => {
    const value = e.target.value;
    setCategory(value);
    
    const result = validateProductCategory(value);
    setErrors(prev => ({
      ...prev,
      category: result.valid ? null : result.error
    }));
  };
  
  return (
    <form>
      {/* Description Field */}
      <div>
        <label>Description</label>
        <textarea
          value={description}
          onChange={handleDescriptionChange}
          rows={4}
          maxLength={1000}
        />
        <div className="char-counter">
          {description.length}/1000
        </div>
        {errors.description && (
          <span className="error">{errors.description}</span>
        )}
      </div>
      
      {/* Category Field */}
      <div>
        <label>Category</label>
        <input
          type="text"
          value={category}
          onChange={handleCategoryChange}
          maxLength={50}
          list="category-suggestions"
        />
        <datalist id="category-suggestions">
          {/* Auto-populated from getCategoriesFromProducts() */}
        </datalist>
        {errors.category && (
          <span className="error">{errors.category}</span>
        )}
      </div>
    </form>
  );
}
```

---

## Common Validation Errors

### Description Errors
- ❌ "Description must be a string"
- ❌ "Description must be at least 10 characters long"
- ❌ "Description must not exceed 1000 characters"

### Category Errors
- ❌ "Category must be a string"
- ❌ "Category must be at least 2 characters long"
- ❌ "Category must not exceed 50 characters"

---

## Testing

```bash
# Run validation tests
node src/tests/productValidation.test.js

# Run examples
node src/services/productValidation.part2.examples.js
```

---

## Import Paths

```javascript
// Named imports
import {
  validateProductDescription,
  validateProductCategory,
  truncateText,
  getCategoriesFromProducts,
  validateProduct
} from './services/productValidation.js';

// Default import
import validation from './services/productValidation.js';
validation.validateProductDescription('...');
```

---

## Tips

1. **Description Field:**
   - Use `<textarea>` with 4-6 rows
   - Add character counter: `{text.length}/1000`
   - Support RTL for Arabic text
   - Validate on blur or change

2. **Category Field:**
   - Use combo box (input + datalist)
   - Load suggestions from `getCategoriesFromProducts()`
   - Allow custom entries
   - Trim whitespace before validation

3. **Performance:**
   - Use `useMemo` for `getCategoriesFromProducts()`
   - Debounce validation on user input
   - Cache validation results when possible

4. **User Experience:**
   - Show validation errors inline
   - Use red border for invalid fields
   - Display character count in real-time
   - Provide helpful error messages
