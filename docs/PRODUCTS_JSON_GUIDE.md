# Products.json - Comprehensive Guide

## Table of Contents
1. [Overview](#overview)
2. [File Structure](#file-structure)
3. [Parameter Reference](#parameter-reference)
4. [How the Store Uses products.json](#how-the-store-uses-productsjson)
5. [Data Flow Architecture](#data-flow-architecture)
6. [Examples and Best Practices](#examples-and-best-practices)
7. [Multilingual Support](#multilingual-support)

---

## Overview

The `products.json` file serves as the **central data source** for the entire Sakr Store application. It is a JSON array containing product objects that power all store functionalities including:

- Product listings on the homepage
- Category filtering
- Search functionality
- Price filtering and sorting
- Individual product detail pages
- Shopping cart operations
- Stock management
- WhatsApp order generation

**Location:** `/products.json` (root directory)  
**Format:** JSON Array of Product Objects  
**Current Products:** 23 products across 20+ categories

---

## File Structure

```json
[
  {
    "id": 1,
    "name": "Classic Black T-Shirt",
    "price": 25.00,
    "description": "A high-quality, 100% cotton t-shirt.",
    "image": "images/tshirt.jpg",
    "images": {
      "primary": "images/tshirt.jpg",
      "gallery": [
        "images/mockup.jpg",
        "images/mockup.jpg"
      ]
    },
    "category": "Apparel",
    "discount": true,
    "discountedPrice": 19.99,
    "stock": 25,
    "isNew": true
  }
  // ... more products
]
```

---

## Parameter Reference

### Core Parameters

#### `id` (Required)
- **Type:** Integer (Number)
- **Purpose:** Unique identifier for each product
- **Used In:** 
  - URL routing (`product.html?id=1`)
  - Cart operations (identifying items in localStorage)
  - Product lookups and filtering
  - Related product matching
- **Constraints:** Must be unique across all products
- **Example:** `"id": 1`

#### `name` (Required)
- **Type:** String
- **Purpose:** Display name of the product
- **Used In:**
  - Product cards on homepage
  - Product detail page title
  - Search functionality (searchable field)
  - Cart item display
  - WhatsApp order messages
  - Breadcrumb navigation
- **Supports:** Multilingual text (English, Arabic, mixed)
- **Auto-Detection:** The store automatically detects Arabic characters and applies RTL (right-to-left) text direction
- **Example:** 
  ```json
  "name": "Classic Black T-Shirt"
  "name": "حقيبة توت كبيرة من كانفاس القطنية الثقيلة"
  ```

#### `price` (Required)
- **Type:** Number (Float/Decimal)
- **Purpose:** Base price of the product in EGP (Egyptian Pounds)
- **Used In:**
  - Price display on product cards
  - Original price in discount scenarios
  - Sorting (price-asc, price-desc)
  - Price range filtering
  - Order total calculations (when no discount)
- **Format:** Always shown as `EGP X.XX` with 2 decimal places
- **Example:** `"price": 25.00`

#### `description` (Required)
- **Type:** String
- **Purpose:** Detailed product description
- **Used In:**
  - Product cards (truncated to 50 characters with "...")
  - Product detail page (full description)
  - Search functionality (searchable field)
- **Supports:** Multilingual text with auto-detection
- **Truncation:** Automatically truncated on listing pages using `truncateText()` function
- **Example:** `"description": "A high-quality, 100% cotton t-shirt."`

#### `category` (Required)
- **Type:** String
- **Purpose:** Product categorization for filtering
- **Used In:**
  - Category sidebar generation
  - Category filtering
  - Related products matching (same category)
  - Breadcrumb navigation
- **Special Categories:**
  - **"All"** - Shows all products (built-in filter)
  - **"Featured"** - Shows products where `isNew: true` (built-in filter)
  - **"Discounts"** - Shows products where `discount: true` (built-in filter)
- **Current Categories:** Apparel, Home Goods, Accessories, Electronics, Books, Music, Games, Movies, Toys, Garden, Tools, Grocery, Health, Beauty, Pets, Kids, Baby, Handmade, Sports, Outdoors
- **Example:** `"category": "Apparel"`

### Image Parameters

#### `image` (Legacy - Optional but Recommended)
- **Type:** String (file path)
- **Purpose:** Fallback image path for backwards compatibility
- **Used In:** Fallback when `images.primary` is not available
- **Recommendation:** Still include for backwards compatibility
- **Example:** `"image": "images/tshirt.jpg"`

#### `images` (Modern - Required)
- **Type:** Object containing primary and gallery
- **Purpose:** Enhanced image management with multiple views
- **Structure:**
  ```json
  "images": {
    "primary": "images/tshirt.jpg",
    "gallery": [
      "images/mockup.jpg",
      "images/mockup.jpg"
    ]
  }
  ```

##### `images.primary` (Required)
- **Type:** String (file path)
- **Purpose:** Main product image
- **Used In:**
  - Product card thumbnails
  - Default image on product detail page
  - First image in lightbox gallery
  - Cart item thumbnails
- **Example:** `"primary": "images/tshirt.jpg"`

##### `images.gallery` (Optional)
- **Type:** Array of Strings (file paths)
- **Purpose:** Additional product images
- **Used In:**
  - Thumbnail gallery on product detail page
  - Lightbox image gallery navigation
- **Behavior:** 
  - If only 1 total image (primary), thumbnails are hidden
  - If multiple images, thumbnail buttons are generated
  - Users can click thumbnails to change main image
  - Clicking main image opens lightbox for zoomed viewing
- **Example:** 
  ```json
  "gallery": [
    "images/mockup.jpg",
    "images/mockup2.jpg",
    "images/mockup3.jpg"
  ]
  ```

### Discount Parameters

#### `discount` (Required)
- **Type:** Boolean
- **Purpose:** Flag indicating if product is on sale
- **Used In:**
  - Special "Discounts" category filter
  - Price display logic (shows strikethrough original price)
  - Cart calculations (uses discountedPrice instead of price)
  - WhatsApp order totals
- **Values:**
  - `true` - Product is on discount, use `discountedPrice`
  - `false` - Product at regular price, use `price`
- **Example:** `"discount": true`

#### `discountedPrice` (Required when discount=true)
- **Type:** Number (Float/Decimal)
- **Purpose:** Reduced price when product is on sale
- **Used In:**
  - Price display (shown prominently when discount=true)
  - Cart calculations
  - Order total calculations
  - Sorting operations
- **Display Pattern:** 
  - Original price shown with strikethrough: ~~EGP 25.00~~
  - Discounted price shown highlighted: **EGP 19.99**
- **Recommendation:** When `discount: false`, set `discountedPrice` equal to `price`
- **Example:** `"discountedPrice": 19.99`

### Inventory Parameters

#### `stock` (Required)
- **Type:** Integer (Number)
- **Purpose:** Available inventory quantity
- **Used In:**
  - Stock status badges
  - Add to cart validation
  - Quantity selector limits
  - Cart quantity validation
  - Out of stock button states
- **Stock Status Display Logic:**
  - `stock > 10` → "In Stock" (green badge)
  - `1 <= stock <= 10` → "Only X left in stock!" (orange warning badge)
  - `stock === 0` → "Sold Out" / "Out of Stock" (red badge)
- **Cart Behavior:**
  - System tracks quantity already in cart
  - Prevents adding more than available stock
  - Shows warning: "Only X available in stock"
  - Disables "Add to Cart" when cart qty = stock
- **Example:** `"stock": 25`

### Feature Flags

#### `isNew` (Required)
- **Type:** Boolean
- **Purpose:** Marks product as new/featured
- **Used In:**
  - "New" badge display on product cards
  - "Featured" category filter (shows only new products)
  - Product detail page badge
- **Visual Indicator:** Yellow "New" badge in top-right corner of product image
- **Values:**
  - `true` - Shows "New" badge, appears in "Featured" filter
  - `false` - No badge shown
- **Example:** `"isNew": true`

---

## How the Store Uses products.json

### 1. Data Loading and Caching

**Location:** `js/app.js` - `fetchProducts()` function

```javascript
async function fetchProducts() {
  if (products.length > 0) {
    return products; // Return from cache
  }
  try {
    const res = await fetch('products.json');
    if (!res.ok) throw new Error('Network response was not ok');
    products = await res.json();
    return products;
  } catch (err) {
    console.error('Failed to load products', err);
    return [];
  }
}
```

**Behavior:**
- Products are fetched once via `fetch('products.json')`
- Stored in global `products` array for caching
- Subsequent calls return cached data (performance optimization)
- Error handling returns empty array on failure

**Pages That Load products.json:**
- `index.html` (homepage)
- `product.html` (product details)
- `cart.html` (cart page)

---

### 2. Homepage Product Listing

**Location:** `index.html` + `js/app.js` - `renderProducts()` function

**Features Powered by products.json:**

#### A. Product Grid Rendering
Each product is rendered as a card with:
- Product image (from `images.primary` or fallback to `image`)
- Product name with auto-language detection
- Truncated description (50 chars max)
- Price display (regular or discount pricing)
- "New" badge (if `isNew: true`)
- "Add to Cart" button with stock validation

#### B. Search Functionality
```javascript
// Search filters by name AND description
const lowerCaseSearchTerm = searchTerm.toLowerCase().trim();
filteredProducts = products.filter(p =>
  (p.name && p.name.toLowerCase().includes(lowerCaseSearchTerm)) ||
  (p.description && p.description.toLowerCase().includes(lowerCaseSearchTerm))
);
```

**Behavior:**
- Live search with 250ms debounce
- Case-insensitive matching
- Searches both `name` and `description` fields
- Updates results in real-time as user types

#### C. Category Filtering
```javascript
// Dynamic category generation from products
const categories = ['Featured', 'Discounts', 'All'];
const categorySet = new Set();
products.forEach(p => {
  if (p.category) categorySet.add(p.category);
});
categories.push(...Array.from(categorySet));
```

**Special Filters:**
- **Featured** - Shows products where `isNew === true`
- **Discounts** - Shows products where `discount === true`
- **All** - Shows all products
- **Category Names** - Shows products matching exact category

**Sidebar Behavior:**
- Categories dynamically generated from all product categories
- Active category highlighted
- Clicking category updates product grid
- Mobile: Hamburger menu with overlay

#### D. Price Range Filtering
```javascript
// Dynamic price range based on selected category
const maxPrice = Math.ceil(Math.max(0, ...relevantProducts.map(p => Number(p.price) || 0)));
```

**Behavior:**
- Slider max value updates based on selected category
- Filters products where `price <= selectedMaxPrice`
- Slider shows "Up to: EGP X"
- Synced between desktop slider and mobile input

#### E. Sorting
Three sort modes:
1. **Default** - Original order from JSON file
2. **Price: Low to High** - Sorts by `price` ascending
3. **Price: High to Low** - Sorts by `price` descending

**Desktop:** Radio button UI  
**Mobile:** Dropdown select or filter sheet

---

### 3. Product Detail Page

**Location:** `product.html` + inline JavaScript

**URL Pattern:** `product.html?id=<productId>`

**Data Retrieved:**
```javascript
const urlParams = new URLSearchParams(window.location.search);
const productId = parseInt(urlParams.get('id'));
const product = products.find(p => p.id === productId);
```

**Displayed Information:**

#### A. Product Images
- **Primary Image:** Large display from `images.primary`
- **Thumbnail Gallery:** Generated from `images.primary` + `images.gallery`
- **Lightbox:** Click main image to open full-screen gallery
- **Navigation:** Prev/Next buttons, keyboard arrows (←→), ESC to close

#### B. Product Details
- **Title:** `name` with language auto-detection
- **New Badge:** Shown if `isNew === true`
- **Stock Status:** Color-coded badge based on `stock` value
- **Price:** Shows `price` or discount pricing
- **Description:** Full text from `description` field

#### C. Breadcrumb Navigation
```
Home > [category] > [product name]
```

#### D. Stock-Aware Quantity Selector
```javascript
const remainingStock = maxAvailableStock - cartQty;
// Disable increase button if quantity >= remaining stock
increaseBtn.disabled = currentValue >= remainingStock;
```

**Features:**
- Minus button (minimum: 1)
- Plus button (maximum: available stock)
- Number input with validation
- Accounts for quantity already in cart
- Real-time updates as cart changes

#### E. Related Products Section
```javascript
const relatedProducts = products.filter(p => 
  p.category === product.category && p.id !== productId
).slice(0, 4);
```

**Behavior:**
- Shows up to 4 products from same category
- Excludes current product
- Each card links to respective product page
- Hidden if no related products found

---

### 4. Shopping Cart

**Location:** `cart.html` + `js/app.js`

**Cart Storage:** `localStorage` as Map<productId, quantity>

#### A. Cart Item Display
For each item in cart:
- Fetches full product details from `products.json` by `id`
- Displays product image from `images.primary`
- Shows product name with RTL support
- Calculates price: uses `discountedPrice` if `discount === true`, else `price`

#### B. Stock Validation
```javascript
if (qty > product.stock) {
  stockWarning = `⚠️ Only ${product.stock} available`;
} else if (product.stock <= 5 && product.stock > 0) {
  stockWarning = `⚠️ Only ${product.stock} left in stock`;
} else if (product.stock === 0) {
  stockWarning = `⛔ Out of stock`;
}
```

**Real-time Warnings:**
- Red: Out of stock
- Orange: Low stock (≤5)
- Error: Quantity exceeds available stock

#### C. Quantity Controls
- **Decrease (-):** Disabled if qty = 1
- **Increase (+):** Disabled if qty = stock
- **Remove Button:** Removes item entirely from cart

#### D. Order Summary
```javascript
let total = 0;
for (const [id, qty] of cart.entries()) {
  const unitPrice = product.discount ? product.discountedPrice : product.price;
  total += unitPrice * qty;
}
```

**Calculation:**
- Subtotal: Sum of (quantity × effective price) for all items
- Effective Price: `discountedPrice` if discount, else `price`
- Shipping: "Confirmed via WhatsApp" (not calculated)
- Total: Same as subtotal

---

### 5. WhatsApp Order Integration

**Location:** `js/app.js` - `initCheckoutForm()` function

**Message Generation:**
```javascript
const lines = [];
for (const [id, qty] of cart.entries()) {
  const product = productMap.get(id);
  const price = product.discount ? product.discountedPrice : product.price;
  total += price * qty;
  lines.push(`- ${qty}x ${product.name} - EGP ${(price * qty).toFixed(2)}`);
}

const message = [
  "Hello! I'd like to place an order.",
  '',
  '*My Details:*',
  `Name: ${name}`,
  `Address: ${address}`,
  `Phone: ${phone}`,
  '',
  '*Order Summary:*',
  ...lines,
  '---------------------',
  `*Total: EGP ${total.toFixed(2)}*`,
  '',
  'Thank you!'
].join('\n');
```

**Example WhatsApp Message:**
```
Hello! I'd like to place an order.

*My Details:*
Name: Ahmed Mohamed
Address: 123 Cairo Street
Phone: +201234567890

*Order Summary:*
- 2x Classic Black T-Shirt - EGP 39.98
- 1x Modern Coffee Mug - EGP 15.50
---------------------
*Total: EGP 55.48*

Thank you!
```

**WhatsApp Number:** Configured in `config.whatsappNumber` (currently: `201024496178`)

**Cart Persistence:** Cart is NOT cleared after WhatsApp redirect (UX improvement - user might not send the message)

---

### 6. Notification System

**Location:** `js/app.js` - `showToast()` function

When adding to cart, the notification displays:
- Product image from `images.primary`
- Product `name`
- Effective price (`discountedPrice` if discount, else `price`)
- "View Cart" button
- Auto-dismiss after 5 seconds

---

## Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      products.json                          │
│  [Array of Product Objects with all parameters]            │
└────────────────────────────┬────────────────────────────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │  fetchProducts()│
                    │   (app.js)      │
                    └────────┬────────┘
                             │
                    ┌────────▼─────────┐
                    │  Global products │
                    │  array (cache)   │
                    └────────┬─────────┘
                             │
         ┌───────────────────┼───────────────────┐
         │                   │                   │
         ▼                   ▼                   ▼
┌──────────────────┐ ┌──────────────┐ ┌─────────────────┐
│   index.html     │ │product.html  │ │   cart.html     │
│                  │ │              │ │                 │
│ renderProducts() │ │ URL: ?id=X   │ │ renderCart()    │
│                  │ │              │ │                 │
│ • Search         │ │ Find product │ │ Map cart IDs to │
│ • Category filter│ │ by id        │ │ product objects │
│ • Price filter   │ │              │ │                 │
│ • Sort           │ │ Display:     │ │ Calculate:      │
│ • Add to cart    │ │ • Details    │ │ • Totals        │
│                  │ │ • Images     │ │ • Stock status  │
│                  │ │ • Related    │ │                 │
└──────────────────┘ └──────────────┘ └────────┬────────┘
                                               │
                                               ▼
                                    ┌────────────────────┐
                                    │ WhatsApp Checkout  │
                                    │                    │
                                    │ Generate message   │
                                    │ with product names │
                                    │ and prices         │
                                    └────────────────────┘
```

---

## Examples and Best Practices

### Example 1: Regular Product (No Discount, In Stock)

```json
{
  "id": 2,
  "name": "Modern Coffee Mug",
  "price": 15.50,
  "description": "A stylish ceramic mug with a matte finish.",
  "image": "images/mug.jpg",
  "images": {
    "primary": "images/mug.jpg",
    "gallery": [
      "images/mug-side.jpg",
      "images/mug-top.jpg"
    ]
  },
  "category": "Home Goods",
  "discount": false,
  "discountedPrice": 15.50,
  "stock": 5,
  "isNew": false
}
```

**Display:**
- Price: EGP 15.50 (regular, no strikethrough)
- Stock Status: "Only 5 left in stock!" (orange badge)
- No "New" badge
- No discount badge
- Appears in "Home Goods" category only

---

### Example 2: Featured Product (New, On Discount, High Stock)

```json
{
  "id": 1,
  "name": "Classic Black T-Shirt",
  "price": 25.00,
  "description": "A high-quality, 100% cotton t-shirt.",
  "image": "images/tshirt.jpg",
  "images": {
    "primary": "images/tshirt.jpg",
    "gallery": [
      "images/tshirt-back.jpg",
      "images/tshirt-detail.jpg"
    ]
  },
  "category": "Apparel",
  "discount": true,
  "discountedPrice": 19.99,
  "stock": 25,
  "isNew": true
}
```

**Display:**
- Price: ~~EGP 25.00~~ **EGP 19.99** (discount highlighted)
- Stock Status: "In Stock" (green badge)
- "New" badge shown
- Appears in "Featured", "Discounts", and "Apparel" categories
- Cart uses 19.99 for calculations

---

### Example 3: Out of Stock Product

```json
{
  "id": 10,
  "name": "Mockup Product 7",
  "price": 70.00,
  "description": "This is a description for Mockup Product 7.",
  "image": "images/mockup.jpg",
  "images": {
    "primary": "images/mockup.jpg",
    "gallery": []
  },
  "category": "Games",
  "discount": false,
  "discountedPrice": 70.00,
  "stock": 0,
  "isNew": false
}
```

**Display:**
- Price: EGP 70.00
- Stock Status: "Sold Out" (red badge)
- "Add to Cart" button disabled with text "Out of Stock"
- Quantity selector disabled
- Can still view product details

---

### Example 4: Arabic Product (RTL Support)

```json
{
  "id": 3,
  "name": "حقيبة توت كبيرة من كانفاس القطنية الثقيلة",
  "price": 19.99,
  "description": "حقيبة توت كبيرة متعددة الاستخدامات مصنوعة من قماش القطن الثقيل، مثالية للتسوق أو الاستخدام اليومي.",
  "image": "images/tote.jpg",
  "images": {
    "primary": "images/tote.jpg",
    "gallery": [
      "images/tote-detail.jpg"
    ]
  },
  "category": "Accessories",
  "discount": true,
  "discountedPrice": 14.99,
  "stock": 10,
  "isNew": true
}
```

**Auto-Detection:**
- Name automatically rendered RTL with `dir="rtl"` and `lang="ar"`
- Description automatically rendered RTL
- Proper Arabic font (Cairo/Tajawal) applied via CSS
- Price remains LTR: "EGP 14.99"

---

## Best Practices

### ✅ DO:

1. **Always provide unique IDs**
   ```json
   "id": 1  // Must be unique
   ```

2. **Set discountedPrice even when discount=false**
   ```json
   "discount": false,
   "discountedPrice": 25.00  // Same as price
   ```

3. **Use both legacy and modern image fields**
   ```json
   "image": "images/product.jpg",
   "images": {
     "primary": "images/product.jpg",
     "gallery": [...]
   }
   ```

4. **Provide accurate stock numbers**
   ```json
   "stock": 25  // Real-time inventory
   ```

5. **Use descriptive product names and descriptions**
   ```json
   "name": "Classic Black T-Shirt",
   "description": "A high-quality, 100% cotton t-shirt."
   ```

6. **Include at least 2-3 images in gallery for better UX**
   ```json
   "gallery": [
     "images/product-angle1.jpg",
     "images/product-angle2.jpg",
     "images/product-detail.jpg"
   ]
   ```

### ❌ DON'T:

1. **Don't use duplicate IDs**
   ```json
   // ❌ BAD
   {"id": 1, "name": "Product A"},
   {"id": 1, "name": "Product B"}  // Conflict!
   ```

2. **Don't omit required fields**
   ```json
   // ❌ BAD - Missing stock, isNew
   {
     "id": 1,
     "name": "Product",
     "price": 10.00
   }
   ```

3. **Don't set discount=true without discountedPrice**
   ```json
   // ❌ BAD
   "discount": true,
   "discountedPrice": 25.00  // Same as price - no actual discount!
   ```

4. **Don't use inconsistent category names**
   ```json
   // ❌ BAD
   "category": "Apparel"   // Product 1
   "category": "apparel"   // Product 2 - Case mismatch!
   "category": "Clothing"  // Product 3 - Different name!
   ```

5. **Don't leave gallery empty - use primary or remove the field**
   ```json
   // ❌ BAD
   "gallery": []
   
   // ✅ GOOD
   "gallery": ["images/product.jpg"]
   // OR just omit gallery if only one image
   ```

---

## Multilingual Support

### Automatic Language Detection

The store uses `hasArabic()` function to detect Arabic Unicode characters:

```javascript
function hasArabic(text) {
  const arabicRegex = /[\u0600-\u06FF\u0750-\u077F]/;
  return arabicRegex.test(text);
}
```

**Supported Unicode Ranges:**
- `\u0600-\u06FF` - Arabic
- `\u0750-\u077F` - Arabic Supplement

### Auto-Applied Attributes

When Arabic is detected in `name` or `description`:
```html
<h3 lang="ar" dir="rtl">حقيبة توت كبيرة</h3>
```

**Applied Automatically:**
- `lang="ar"` - Language attribute for screen readers
- `dir="rtl"` - Right-to-left text direction
- Cairo/Tajawal fonts via CSS

### Mixed Content Support

Products can have:
- English name + Arabic description
- Arabic name + English description
- Fully English content
- Fully Arabic content

Each field is independently detected and styled.

---

## Technical Notes

### Performance Optimization
- Products fetched once and cached in memory
- Subsequent calls use cached data (no additional network requests)

### Error Handling
- Failed fetch returns empty array `[]`
- Missing products redirect to `index.html`
- Invalid product IDs handled gracefully

### Browser Compatibility
- Uses modern `fetch()` API
- ES6+ JavaScript (arrow functions, template literals, Map, Set)
- LocalStorage for cart persistence
- Responsive design (mobile + desktop)

### Stock Management
- Stock tracked in `products.json` (static file)
- No real-time inventory sync
- Manual updates required
- Cart validates against `stock` value on each operation

### Search Performance
- Debounced search (250ms delay)
- Case-insensitive matching
- Searches name AND description
- Live results update

---

## Maintenance Guide

### Adding New Products

1. Open `products.json`
2. Find the highest existing `id` (currently 23)
3. Add new product object with `id: 24`
4. Fill all required fields
5. Save and test in browser

**Template:**
```json
{
  "id": 24,
  "name": "Your Product Name",
  "price": 0.00,
  "description": "Your product description here.",
  "image": "images/your-product.jpg",
  "images": {
    "primary": "images/your-product.jpg",
    "gallery": [
      "images/your-product-2.jpg"
    ]
  },
  "category": "YourCategory",
  "discount": false,
  "discountedPrice": 0.00,
  "stock": 0,
  "isNew": true
}
```

### Updating Stock

Simply change the `stock` value:
```json
"stock": 15  // Changed from 25
```

### Adding/Removing Discounts

**To Add Discount:**
```json
"discount": true,
"discountedPrice": 19.99  // Lower than price
```

**To Remove Discount:**
```json
"discount": false,
"discountedPrice": 25.00  // Same as price
```

### Changing Categories

1. Update `category` field in product objects
2. Category sidebar auto-updates on page load
3. No code changes needed

---

## Troubleshooting

### Problem: Product not showing

**Check:**
- Is `id` unique?
- Are all required fields present?
- Is the file valid JSON? (Use JSONLint.com)
- Are image paths correct?

### Problem: Search not finding product

**Check:**
- Is the search term in `name` OR `description`?
- Is search case-sensitive? (It shouldn't be)
- Try partial matches

### Problem: Stock warnings showing incorrectly

**Check:**
- Is `stock` a number (not string)?
- Is `stock` value accurate?
- Clear localStorage cart: `localStorage.removeItem('cart')`

### Problem: Arabic text not displaying RTL

**Check:**
- Does text contain Arabic Unicode characters?
- Are fonts loading? (Check browser console)
- Try clearing browser cache

---

## Version History

**Current Structure:** products.json (v2.0)  
**Features:**
- Multi-image support (primary + gallery)
- Stock management
- Discount system
- New/Featured flags
- Multilingual support

**Legacy Support:** Maintains backwards compatibility with `image` field

---

## Performance Optimizations & Image Handling

### Lazy Loading (Active)

**No Changes Required to products.json**

All images referenced in `products.json` are automatically optimized with lazy loading. The implementation:

- ✅ Reads existing image paths from `products.json`
- ✅ Automatically adds `loading="lazy"` attribute when rendering
- ✅ Works with both legacy `image` field and new `images.primary/gallery` structure
- ✅ No configuration needed - it just works!

**Example:** Your JSON stays exactly the same:
```json
{
  "id": 1,
  "name": "Product Name",
  "image": "images/product1.jpg",
  "images": {
    "primary": "images/product1.jpg",
    "gallery": ["images/product1-alt.jpg"]
  }
}
```

The system automatically converts this to lazy-loaded images when displaying on the website.

### WebP/AVIF Modern Image Formats (Optional)

**No Changes Required to products.json**

The store includes infrastructure for modern image formats (WebP/AVIF) that provides 50-70% smaller file sizes.

#### How It Works

1. **Keep your current image references** - Don't change anything in `products.json`
2. **Add converted images alongside originals** - Use the conversion scripts
3. **Browsers automatically choose the best format**

#### File Structure

Your `products.json` continues to reference the original image:
```json
{
  "image": "images/product1.jpg"
}
```

Your file system has all versions:
```
images/
  product1.jpg       ← Referenced in products.json (fallback)
  product1.webp      ← Automatically used by modern browsers
  product1.avif      ← Automatically used by newest browsers
```

#### The Magic

When the store renders this product, it generates:
```html
<picture>
  <source srcset="images/product1.avif" type="image/avif">
  <source srcset="images/product1.webp" type="image/webp">
  <img src="images/product1.jpg" alt="Product Name" loading="lazy">
</picture>
```

Browsers choose the best format they support:
- **Newest browsers** (Chrome 85+, Safari 16+): Use AVIF (smallest files)
- **Modern browsers** (all recent versions): Use WebP (small files)
- **Older browsers**: Use JPG/PNG (original)

#### Converting Images

Use the provided scripts to convert your images:

**PowerShell (Windows):**
```powershell
.\convert-images.ps1
```

**Node.js (All platforms):**
```bash
npm install
npm run convert
```

These scripts automatically:
- Find all JPG/PNG images in your `images/` folder
- Create `.webp` and `.avif` versions alongside them
- Preserve the original files
- **Don't require any changes to products.json**

#### Image Naming Convention

The system works by automatically detecting image variants:

```
Original in JSON:     images/product.jpg
Auto-detects:         images/product.webp
Auto-detects:         images/product.avif
```

As long as the base filename matches, the browser will find the optimized versions.

#### Best Practices

1. **Keep original references in products.json**
   ```json
   "image": "images/product1.jpg"  // ✅ Don't change this
   ```

2. **Don't reference WebP/AVIF directly**
   ```json
   "image": "images/product1.webp"  // ❌ Don't do this
   ```

3. **Maintain consistent naming**
   ```
   product1.jpg  →  product1.webp  →  product1.avif  // ✅ Same base name
   ```

4. **Both image structures work**
   ```json
   // Legacy - works fine
   "image": "images/product.jpg"
   
   // New structure - also works fine
   "images": {
     "primary": "images/product.jpg",
     "gallery": ["images/product-2.jpg", "images/product-3.jpg"]
   }
   ```

#### Migration Path

**Phase 1: Lazy Loading (Already Active)**
- No action needed
- Already working with existing images

**Phase 2: Modern Formats (Optional)**
1. Run conversion script on your images folder
2. Test in different browsers
3. Deploy - no JSON changes needed!

**Phase 3: Enable in Code (Optional)**
- Update 2 function calls in `js/app.js`
- From `generateSimpleImage()` to `generateResponsiveImage()`
- See `QUICK_START.md` for exact locations

### Summary: products.json Changes

| Feature | Changes to products.json | Action Required |
|---------|-------------------------|-----------------|
| Lazy Loading | ✅ None | None - already active |
| WebP/AVIF Support | ✅ None | Optional: Convert images |
| Both Systems | ✅ None | Keep using JPG/PNG references |

**Bottom Line:** Your `products.json` file requires **zero changes** for performance optimizations. The system is designed to work seamlessly with your existing data structure.

---

## Summary

The `products.json` file is the **heart of the Sakr Store**. Every parameter serves a specific purpose in the store's functionality:

| Parameter | Purpose | Impact |
|-----------|---------|--------|
| `id` | Unique identifier | Routing, cart, lookups |
| `name` | Product title | Display, search, orders |
| `price` | Base price | Display, sorting, calculations |
| `description` | Product details | Display, search |
| `category` | Classification | Filtering, related products |
| `image` | Legacy image | Fallback compatibility |
| `images.primary` | Main image | Primary display everywhere |
| `images.gallery` | Additional images | Detail page, lightbox |
| `discount` | Sale flag | Pricing logic, filters |
| `discountedPrice` | Sale price | Calculations when on sale |
| `stock` | Inventory | Availability, validation |
| `isNew` | Featured flag | Badges, Featured filter |

**Key Takeaway:** Maintain data integrity in this file - all store functionality depends on it being properly structured and up-to-date. Performance optimizations work transparently without requiring any changes to your product data.
