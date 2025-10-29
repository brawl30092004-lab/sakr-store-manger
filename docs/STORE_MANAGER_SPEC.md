# Sakr Store Manager - Application Specification

**Version:** 1.0  
**Last Updated:** October 28, 2025  
**Purpose:** Complete specification for an AI agent to build a GUI-based store management application

---

## 📋 Table of Contents

1. [Executive Summary](#executive-summary)
2. [Project Goals](#project-goals)
3. [Product Data Schema](#product-data-schema)
4. [Image Processing System](#image-processing-system)
5. [GitHub Integration](#github-integration)
6. [User Interface Requirements](#user-interface-requirements)
7. [Technical Architecture](#technical-architecture)
8. [Implementation Requirements](#implementation-requirements)
9. [Error Handling & Validation](#error-handling--validation)
10. [Testing Requirements](#testing-requirements)
11. [Deployment & Distribution](#deployment--distribution)

---

## 📖 Executive Summary

### Project Context

Sakr Store is an e-commerce platform that currently manages product data through a JSON file (`products.json`) located at the project root. The store features:

- **23 products** across 20+ categories
- **Multilingual support** (English and Arabic with RTL/LTR auto-detection)
- **Modern image formats** (WebP/AVIF with JPG/PNG fallback)
- **Shopping cart** with WhatsApp integration
- **Theme system** (light/dark mode)
- **Performance optimizations** (lazy loading, responsive images)

### Current Pain Points

1. **Manual Product Management**: Products are added/edited directly in JSON using text editors
2. **Complex Image Workflow**: Requires manual conversion to WebP/AVIF using command-line scripts
3. **Manual Deployment**: Changes must be manually committed and pushed to GitHub
4. **Technical Barrier**: Non-technical users cannot manage the store

### Solution Overview

Build a **desktop GUI application for Windows** that:

1. **Product Management**: Visual form-based product editing with all parameters
2. **Image Automation**: Automatic image upload, resizing, and format conversion
3. **GitHub Integration**: One-click publish to deploy changes to the live store
4. **Zero Coding Required**: Intuitive interface for non-technical store managers

**Platform**: Windows 10/11 (64-bit) - Initial release  
**Future Plans**: macOS and Linux support in later versions

---

## 🎯 Project Goals

### Primary Objectives

1. **Eliminate Technical Barriers**
   - Remove need for JSON editing
   - Remove need for command-line tools
   - Remove need for Git knowledge
   - Make store management accessible to anyone

2. **Streamline Workflows**
   - Add/edit products in under 2 minutes
   - Automatic image processing without user intervention
   - One-click deployment to GitHub
   - Real-time preview of changes

3. **Maintain Data Integrity**
   - Validate all inputs before saving
   - Prevent duplicate product IDs
   - Ensure required fields are filled
   - Preserve existing products.json format

4. **Ensure Compatibility**
   - Work on Windows 10/11 (64-bit)
   - Support existing products.json schema (backward compatible)
   - Support both legacy and modern image schemas
   - Handle Arabic/English text properly
   - Code should remain cross-platform compatible for future expansion

### Success Criteria

- Non-technical user can add a product in < 2 minutes
- Images automatically converted to 3 formats (JPG/PNG, WebP, AVIF)
- Changes published to GitHub in < 30 seconds
- Zero data loss or corruption
- Application works offline (except GitHub push)

---

## 📊 Product Data Schema

### Overview

Products are stored in `products.json` as a JSON array. Each product is an object with 11 core parameters.

**File Location**: `/products.json` (project root)  
**Format**: JSON Array of Objects  
**Encoding**: UTF-8 (to support Arabic characters)  
**Indentation**: 2 spaces (for readability)

### Complete Product Schema

```json
{
  "id": 1,
  "name": "Product Name",
  "price": 25.00,
  "description": "Product description text",
  "image": "images/product.jpg",
  "images": {
    "primary": "images/product.jpg",
    "gallery": [
      "images/product-2.jpg",
      "images/product-3.jpg"
    ]
  },
  "category": "Apparel",
  "discount": true,
  "discountedPrice": 19.99,
  "stock": 15,
  "isNew": true
}
```

### Field Specifications

#### 1. `id` (Integer, Required)

**Type**: Number (Integer, positive)  
**Purpose**: Unique identifier for each product  
**Constraints**:
- Must be a positive integer (1, 2, 3, ...)
- Must be unique across all products
- **Cannot be changed once created** (referenced in URLs)
- **Never reused** - even after product deletion
- Auto-generated on product creation

**ID Assignment Logic**:
```javascript
// Always use max(existingIds) + 1
// This ensures deleted product IDs are never reused
function generateNextId(products) {
  if (products.length === 0) return 1;
  
  const maxId = Math.max(...products.map(p => p.id));
  return maxId + 1;
}

// Example:
// Products: [id:1, id:2, id:3, id:5, id:8]
// Delete id:5
// Products: [id:1, id:2, id:3, id:8]
// Next new product will be id:9 (NOT id:4, 5, 6, or 7)
```

**Why IDs Are Never Reused**:
- URLs reference products by ID (`product.html?id=5`)
- Shopping carts may still reference deleted products
- Browser history/bookmarks may have old product links
- Prevents confusion from reusing IDs

**Validation Rules**:
```javascript
// Must be integer
Number.isInteger(id) === true

// Must be positive
id > 0

// Must be unique
!existingProducts.some(p => p.id === id)
```

**UI Behavior**:
- Auto-generated as `max(existingIds) + 1`
- Display as read-only field when editing
- Hidden when creating new product
- **Show warning** if user tries to manually set ID

**Used In**:
- Product detail page URLs (`product.html?id=1`)
- Cart storage (localStorage key)
- Related product filtering
- Image filenames (`product-{id}-primary.jpg`)

---

#### 2. `name` (String, Required)

**Type**: String  
**Purpose**: Display name of the product  
**Constraints**:
- Minimum length: 3 characters
- Maximum length: 200 characters
- Can contain English, Arabic, or mixed text
- Cannot be empty or only whitespace

**Language Support**:
- **English**: "Classic Black T-Shirt"
- **Arabic**: "حقيبة توت كبيرة من كانفاس القطنية الثقيلة"
- **Mixed**: "Nike قميص رياضي"

**Validation Rules**:
```javascript
// Required
name.trim().length >= 3

// Max length
name.length <= 200

// Not empty after trim
name.trim() !== ''
```

**Auto-Detection Behavior**:
The store automatically detects Arabic characters and applies RTL text direction:
```javascript
// Regex to detect Arabic
/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/.test(name)
```

**UI Requirements**:
- Text input field
- Character counter (e.g., "45/200")
- Live preview showing RTL/LTR rendering
- Placeholder: "Enter product name (English or Arabic)"

**Used In**:
- Product cards (homepage)
- Product detail page title
- Search functionality
- Cart display
- WhatsApp order messages
- Breadcrumb navigation

---

#### 3. `price` (Number, Required)

**Type**: Number (Float, two decimal places)  
**Purpose**: Regular price in EGP (Egyptian Pounds)  
**Constraints**:
- Must be a positive number
- Minimum: 0.01 EGP
- Maximum: 999999.99 EGP (practical limit)
- Must have exactly 2 decimal places

**Validation Rules**:
```javascript
// Must be number
typeof price === 'number'

// Must be positive
price > 0

// Max 2 decimal places
(price * 100) % 1 === 0
```

**Display Format**:
```javascript
`EGP ${price.toFixed(2)}`
// Examples:
// EGP 25.00
// EGP 199.99
```

**UI Requirements**:
- Number input with step="0.01"
- Currency symbol (EGP) shown
- Auto-format on blur to 2 decimal places
- Validation: must be > 0

**Used In**:
- Product cards (regular price display)
- Product detail page
- Price range filter (max value calculation)
- Sorting (high-to-low, low-to-high)
- Cart calculations (when no discount)
- WhatsApp order totals

---

#### 4. `description` (String, Required)

**Type**: String (multiline)  
**Purpose**: Detailed product description  
**Constraints**:
- Minimum length: 10 characters
- Maximum length: 1000 characters
- Can contain English, Arabic, or mixed text
- Supports line breaks
- Cannot be empty or only whitespace

**Validation Rules**:
```javascript
// Required
description.trim().length >= 10

// Max length
description.length <= 1000

// Not empty
description.trim() !== ''
```

**Display Behavior**:
- **Product Cards**: Truncated to 50 characters with "..." suffix
- **Product Detail Page**: Full text displayed
- **Search**: Full text searchable

**Truncation Function** (reference from app.js):
```javascript
function truncateText(text, maxLength = 50) {
  if (!text) return '';
  return text.length > maxLength 
    ? text.substring(0, maxLength) + '...' 
    : text;
}
```

**UI Requirements**:
- Multiline textarea (4-6 rows)
- Character counter (e.g., "250/1000")
- Live preview of truncated version
- Support for RTL/LTR auto-detection
- Placeholder: "Describe the product features, materials, uses, etc."

**Used In**:
- Product cards (truncated)
- Product detail page (full text)
- Search functionality
- WhatsApp messages (optional)

---

#### 5. `image` (String, Optional but Recommended)

**Type**: String (file path)  
**Purpose**: Legacy fallback image path  
**Constraints**:
- Must be a valid relative path
- Path format: `images/filename.ext`
- File must exist in project
- Supported formats: .jpg, .jpeg, .png

**Validation Rules**:
```javascript
// Valid path format
/^images\/[\w\-\.]+\.(jpg|jpeg|png)$/i.test(image)

// File exists (check on save)
fs.existsSync(path.join(projectRoot, image))
```

**Usage Pattern**:
This field is for **backward compatibility**. Modern products should use `images.primary` instead, but this field should still be populated.

**Auto-Population**:
```javascript
// When saving product:
product.image = product.images.primary;
```

**UI Behavior**:
- Hidden from user (auto-managed)
- Automatically synced with `images.primary`

**Used In**:
- Fallback when `images.primary` is missing
- Older store versions

---

#### 6. `images` (Object, Required)

**Type**: Object with two properties  
**Purpose**: Modern image management system  

**Structure**:
```json
{
  "primary": "images/product.jpg",
  "gallery": [
    "images/product-2.jpg",
    "images/product-3.jpg",
    "images/product-4.jpg"
  ]
}
```

##### 6.1 `images.primary` (String, Required)

**Type**: String (file path)  
**Purpose**: Main product image  
**Constraints**:
- Must be a valid relative path
- Path format: `images/filename.ext`
- File must exist
- Supported formats: .jpg, .jpeg, .png, .webp, .avif

**Validation Rules**:
```javascript
// Required
images.primary !== null && images.primary !== ''

// Valid format
/^images\/[\w\-\.]+\.(jpg|jpeg|png|webp|avif)$/i.test(images.primary)

// File exists
fs.existsSync(path.join(projectRoot, images.primary))
```

**UI Requirements**:
- Image upload button
- Preview thumbnail (200x200px)
- Replace/remove buttons
- Drag & drop support (optional)

**Used In**:
- Product cards (thumbnail)
- Product detail page (main image)
- Cart display
- Lightbox gallery
- Related products

##### 6.2 `images.gallery` (Array, Optional)

**Type**: Array of Strings (file paths)  
**Purpose**: Additional product images  
**Constraints**:
- Can be empty array `[]`
- Maximum 10 images (practical limit)
- Each path must be valid
- Paths relative to project root
- Supported formats: .jpg, .jpeg, .png, .webp, .avif

**Validation Rules**:
```javascript
// Must be array
Array.isArray(images.gallery)

// Max 10 images
images.gallery.length <= 10

// Each path valid
images.gallery.every(path => 
  /^images\/[\w\-\.]+\.(jpg|jpeg|png|webp|avif)$/i.test(path)
)

// Files exist
images.gallery.every(path => 
  fs.existsSync(path.join(projectRoot, path))
)
```

**UI Requirements**:
- Multiple image upload (drag & drop)
- Sortable thumbnail grid
- Remove individual images
- Reorder images (first = primary after main)

**Display Behavior**:
- If `gallery` is empty: thumbnails hidden on product page
- If `gallery` has 1+ images: thumbnail strip shown
- Click thumbnail: updates main image
- Click main image: opens lightbox gallery

**Used In**:
- Product detail page (thumbnail strip)
- Lightbox gallery navigation

---

#### 7. `category` (String, Required)

**Type**: String  
**Purpose**: Product categorization for filtering  
**Constraints**:
- Cannot be empty or only whitespace
- Minimum length: 2 characters
- Maximum length: 50 characters
- Case-sensitive (preserves user input)
- **Custom categories allowed** - users can create new categories

**Common Categories** (from existing products.json, not restrictive):
```javascript
// These are suggestions based on existing products
const COMMON_CATEGORIES = [
  'Apparel',
  'Home Goods',
  'Accessories',
  'Electronics',
  'Books',
  'Music',
  'Games',
  'Movies',
  'Toys',
  'Garden',
  'Tools',
  'Grocery',
  'Health',
  'Beauty',
  'Pets',
  'Kids',
  'Baby',
  'Handmade',
  'Sports',
  'Outdoors'
];
```

**Special Built-In Categories** (auto-generated, not stored):
- **"All"**: Shows all products
- **"Featured"**: Shows products where `isNew === true`
- **"Discounts"**: Shows products where `discount === true`

**Validation Rules**:
```javascript
// Required
category !== null && category.trim() !== ''

// Length validation
category.trim().length >= 2 && category.length <= 50

// No special validation needed - any string is valid
```

**Category Auto-Complete System**:
```javascript
// Extract all unique categories from existing products
function getExistingCategories(products) {
  const categories = new Set();
  products.forEach(p => {
    if (p.category) categories.add(p.category);
  });
  return Array.from(categories).sort();
}
```

**UI Requirements**:
- **Combo box** (dropdown + text input)
- Shows existing categories as suggestions
- Allows typing new category name
- Auto-complete while typing
- Alphabetically sorted suggestions
- "Create new category: X" option shown when typing new name

**UI Example**:
```
Category *
┌────────────────────────────────┐
│ Electronics            ▼       │  ← User can select or type
└────────────────────────────────┘

Suggestions:                        ← Shown while typing
• Apparel (5 products)
• Electronics (3 products)
• Home Goods (8 products)
• [Create new: "Smart Home"]        ← If user types new category
```

**Used In**:
- Category sidebar filtering
- Breadcrumb navigation
- Related products (same category)
- Product organization

---

#### 8. `discount` (Boolean, Required)

**Type**: Boolean  
**Purpose**: Flag indicating if product is on sale  
**Constraints**:
- Must be `true` or `false`
- Cannot be null

**Validation Rules**:
```javascript
// Must be boolean
typeof discount === 'boolean'
```

**Behavior**:
- If `true`: Use `discountedPrice` for calculations and display
- If `false`: Use `price` for calculations and display

**Price Display Logic**:
```javascript
if (discount === true) {
  // Show strikethrough original price
  // Show highlighted discounted price
  effectivePrice = discountedPrice;
} else {
  // Show regular price only
  effectivePrice = price;
}
```

**UI Requirements**:
- Toggle switch or checkbox
- Label: "Product is on discount"
- When enabled: show `discountedPrice` field
- When disabled: hide or disable `discountedPrice` field

**Used In**:
- "Discounts" category filter
- Price display (determines which price to show)
- Sorting operations
- Cart calculations
- WhatsApp order totals

---

#### 9. `discountedPrice` (Number, Required when discount=true)

**Type**: Number (Float, two decimal places)  
**Purpose**: Sale price when product is discounted  
**Constraints**:
- Must be a positive number
- Must be less than `price`
- Must have exactly 2 decimal places
- If `discount === false`, should equal `price`

**Validation Rules**:
```javascript
// Must be number
typeof discountedPrice === 'number'

// Must be positive
discountedPrice > 0

// Must be less than regular price (when discount=true)
if (discount === true) {
  discountedPrice < price
}

// Should equal price when no discount
if (discount === false) {
  discountedPrice === price
}

// Max 2 decimal places
(discountedPrice * 100) % 1 === 0
```

**Display Format**:
```javascript
// When discount=true:
<span class="original-price">EGP ${price.toFixed(2)}</span>
<span class="discounted-price">EGP ${discountedPrice.toFixed(2)}</span>

// CSS:
.original-price { text-decoration: line-through; }
.discounted-price { color: var(--accent); font-weight: bold; }
```

**Auto-Calculation**:
```javascript
// When user enters discount percentage:
const discountPercent = 20; // 20% off
discountedPrice = price * (1 - discountPercent / 100);
```

**UI Requirements**:
- Number input (shown only when `discount=true`)
- Option 1: Direct price input
- Option 2: Percentage discount calculator
  - User enters: "20%"
  - Auto-calculates: `price * 0.80`
- Validation: must be < `price`
- Display savings: "Save EGP X.XX (Y%)"

**Used In**:
- Price display (when discount=true)
- Cart calculations
- Order totals
- Sorting operations

---

#### 10. `stock` (Integer, Required)

**Type**: Number (Integer, non-negative)  
**Purpose**: Available inventory quantity  
**Constraints**:
- Must be a non-negative integer (0, 1, 2, ...)
- Maximum: 9999 (practical limit)

**Validation Rules**:
```javascript
// Must be integer
Number.isInteger(stock)

// Must be non-negative
stock >= 0

// Practical maximum
stock <= 9999
```

**Stock Status Display Logic** (from PRODUCTS_JSON_GUIDE.md):
```javascript
let status, badge, color;

if (stock > 10) {
  status = 'In Stock';
  badge = 'success';
  color = 'green';
} else if (stock > 0 && stock <= 10) {
  status = `Only ${stock} left`;
  badge = 'warning';
  color = 'orange';
} else if (stock === 0) {
  status = 'Out of Stock';
  badge = 'danger';
  color = 'red';
}
```

**Cart Behavior**:
- System tracks quantity already in cart
- Available for new orders = `stock - cartQuantity`
- "Add to Cart" disabled when `cartQuantity >= stock`

**UI Requirements**:
- Number input with spinner (+/-)
- Visual indicator:
  - Green: stock > 10
  - Orange: 1 ≤ stock ≤ 10
  - Red: stock = 0
- Quick actions:
  - "In Stock" (sets stock = 50)
  - "Low Stock" (sets stock = 5)
  - "Out of Stock" (sets stock = 0)

**Used In**:
- Stock status badges on product cards
- Product detail page status
- Cart validation
- "Add to Cart" button state

---

#### 11. `isNew` (Boolean, Required)

**Type**: Boolean  
**Purpose**: Marks product as new/featured  
**Constraints**:
- Must be `true` or `false`
- Cannot be null

**Validation Rules**:
```javascript
// Must be boolean
typeof isNew === 'boolean'
```

**Display Behavior**:
- If `true`: Yellow "New" badge displayed in top-right of product image
- If `false`: No badge shown

**UI Requirements**:
- Toggle switch or checkbox
- Label: "Mark as new/featured product"
- Visual preview of badge placement

**Used In**:
- "New" badge on product cards
- "Featured" category filter (shows products where `isNew=true`)
- Product detail page badge

---

### Complete Validation Summary

```javascript
function validateProduct(product) {
  const errors = [];

  // 1. ID
  if (!Number.isInteger(product.id) || product.id <= 0) {
    errors.push('ID must be a positive integer');
  }

  // 2. Name
  if (!product.name || product.name.trim().length < 3) {
    errors.push('Name must be at least 3 characters');
  }
  if (product.name && product.name.length > 200) {
    errors.push('Name must be less than 200 characters');
  }

  // 3. Price
  if (typeof product.price !== 'number' || product.price <= 0) {
    errors.push('Price must be a positive number');
  }
  if (product.price && (product.price * 100) % 1 !== 0) {
    errors.push('Price must have max 2 decimal places');
  }

  // 4. Description
  if (!product.description || product.description.trim().length < 10) {
    errors.push('Description must be at least 10 characters');
  }
  if (product.description && product.description.length > 1000) {
    errors.push('Description must be less than 1000 characters');
  }

  // 5. Image (legacy)
  if (product.image && !/^images\/[\w\-\.]+\.(jpg|jpeg|png)$/i.test(product.image)) {
    errors.push('Invalid image path format');
  }

  // 6. Images
  if (!product.images || !product.images.primary) {
    errors.push('Primary image is required');
  }
  if (product.images?.primary && 
      !/^images\/[\w\-\.]+\.(jpg|jpeg|png|webp|avif)$/i.test(product.images.primary)) {
    errors.push('Invalid primary image path format');
  }
  if (product.images?.gallery && !Array.isArray(product.images.gallery)) {
    errors.push('Gallery must be an array');
  }
  if (product.images?.gallery && product.images.gallery.length > 10) {
    errors.push('Gallery can have maximum 10 images');
  }

  // 7. Category
  if (!product.category || product.category.trim() === '') {
    errors.push('Category is required');
  }
  if (product.category && product.category.trim().length < 2) {
    errors.push('Category must be at least 2 characters');
  }
  if (product.category && product.category.length > 50) {
    errors.push('Category must be less than 50 characters');
  }

  // 8. Discount
  if (typeof product.discount !== 'boolean') {
    errors.push('Discount must be true or false');
  }

  // 9. Discounted Price
  if (typeof product.discountedPrice !== 'number' || product.discountedPrice <= 0) {
    errors.push('Discounted price must be a positive number');
  }
  if (product.discountedPrice && (product.discountedPrice * 100) % 1 !== 0) {
    errors.push('Discounted price must have max 2 decimal places');
  }
  if (product.discount && product.discountedPrice >= product.price) {
    errors.push('Discounted price must be less than regular price');
  }

  // 10. Stock
  if (!Number.isInteger(product.stock) || product.stock < 0) {
    errors.push('Stock must be a non-negative integer');
  }

  // 11. IsNew
  if (typeof product.isNew !== 'boolean') {
    errors.push('IsNew must be true or false');
  }

  return {
    valid: errors.length === 0,
    errors: errors
  };
}
```

---

### Default Values for New Products

```javascript
const DEFAULT_PRODUCT = {
  id: 0, // Auto-generated
  name: '',
  price: 0.00,
  description: '',
  image: '', // Auto-populated from images.primary
  images: {
    primary: '',
    gallery: []
  },
  category: 'Apparel', // First category in list
  discount: false,
  discountedPrice: 0.00, // Same as price initially
  stock: 0,
  isNew: true // New products marked as "New" by default
};
```

---

### File Format & Structure

**products.json Structure**:
```json
[
  { product1 },
  { product2 },
  { product3 }
]
```

**Formatting Requirements**:
- Encoding: UTF-8 (for Arabic support)
- Indentation: 2 spaces
- No trailing commas
- Sorted by ID (ascending)

**Save Operation**:
```javascript
function saveProducts(products) {
  // Sort by ID
  const sorted = products.sort((a, b) => a.id - b.id);
  
  // Format JSON
  const json = JSON.stringify(sorted, null, 2);
  
  // Save with UTF-8 encoding
  fs.writeFileSync('products.json', json, 'utf8');
}
```

---

## 🖼️ Image Processing System

### Overview

The image processing system is a critical component that automates the conversion of uploaded product images into multiple modern formats (WebP, AVIF) while maintaining the original JPG/PNG for fallback compatibility.

**Current Manual Process** (to be automated):
1. User manually places JPG/PNG images in `/images` folder
2. User runs PowerShell or Node.js conversion script
3. Script generates `.webp` and `.avif` versions
4. User manually updates `products.json` with image paths

**Target Automated Process**:
1. User uploads image(s) via GUI drag & drop or file picker
2. Application automatically:
   - Validates image format and size
   - Resizes images if needed (max dimensions)
   - Generates optimized JPG/PNG (if uploaded in different format)
   - Generates WebP version (80% quality)
   - Generates AVIF version (60% quality)
   - Saves all 3 versions to `/images` folder
   - Updates product object with correct paths
3. User sees instant preview of uploaded images

---

### Image Requirements

#### Supported Input Formats
- **Primary**: JPG, JPEG, PNG
- **Optional**: WebP, AVIF, GIF (converted to JPG)
- **Not Supported**: SVG, BMP, TIFF (show error)

#### File Size Limits
- **Maximum File Size**: 10 MB per image
- **Recommended**: Under 2 MB for optimal performance

#### Dimension Requirements
- **Minimum**: 400x400 pixels
- **Recommended**: 800x800 pixels (product detail page)
- **Maximum**: 4000x4000 pixels (auto-resize if larger)

#### Naming Convention

**Auto-Generated Filenames**:
```javascript
// Pattern: product-{id}-{index}.{ext}
// Examples:
product-23-primary.jpg
product-23-primary.webp
product-23-primary.avif
product-23-gallery-1.jpg
product-23-gallery-1.webp
product-23-gallery-1.avif
product-23-gallery-2.jpg
product-23-gallery-2.webp
product-23-gallery-2.avif
```

**Filename Generation Logic**:
```javascript
function generateImageFilename(productId, imageType, index = null, extension) {
  const baseName = `product-${productId}`;
  
  if (imageType === 'primary') {
    return `${baseName}-primary.${extension}`;
  } else if (imageType === 'gallery') {
    return `${baseName}-gallery-${index}.${extension}`;
  }
}

// Usage:
generateImageFilename(23, 'primary', null, 'jpg')
// → "product-23-primary.jpg"

generateImageFilename(23, 'gallery', 2, 'webp')
// → "product-23-gallery-2.webp"
```

---

### Image Processing Workflow

#### 1. Upload Phase

**User Action**: Drag & drop or select image file

**Validation Steps**:
```javascript
async function validateUploadedImage(file) {
  const errors = [];
  
  // 1. Check file type
  const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
  if (!validTypes.includes(file.type)) {
    errors.push(`Invalid file type: ${file.type}. Only JPG, PNG, WebP, AVIF allowed.`);
  }
  
  // 2. Check file size
  const maxSize = 10 * 1024 * 1024; // 10 MB
  if (file.size > maxSize) {
    errors.push(`File too large: ${(file.size / 1024 / 1024).toFixed(2)}MB. Maximum 10MB allowed.`);
  }
  
  // 3. Load and check dimensions
  const img = await loadImage(file);
  if (img.width < 400 || img.height < 400) {
    errors.push(`Image too small: ${img.width}x${img.height}. Minimum 400x400 required.`);
  }
  
  // 4. Check aspect ratio (optional warning)
  const aspectRatio = img.width / img.height;
  if (aspectRatio < 0.8 || aspectRatio > 1.25) {
    // Warning, not error - allow non-square images
    warnings.push('Image is not square. Product cards display best with square images.');
  }
  
  return {
    valid: errors.length === 0,
    errors: errors,
    warnings: warnings,
    dimensions: { width: img.width, height: img.height }
  };
}
```

#### 2. Processing Phase

**Libraries Required**:
- **Node.js**: `sharp` (recommended - high performance)
- **Alternative**: `jimp` (pure JavaScript, slower)

**Processing Steps**:

```javascript
async function processProductImage(inputFile, productId, imageType, index = null) {
  const sharp = require('sharp');
  const fs = require('fs');
  const path = require('path');
  
  const imagesDir = path.join(projectRoot, 'images');
  const results = {
    jpg: null,
    webp: null,
    avif: null,
    errors: []
  };
  
  try {
    // 1. Load image
    const image = sharp(inputFile.path);
    const metadata = await image.metadata();
    
    // 2. Resize if needed (max 2000x2000 for performance)
    let processedImage = image;
    if (metadata.width > 2000 || metadata.height > 2000) {
      processedImage = image.resize(2000, 2000, {
        fit: 'inside',
        withoutEnlargement: true
      });
    }
    
    // 3. Generate filenames
    const baseName = generateImageFilename(productId, imageType, index, '');
    const jpgPath = path.join(imagesDir, `${baseName}jpg`);
    const webpPath = path.join(imagesDir, `${baseName}webp`);
    const avifPath = path.join(imagesDir, `${baseName}avif`);
    
    // 4. Convert to JPG (if not already)
    await processedImage
      .jpeg({ quality: 90, progressive: true })
      .toFile(jpgPath);
    results.jpg = `images/${baseName}jpg`;
    
    // 5. Convert to WebP
    await processedImage
      .webp({ quality: 80 })
      .toFile(webpPath);
    results.webp = `images/${baseName}webp`;
    
    // 6. Convert to AVIF
    await processedImage
      .avif({ quality: 60 })
      .toFile(avifPath);
    results.avif = `images/${baseName}avif`;
    
    // 7. Get file sizes for reporting
    results.sizes = {
      jpg: fs.statSync(jpgPath).size,
      webp: fs.statSync(webpPath).size,
      avif: fs.statSync(avifPath).size
    };
    
    // 8. Calculate savings
    results.savings = {
      webp: ((results.sizes.jpg - results.sizes.webp) / results.sizes.jpg * 100).toFixed(1),
      avif: ((results.sizes.jpg - results.sizes.avif) / results.sizes.jpg * 100).toFixed(1)
    };
    
  } catch (error) {
    results.errors.push(error.message);
  }
  
  return results;
}
```

#### 3. Storage Phase

**File Organization**:
```
images/
  product-1-primary.jpg
  product-1-primary.webp
  product-1-primary.avif
  product-1-gallery-1.jpg
  product-1-gallery-1.webp
  product-1-gallery-1.avif
  product-2-primary.jpg
  product-2-primary.webp
  product-2-primary.avif
  ...
```

**Update Product Object**:
```javascript
function updateProductWithImages(product, primaryPath, galleryPaths) {
  // Update legacy field
  product.image = primaryPath;
  
  // Update modern schema
  product.images = {
    primary: primaryPath,
    gallery: galleryPaths || []
  };
  
  return product;
}

// Example usage:
const product = {
  id: 23,
  name: "New Product"
  // ... other fields
};

const primaryPath = "images/product-23-primary.jpg";
const galleryPaths = [
  "images/product-23-gallery-1.jpg",
  "images/product-23-gallery-2.jpg"
];

updateProductWithImages(product, primaryPath, galleryPaths);

// Result:
{
  id: 23,
  image: "images/product-23-primary.jpg",
  images: {
    primary: "images/product-23-primary.jpg",
    gallery: [
      "images/product-23-gallery-1.jpg",
      "images/product-23-gallery-2.jpg"
    ]
  }
}
```

---

### Image Optimization Settings

#### JPG/JPEG Settings
```javascript
{
  quality: 90,           // High quality for fallback
  progressive: true,     // Progressive loading
  mozjpeg: true         // Use mozjpeg for better compression (optional)
}
```

#### WebP Settings
```javascript
{
  quality: 80,           // Good balance of quality/size
  alphaQuality: 80,      // Transparency quality
  lossless: false        // Lossy compression for smaller files
}
```

#### AVIF Settings
```javascript
{
  quality: 60,           // Lower quality OK (AVIF compresses better)
  speed: 5,              // 0-10 (slower = smaller files)
  chromaSubsampling: '4:2:0'
}
```

**Expected File Sizes** (800x800px product image):
- Original PNG: ~800 KB
- Optimized JPG: ~150 KB (81% reduction)
- WebP: ~90 KB (89% reduction)
- AVIF: ~60 KB (92.5% reduction)

---

### Deletion Handling

**When deleting/replacing product images**:

```javascript
async function deleteProductImages(productId, imageType = 'all') {
  const fs = require('fs').promises;
  const path = require('path');
  const glob = require('glob');
  
  const imagesDir = path.join(projectRoot, 'images');
  const patterns = [];
  
  if (imageType === 'all') {
    // Delete all images for this product
    patterns.push(`product-${productId}-*.{jpg,jpeg,png,webp,avif}`);
  } else if (imageType === 'primary') {
    patterns.push(`product-${productId}-primary.{jpg,jpeg,png,webp,avif}`);
  } else if (imageType === 'gallery') {
    patterns.push(`product-${productId}-gallery-*.{jpg,jpeg,png,webp,avif}`);
  }
  
  const deletedFiles = [];
  
  for (const pattern of patterns) {
    const files = glob.sync(path.join(imagesDir, pattern));
    
    for (const file of files) {
      try {
        await fs.unlink(file);
        deletedFiles.push(path.basename(file));
      } catch (error) {
        console.error(`Failed to delete ${file}:`, error);
      }
    }
  }
  
  return deletedFiles;
}
```

**Cleanup on Product Deletion**:
- Delete all associated image files (JPG, WebP, AVIF)
- Remove from product object
- Update products.json

---

### UI Requirements for Image Management

#### Primary Image Upload

**Interface Elements**:
```
┌─────────────────────────────────────┐
│  Primary Product Image              │
│  ┌─────────────────────────────┐   │
│  │                             │   │
│  │     [Image Preview]         │   │
│  │       200x200px             │   │
│  │                             │   │
│  │  or                         │   │
│  │                             │   │
│  │  [Upload Icon]              │   │
│  │  Drag & drop or click       │   │
│  │  JPG, PNG (max 10MB)        │   │
│  │                             │   │
│  └─────────────────────────────┘   │
│                                     │
│  [Choose File] [Remove]             │
│                                     │
│  ℹ️ Recommended: 800x800px square    │
└─────────────────────────────────────┘
```

**Features**:
- Drag & drop zone
- Click to browse files
- Image preview with actual dimensions shown
- Replace/Remove buttons
- Progress indicator during upload/processing
- Success/error messages

#### Gallery Images Upload

**Interface Elements**:
```
┌─────────────────────────────────────┐
│  Gallery Images (Optional)          │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐       │
│  │ 1  │ │ 2  │ │ 3  │ │ +  │       │
│  │img │ │img │ │img │ │Add │       │
│  │ ✕  │ │ ✕  │ │ ✕  │ │    │       │
│  └────┘ └────┘ └────┘ └────┘       │
│                                     │
│  📌 Drag to reorder                  │
│  ℹ️ Maximum 10 images                │
└─────────────────────────────────────┘
```

**Features**:
- Thumbnail grid (120x120px each)
- Sortable (drag to reorder)
- Remove button (X) on each thumbnail
- Add button (max 10 total)
- Multi-file upload support
- Batch processing indicator

#### Processing Feedback

**Progress Display**:
```
Processing image...
━━━━━━━━━━━━━━━━━━━━ 75%

✓ Saved JPG (150 KB)
✓ Generated WebP (90 KB) - 40% smaller
⏳ Generating AVIF...
```

**Completion Display**:
```
✓ Image processed successfully!

Original: 1.2 MB
JPG: 150 KB (87% smaller)
WebP: 90 KB (92% smaller)
AVIF: 60 KB (95% smaller)
Total savings: 95%
```

---

### Error Handling

**Common Errors & Solutions**:

| Error | Cause | Solution |
|-------|-------|----------|
| "File too large" | Image > 10 MB | Show error, suggest compression |
| "Invalid format" | Non-image file | Show error, list valid formats |
| "Image too small" | < 400x400px | Show error, suggest minimum size |
| "Processing failed" | Corrupted file | Show error, ask to try different file |
| "Disk space low" | Not enough space | Show error, free up space |
| "Permission denied" | Cannot write to /images | Show error, check folder permissions |

**Error Display**:
```javascript
function showImageError(error) {
  // Show user-friendly error message
  const messages = {
    'FILE_TOO_LARGE': 'Image file is too large. Maximum 10MB allowed.',
    'INVALID_FORMAT': 'Invalid file format. Please use JPG or PNG.',
    'TOO_SMALL': 'Image is too small. Minimum 400x400 pixels required.',
    'PROCESSING_FAILED': 'Failed to process image. File may be corrupted.',
    'DISK_SPACE': 'Not enough disk space to save image.',
    'PERMISSION_DENIED': 'Cannot write to images folder. Check permissions.'
  };
  
  return messages[error.code] || 'An unexpected error occurred.';
}
```

---

### Testing Image Processing

**Test Cases**:

1. **Valid Image Upload**
   - Upload 800x800 JPG
   - Verify 3 files created (JPG, WebP, AVIF)
   - Verify file sizes are smaller
   - Verify preview shows correct image

2. **Large Image Resize**
   - Upload 4000x4000 PNG
   - Verify image resized to 2000x2000
   - Verify quality maintained

3. **Multiple Gallery Images**
   - Upload 5 images at once
   - Verify all converted
   - Verify correct numbering (gallery-1, gallery-2, etc.)

4. **Image Replacement**
   - Replace primary image
   - Verify old files deleted
   - Verify new files created with same name

5. **Error Scenarios**
   - Upload 15 MB file → show error
   - Upload PDF file → show error
   - Upload 100x100 image → show error

---

## 🔗 GitHub Integration

### Overview

The GitHub integration allows non-technical users to publish changes to the live store with a single click, without needing Git knowledge or command-line tools.

**Current Manual Process** (to be automated):
1. User manually commits changes using Git CLI
2. User pushes to GitHub using command line
3. GitHub Pages automatically deploys changes

**Target Automated Process**:
1. User clicks "Publish Changes" button in GUI
2. Application automatically:
   - Validates all changes
   - Commits changes with descriptive message
   - Pushes to GitHub
   - Shows success confirmation
3. GitHub Pages deploys (automatic, 1-2 minutes)

---

### Setup Requirements

#### Initial Configuration (One-Time Setup)

**User Inputs Required**:
1. **GitHub Repository URL**
   - Format: `https://github.com/username/repository-name`
   - Example: `https://github.com/aboayman-oss/Sakr-Store`
   - Validation: Must be a valid GitHub HTTPS URL

2. **GitHub Username**
   - Example: `aboayman-oss`
   - Validation: Alphanumeric, hyphens allowed

3. **GitHub Personal Access Token (PAT)**
   - Required scopes: `repo` (full control of private repositories)
   - Generate at: https://github.com/settings/tokens
   - Security: Store securely (encrypted in app config)

4. **Local Project Path**
   - Path to cloned repository on local machine
   - Must be a valid Git repository
   - Must have `.git` folder

**Setup Wizard UI**:
```
┌─────────────────────────────────────────────────┐
│  GitHub Integration Setup                       │
├─────────────────────────────────────────────────┤
│                                                 │
│  Repository URL *                               │
│  ┌──────────────────────────────────────────┐  │
│  │ https://github.com/user/repo-name        │  │
│  └──────────────────────────────────────────┘  │
│                                                 │
│  GitHub Username *                              │
│  ┌──────────────────────────────────────────┐  │
│  │ your-username                            │  │
│  └──────────────────────────────────────────┘  │
│                                                 │
│  Personal Access Token (PAT) *                  │
│  ┌──────────────────────────────────────────┐  │
│  │ ••••••••••••••••••••••••••••••••••••••   │  │
│  └──────────────────────────────────────────┘  │
│  ℹ️ Generate token: github.com/settings/tokens  │
│  Required scope: repo                           │
│                                                 │
│  Local Project Path *                           │
│  ┌──────────────────────────────────────────┐  │
│  │ C:\Projects\Sakr-Store           [Browse]│  │
│  └──────────────────────────────────────────┘  │
│                                                 │
│  [Test Connection]  [Cancel]  [Save & Continue]│
└─────────────────────────────────────────────────┘
```

**Configuration Storage**:
```json
{
  "github": {
    "repositoryUrl": "https://github.com/aboayman-oss/Sakr-Store",
    "username": "aboayman-oss",
    "token": "encrypted_token_here",
    "localPath": "E:\\Sakr-Store\\Sakr-Store",
    "branch": "main",
    "autoCommit": true,
    "commitMessageTemplate": "Update products via Store Manager"
  }
}
```

---

### Git Operations

#### 1. Initialize Repository (If Needed)

**Check if Repository Exists**:
```javascript
const fs = require('fs');
const path = require('path');

function isGitRepository(projectPath) {
  const gitPath = path.join(projectPath, '.git');
  return fs.existsSync(gitPath) && fs.statSync(gitPath).isDirectory();
}
```

**Clone Repository** (if not exists):
```javascript
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

async function cloneRepository(repoUrl, targetPath, token, username) {
  // Use token authentication in URL
  const authenticatedUrl = repoUrl.replace(
    'https://github.com',
    `https://${username}:${token}@github.com`
  );
  
  try {
    const { stdout, stderr } = await execPromise(
      `git clone "${authenticatedUrl}" "${targetPath}"`
    );
    
    return {
      success: true,
      message: 'Repository cloned successfully'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}
```

#### 2. Check Repository Status

**Get Current Status**:
```javascript
async function getGitStatus(projectPath) {
  try {
    const { stdout } = await execPromise('git status --porcelain', {
      cwd: projectPath
    });
    
    // Parse output
    const changes = stdout.split('\n')
      .filter(line => line.trim())
      .map(line => {
        const status = line.substring(0, 2);
        const file = line.substring(3);
        return { status, file };
      });
    
    return {
      hasChanges: changes.length > 0,
      changes: changes,
      modified: changes.filter(c => c.status.includes('M')).length,
      added: changes.filter(c => c.status.includes('A')).length,
      deleted: changes.filter(c => c.status.includes('D')).length,
      untracked: changes.filter(c => c.status.includes('??')).length
    };
  } catch (error) {
    return {
      error: error.message
    };
  }
}
```

**Status Display UI**:
```
┌─────────────────────────────────────┐
│  Repository Status                  │
├─────────────────────────────────────┤
│  Branch: main                       │
│  Status: 3 changes to publish       │
│                                     │
│  Modified:  1 file                  │
│  • products.json                    │
│                                     │
│  Added:     2 files                 │
│  • images/product-24-primary.jpg    │
│  • images/product-24-primary.webp   │
│                                     │
│  [View Details] [Publish Changes]   │
└─────────────────────────────────────┘
```

#### 3. Commit Changes

**Generate Commit Message**:
```javascript
function generateCommitMessage(changes) {
  const { modified, added, deleted } = changes;
  
  const parts = [];
  
  if (added > 0) parts.push(`Added ${added} product(s)`);
  if (modified > 0) parts.push(`Modified ${modified} product(s)`);
  if (deleted > 0) parts.push(`Deleted ${deleted} product(s)`);
  
  if (parts.length === 0) return 'Update products via Store Manager';
  
  return parts.join(', ') + ' via Store Manager';
}

// Examples:
// "Added 1 product(s) via Store Manager"
// "Modified 2 product(s), Added 3 product(s) via Store Manager"
// "Deleted 1 product(s) via Store Manager"
```

**Custom Commit Message Option**:
```
┌─────────────────────────────────────────────┐
│  Publish Changes                            │
├─────────────────────────────────────────────┤
│  Commit Message                             │
│  ┌───────────────────────────────────────┐ │
│  │ Added 2 products, Updated 1 product   │ │
│  │ via Store Manager                     │ │
│  └───────────────────────────────────────┘ │
│                                             │
│  ☑️ Auto-generate commit messages            │
│                                             │
│  [Cancel]  [Publish]                        │
└─────────────────────────────────────────────┘
```

**Commit Implementation**:
```javascript
async function commitChanges(projectPath, message) {
  try {
    // Stage all changes
    await execPromise('git add .', { cwd: projectPath });
    
    // Commit
    await execPromise(`git commit -m "${message}"`, { 
      cwd: projectPath 
    });
    
    return {
      success: true,
      message: 'Changes committed successfully'
    };
  } catch (error) {
    // Handle "nothing to commit" case
    if (error.message.includes('nothing to commit')) {
      return {
        success: true,
        message: 'No changes to commit',
        noChanges: true
      };
    }
    
    return {
      success: false,
      error: error.message
    };
  }
}
```

#### 4. Push to GitHub

**Push Implementation**:
```javascript
async function pushToGitHub(projectPath, branch = 'main', username, token) {
  try {
    // Configure credentials (temporarily)
    const authenticatedUrl = `https://${username}:${token}@github.com/${username}/repository.git`;
    
    // Set remote URL with authentication
    await execPromise(
      `git remote set-url origin ${authenticatedUrl}`,
      { cwd: projectPath }
    );
    
    // Push
    await execPromise(`git push origin ${branch}`, { 
      cwd: projectPath 
    });
    
    // Remove credentials from remote URL (security)
    const cleanUrl = authenticatedUrl.replace(`:${token}`, '');
    await execPromise(
      `git remote set-url origin ${cleanUrl}`,
      { cwd: projectPath }
    );
    
    return {
      success: true,
      message: 'Changes pushed to GitHub successfully'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}
```

**Push Progress Display**:
```
┌─────────────────────────────────────┐
│  Publishing Changes...              │
├─────────────────────────────────────┤
│                                     │
│  ✓ Staged changes                   │
│  ✓ Created commit                   │
│  ⏳ Pushing to GitHub...             │
│     ━━━━━━━━━━━━━━━━━━━━━━━ 60%    │
│                                     │
│  Please wait...                     │
└─────────────────────────────────────┘
```

**Success Display**:
```
┌─────────────────────────────────────┐
│  ✓ Published Successfully!          │
├─────────────────────────────────────┤
│                                     │
│  Your changes have been published   │
│  to GitHub.                         │
│                                     │
│  The live store will update in      │
│  1-2 minutes via GitHub Pages.      │
│                                     │
│  [View on GitHub]  [Close]          │
└─────────────────────────────────────┘
```

#### 5. Pull Latest Changes

**Pull Before Publishing**:
```javascript
async function pullLatestChanges(projectPath, branch = 'main') {
  try {
    // Fetch latest
    await execPromise('git fetch origin', { cwd: projectPath });
    
    // Check if remote is ahead
    const { stdout } = await execPromise(
      `git rev-list HEAD..origin/${branch} --count`,
      { cwd: projectPath }
    );
    
    const commitsAhead = parseInt(stdout.trim());
    
    if (commitsAhead > 0) {
      // Pull changes
      await execPromise(`git pull origin ${branch}`, { 
        cwd: projectPath 
      });
      
      return {
        success: true,
        updated: true,
        commitsAhead: commitsAhead,
        message: `Pulled ${commitsAhead} new commit(s) from GitHub`
      };
    }
    
    return {
      success: true,
      updated: false,
      message: 'Already up to date'
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}
```

**Conflict Detection**:
```javascript
async function detectMergeConflicts(projectPath) {
  try {
    const { stdout } = await execPromise(
      'git ls-files -u',
      { cwd: projectPath }
    );
    
    if (stdout.trim()) {
      // Conflicts exist
      const conflicts = stdout.split('\n')
        .filter(line => line.trim())
        .map(line => line.split('\t')[1]);
      
      return {
        hasConflicts: true,
        files: [...new Set(conflicts)]
      };
    }
    
    return { hasConflicts: false };
  } catch (error) {
    return { error: error.message };
  }
}
```

**Conflict Resolution UI**:
```
┌─────────────────────────────────────────────┐
│  ⚠️ Merge Conflict Detected                 │
├─────────────────────────────────────────────┤
│                                             │
│  Cannot publish: conflicts with remote      │
│  changes.                                   │
│                                             │
│  Conflicting file:                          │
│  • products.json                            │
│                                             │
│  Options:                                   │
│  1. Keep your local changes (overwrites     │
│     remote)                                 │
│  2. Keep remote changes (discards local)    │
│  3. Merge manually (advanced)               │
│                                             │
│  [Keep Local]  [Keep Remote]  [Cancel]      │
└─────────────────────────────────────────────┘
```

---

### Complete Publish Workflow

**Full Publish Flow**:
```javascript
async function publishChanges(config) {
  const { projectPath, branch, username, token, commitMessage } = config;
  
  const results = {
    steps: [],
    success: false,
    error: null
  };
  
  try {
    // Step 1: Check for changes
    results.steps.push({ step: 'check', status: 'started' });
    const status = await getGitStatus(projectPath);
    
    if (!status.hasChanges) {
      results.steps.push({ step: 'check', status: 'completed', message: 'No changes' });
      results.success = true;
      results.noChanges = true;
      return results;
    }
    results.steps.push({ step: 'check', status: 'completed', changes: status });
    
    // Step 2: Pull latest changes
    results.steps.push({ step: 'pull', status: 'started' });
    const pullResult = await pullLatestChanges(projectPath, branch);
    
    if (!pullResult.success) {
      throw new Error(`Pull failed: ${pullResult.error}`);
    }
    results.steps.push({ step: 'pull', status: 'completed', ...pullResult });
    
    // Step 3: Check for conflicts
    const conflicts = await detectMergeConflicts(projectPath);
    if (conflicts.hasConflicts) {
      throw new Error(`Merge conflicts detected in: ${conflicts.files.join(', ')}`);
    }
    
    // Step 4: Commit changes
    results.steps.push({ step: 'commit', status: 'started' });
    const message = commitMessage || generateCommitMessage(status);
    const commitResult = await commitChanges(projectPath, message);
    
    if (!commitResult.success && !commitResult.noChanges) {
      throw new Error(`Commit failed: ${commitResult.error}`);
    }
    results.steps.push({ step: 'commit', status: 'completed', message });
    
    // Step 5: Push to GitHub
    results.steps.push({ step: 'push', status: 'started' });
    const pushResult = await pushToGitHub(projectPath, branch, username, token);
    
    if (!pushResult.success) {
      throw new Error(`Push failed: ${pushResult.error}`);
    }
    results.steps.push({ step: 'push', status: 'completed' });
    
    results.success = true;
    
  } catch (error) {
    results.error = error.message;
    results.success = false;
  }
  
  return results;
}
```

---

### Security Considerations

#### 1. Token Storage

**Encryption**:
```javascript
const crypto = require('crypto');

// Encryption
function encryptToken(token, masterPassword) {
  const algorithm = 'aes-256-cbc';
  const key = crypto.scryptSync(masterPassword, 'salt', 32);
  const iv = crypto.randomBytes(16);
  
  const cipher = crypto.createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(token, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return {
    encrypted: encrypted,
    iv: iv.toString('hex')
  };
}

// Decryption
function decryptToken(encryptedData, masterPassword) {
  const algorithm = 'aes-256-cbc';
  const key = crypto.scryptSync(masterPassword, 'salt', 32);
  const iv = Buffer.from(encryptedData.iv, 'hex');
  
  const decipher = crypto.createDecipheriv(algorithm, key, iv);
  let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}
```

**Configuration Storage**:
- Windows: `%APPDATA%\SakrStoreManager\config.json`
- Future (macOS): `~/Library/Application Support/SakrStoreManager/config.json`
- Future (Linux): `~/.config/sakr-store-manager/config.json`

#### 2. Token Validation

**Test Connection**:
```javascript
async function testGitHubConnection(username, token, repoUrl) {
  const https = require('https');
  
  // Extract owner/repo from URL
  const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
  if (!match) {
    return { success: false, error: 'Invalid repository URL' };
  }
  
  const [, owner, repo] = match;
  
  return new Promise((resolve) => {
    const options = {
      hostname: 'api.github.com',
      path: `/repos/${owner}/${repo}`,
      method: 'GET',
      headers: {
        'User-Agent': 'Sakr-Store-Manager',
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    };
    
    const req = https.request(options, (res) => {
      if (res.statusCode === 200) {
        resolve({
          success: true,
          message: 'Connection successful'
        });
      } else if (res.statusCode === 401) {
        resolve({
          success: false,
          error: 'Invalid token or insufficient permissions'
        });
      } else if (res.statusCode === 404) {
        resolve({
          success: false,
          error: 'Repository not found or no access'
        });
      } else {
        resolve({
          success: false,
          error: `Unexpected status: ${res.statusCode}`
        });
      }
    });
    
    req.on('error', (error) => {
      resolve({
        success: false,
        error: error.message
      });
    });
    
    req.end();
  });
}
```

#### 3. Permissions Required

**GitHub Token Scopes**:
- `repo` - Full control of private repositories
  - Includes: `repo:status`, `repo_deployment`, `public_repo`, `repo:invite`

**Generate Token Instructions**:
1. Go to: https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Give it a descriptive name: "Sakr Store Manager"
4. Select scopes: ☑️ repo
5. Click "Generate token"
6. Copy token immediately (shown only once)

---

### Error Handling

**Common Errors**:

| Error | Cause | Solution |
|-------|-------|----------|
| "Authentication failed" | Invalid token | Regenerate token, update in settings |
| "Repository not found" | Wrong URL or no access | Check URL, verify permissions |
| "Push rejected" | Force push blocked | Pull latest changes first |
| "Merge conflict" | Conflicting changes | Resolve manually or choose version |
| "Network error" | No internet | Check connection, try again |
| "Permission denied" | Insufficient Git permissions | Check folder permissions |

**User-Friendly Error Messages**:
```javascript
function getGitHubErrorMessage(error) {
  const messages = {
    'Authentication failed': 'Your GitHub token is invalid or expired. Please update it in Settings.',
    'Repository not found': 'Cannot access the repository. Check the URL and your permissions.',
    'Connection refused': 'Cannot connect to GitHub. Check your internet connection.',
    'Merge conflict': 'Your changes conflict with remote changes. Please resolve conflicts.',
    'Push rejected': 'Push was rejected. Pull the latest changes and try again.',
    'Permission denied': 'Cannot access the local repository. Check folder permissions.'
  };
  
  for (const [key, message] of Object.entries(messages)) {
    if (error.includes(key)) return message;
  }
  
  return `An error occurred: ${error}`;
}
```

---

### Auto-Publish Feature

**Optional Auto-Publish on Save**:
```
┌─────────────────────────────────────┐
│  Settings > Publishing              │
├─────────────────────────────────────┤
│                                     │
│  ☐ Auto-publish on save             │
│     Automatically commit and push   │
│     to GitHub when saving products  │
│                                     │
│  ☐ Show confirmation before publish │
│     Require confirmation before     │
│     pushing to GitHub               │
│                                     │
│  Commit message template:           │
│  ┌──────────────────────────────┐  │
│  │ Update via Store Manager     │  │
│  └──────────────────────────────┘  │
│                                     │
│  [Save Settings]                    │
└─────────────────────────────────────┘
```

---

### Testing GitHub Integration

**Test Cases**:

1. **Initial Setup**
   - Enter valid credentials
   - Test connection successful
   - Clone repository (if needed)

2. **Publish New Product**
   - Add product with images
   - Click publish
   - Verify commit created
   - Verify pushed to GitHub

3. **Publish Multiple Changes**
   - Modify 2 products
   - Add 1 new product
   - Publish all at once
   - Verify single commit with all changes

4. **Handle Conflicts**
   - Make local changes
   - Simulate remote changes
   - Attempt publish
   - Show conflict resolution UI

5. **Offline Mode**
   - Disconnect internet
   - Try to publish
   - Show appropriate error
   - Allow continue working offline

---

## 🎨 User Interface Requirements

### Application Type

**Desktop Application** (Windows Only)
- **Platform**: Windows 10/11 (64-bit)
- **Framework**: Electron (recommended) or Tauri
- **UI Library**: React, Vue, or Svelte
- **Styling**: Modern, clean, professional

**Note**: While the architecture should remain cross-platform compatible for future expansion, initial development and distribution will focus exclusively on Windows.

---

### Main Window Layout

**Application Structure**:
```
┌────────────────────────────────────────────────────────────┐
│  Sakr Store Manager                      🔵 🟡 🔴         │
├────────────────────────────────────────────────────────────┤
│  File  Edit  View  Settings  Help                          │
├───────────────┬────────────────────────────────────────────┤
│               │                                            │
│  PRODUCTS     │  Product List                              │
│  ━━━━━━━━━    │  ┌──────────────────────────────────────┐ │
│               │  │  Search: [____________] 🔍           │ │
│  📦 All (23)  │  └──────────────────────────────────────┘ │
│               │                                            │
│  Categories   │  ┌────────────────────────────────────┐   │
│  👕 Apparel   │  │ 📦 Classic Black T-Shirt      $19.99 │ │
│  🏠 Home      │  │    Stock: 5 | Apparel | ⭐ New     │ │
│  💼 Access.   │  │    [Edit] [Duplicate] [Delete]     │ │
│  📱 Electr.   │  ├────────────────────────────────────┤   │
│  📚 Books     │  │ ☕ Modern Coffee Mug          $15.50 │ │
│  ...          │  │    Stock: 5 | Home Goods           │ │
│               │  │    [Edit] [Duplicate] [Delete]     │ │
│  Filters      │  ├────────────────────────────────────┤   │
│  ⭐ Featured  │  │ 🛍️ حقيبة توت كبيرة         $14.99 │ │
│  🎁 Discounts │  │    Stock: 10 | Accessories | ⭐ New │ │
│               │  │    [Edit] [Duplicate] [Delete]     │ │
│               │  └────────────────────────────────────┘   │
│               │                                            │
│  [+ New]      │  Showing 3 of 23 products                 │
│               │  [1] [2] [3] ... [8]                      │
├───────────────┴────────────────────────────────────────────┤
│  💾 Unsaved changes: 2 products  [Save] [Publish to GitHub]│
└────────────────────────────────────────────────────────────┘
```

---

### Product Editor Form

**Edit Product Window/Panel**:
```
┌──────────────────────────────────────────────────────────┐
│  Edit Product: Classic Black T-Shirt            ✕        │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  Basic Information                                       │
│  ━━━━━━━━━━━━━━━                                         │
│                                                          │
│  Product Name * (3-200 characters)                       │
│  ┌────────────────────────────────────────────────────┐ │
│  │ Classic Black T-Shirt                         45/200│ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  Category *                                              │
│  ┌────────────────────────────────────────────────────┐ │
│  │ Electronics                                     ▼  │ │
│  └────────────────────────────────────────────────────┘ │
│  💡 Select existing or type new category                 │
│                                                          │
│  Description * (10-1000 characters)                      │
│  ┌────────────────────────────────────────────────────┐ │
│  │ A high-quality, 100% cotton t-shirt available   │ │
│  │ in multiple sizes. Perfect for casual wear.     │ │
│  │                                                  │ │
│  │                                            125/1000│ │
│  └────────────────────────────────────────────────────┘ │
│  Preview: "A high-quality, 100% cotton t-shirt av..."   │
│                                                          │
├──────────────────────────────────────────────────────────┤
│  Images                                                  │
│  ━━━━━━                                                  │
│                                                          │
│  Primary Image *                                         │
│  ┌────────┐                                              │
│  │        │  tshirt.jpg (150 KB)                         │
│  │  📷    │  800x800 px                                  │
│  │        │  [Replace] [Remove]                          │
│  └────────┘                                              │
│                                                          │
│  Gallery Images                                          │
│  ┌────┐ ┌────┐ ┌────┐                                  │
│  │ 📷 │ │ 📷 │ │ +  │  Drag to reorder                 │
│  │  ✕ │ │  ✕ │ │Add │  Max 10 images                   │
│  └────┘ └────┘ └────┘                                   │
│                                                          │
├──────────────────────────────────────────────────────────┤
│  Pricing & Stock                                         │
│  ━━━━━━━━━━━━━━━                                         │
│                                                          │
│  Regular Price * (EGP)        Stock Level *              │
│  ┌─────────────┐              ┌──────┐                  │
│  │ EGP 25.00   │              │  5   │ [-] [+]         │
│  └─────────────┘              └──────┘                  │
│                               Status: ⚠️ Low Stock        │
│                                                          │
│  ☑️ Product is on discount                               │
│                                                          │
│  Discounted Price (EGP)       You Save                   │
│  ┌─────────────┐              ┌──────────────┐          │
│  │ EGP 19.99   │              │ EGP 5.01     │          │
│  └─────────────┘              │ (20.04%)     │          │
│                               └──────────────┘          │
│  OR                                                      │
│  Discount Percentage                                     │
│  ┌───────┐                                               │
│  │  20   │ %  [Apply]                                   │
│  └───────┘                                               │
│                                                          │
├──────────────────────────────────────────────────────────┤
│  Product Flags                                           │
│  ━━━━━━━━━━━━━                                           │
│                                                          │
│  ☑️ Mark as New/Featured                                 │
│     Shows "New" badge and appears in Featured category   │
│                                                          │
├──────────────────────────────────────────────────────────┤
│                                                          │
│     [Cancel]  [Save]  [Save & Close]  [Save & Publish]  │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

---

### Settings Window

**Settings/Preferences**:
```
┌──────────────────────────────────────────────────────────┐
│  Settings                                         ✕      │
├─────────────────┬────────────────────────────────────────┤
│                 │                                        │
│  General        │  General Settings                      │
│  GitHub         │  ━━━━━━━━━━━━━━━━                      │
│  Images         │                                        │
│  Appearance     │  Project Location                      │
│                 │  ┌─────────────────────────────────┐  │
│                 │  │ E:\Sakr-Store\Sakr-Store [📁]  │  │
│                 │  └─────────────────────────────────┘  │
│                 │                                        │
│                 │  ☑️ Auto-save changes                   │
│                 │  ☐ Show confirmation before delete     │
│                 │  ☑️ Create backup before publish        │
│                 │                                        │
│                 ├────────────────────────────────────────┤
│                 │  GitHub Integration                    │
│                 │  ━━━━━━━━━━━━━━━━━━━                   │
│                 │                                        │
│                 │  Repository URL                        │
│                 │  ┌─────────────────────────────────┐  │
│                 │  │ https://github.com/user/repo    │  │
│                 │  └─────────────────────────────────┘  │
│                 │                                        │
│                 │  Username                              │
│                 │  ┌─────────────────────────────────┐  │
│                 │  │ aboayman-oss                    │  │
│                 │  └─────────────────────────────────┘  │
│                 │                                        │
│                 │  Personal Access Token                 │
│                 │  ┌─────────────────────────────────┐  │
│                 │  │ ••••••••••••••••••••••••••••   │  │
│                 │  └─────────────────────────────────┘  │
│                 │  [Test Connection] ✅ Connected        │
│                 │                                        │
│                 │  ☑️ Auto-publish on save               │
│                 │  ☑️ Show publish confirmation          │
│                 │                                        │
│                 ├────────────────────────────────────────┤
│                 │  Image Processing                      │
│                 │  ━━━━━━━━━━━━━━━━━                     │
│                 │                                        │
│                 │  ☑️ Auto-convert to WebP (Quality: 80) │
│                 │  ☑️ Auto-convert to AVIF (Quality: 60) │
│                 │  ☑️ Auto-resize large images (2000px)  │
│                 │  ☐ Keep original uploaded files        │
│                 │                                        │
│                 │                                        │
│                 │              [Cancel]  [Save Settings] │
│                 │                                        │
└─────────────────┴────────────────────────────────────────┘
```

---

### User Experience Guidelines

#### 1. **Responsiveness**
- All operations < 100ms response time
- Show loading indicators for operations > 500ms
- Use progress bars for long operations (image processing, GitHub push)

#### 2. **Feedback**
- Toast notifications for successful actions (green)
- Error messages with actionable solutions (red)
- Warning messages for potential issues (orange)
- Confirmation dialogs for destructive actions

#### 3. **Keyboard Shortcuts**
```
Ctrl+N      - New Product
Ctrl+S      - Save
Ctrl+P      - Publish to GitHub
Ctrl+F      - Focus search
Ctrl+Q      - Quit
Delete      - Delete selected product (with confirmation)
Escape      - Close dialog/cancel
Enter       - Submit form/confirm
```

#### 4. **Validation**
- Real-time validation as user types
- Show errors inline near field
- Disable Save button until all required fields valid
- Clear error messages with suggestions

#### 5. **Undo/Redo**
- Ctrl+Z - Undo last change
- Ctrl+Y - Redo
- Keep history of last 50 changes
- Clear history on publish

#### 6. **Auto-Save**
- Save draft to temp storage every 30 seconds
- Restore draft on crash/close
- Prompt to restore on reopen

---

### Workflow Examples

#### Adding a New Product

1. Click "New Product" button
2. Form opens with default values
3. User enters:
   - Product name ✓
   - Selects category ✓
   - Writes description ✓
4. User uploads primary image
   - Progress indicator shows
   - Three formats generated automatically
   - Preview updates
5. User sets price: EGP 50.00
6. User enables discount, sets 20%
   - Discounted price auto-calculates: EGP 40.00
   - Savings displayed: "Save EGP 10.00 (20%)"
7. User sets stock: 25
   - Status shows: "✅ In Stock"
8. User checks "Mark as New"
9. Click "Save & Publish"
   - Validation passes ✓
   - Product added to list
   - Auto-commit to Git
   - Push to GitHub
   - Success notification

**Total Time**: < 2 minutes

#### Editing Multiple Products

1. User selects "Apparel" category
2. Sees filtered list of apparel products
3. Clicks Edit on "T-Shirt"
4. Changes stock from 5 to 20
5. Clicks "Save" (not "Save & Close")
6. Clicks Edit on "Hoodie"
7. Enables discount, sets to 30% off
8. Clicks "Save & Close"
9. Status bar shows: "💾 2 unsaved changes"
10. Clicks "Publish to GitHub"
11. Commit message auto-generated: "Modified 2 products via Store Manager"
12. Pushes to GitHub
13. Success: "✓ Published successfully!"

---

## 🏗️ Technical Architecture

### Technology Stack

#### Desktop Application Framework
**Recommended: Electron**
- ✅ Cross-platform codebase (easy future expansion to macOS/Linux)
- ✅ Large community & ecosystem
- ✅ Easy distribution
- ✅ Node.js integration (for Git, Sharp)
- ❌ Large bundle size (~150 MB)

**Alternative: Tauri**
- ✅ Smaller bundle size (~10 MB)
- ✅ Better performance
- ✅ More secure
- ❌ Smaller community
- ❌ Rust required for backend

**Decision**: Use **Electron** for easier development and better Node.js integration

**Initial Target**: Windows 10/11 (64-bit) only

#### Frontend Framework
**Recommended: React**
- Component library: Material-UI or Ant Design
- State management: Redux Toolkit or Zustand
- Form handling: React Hook Form
- Validation: Yup or Zod

**Alternative: Vue 3 + Vuetify**

#### Backend (Node.js)
```javascript
// Core Dependencies
{
  "electron": "^27.0.0",
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  
  // Image Processing
  "sharp": "^0.33.0",
  
  // Git Operations
  "simple-git": "^3.20.0",
  
  // File Operations
  "fs-extra": "^11.1.1",
  "glob": "^10.3.0",
  
  // Validation
  "yup": "^1.3.2",
  
  // Utilities
  "lodash": "^4.17.21",
  "date-fns": "^2.30.0"
}
```

---

### Application Structure

```
sakr-store-manager/
├── package.json
├── electron/
│   ├── main.js              # Electron main process
│   ├── preload.js           # Bridge between main/renderer
│   └── menu.js              # Application menu
│
├── src/
│   ├── App.jsx              # Root component
│   ├── main.jsx             # Entry point
│   │
│   ├── components/
│   │   ├── ProductList.jsx
│   │   ├── ProductEditor.jsx
│   │   ├── ImageUploader.jsx
│   │   ├── CategoryFilter.jsx
│   │   ├── SearchBar.jsx
│   │   └── StatusBar.jsx
│   │
│   ├── services/
│   │   ├── productService.js    # CRUD operations
│   │   ├── imageService.js      # Image processing
│   │   ├── gitService.js        # Git operations
│   │   └── validationService.js # Data validation
│   │
│   ├── store/
│   │   ├── store.js             # Redux store
│   │   ├── slices/
│   │   │   ├── productsSlice.js
│   │   │   ├── settingsSlice.js
│   │   │   └── uiSlice.js
│   │
│   ├── utils/
│   │   ├── constants.js
│   │   ├── helpers.js
│   │   └── errorHandler.js
│   │
│   └── assets/
│       ├── styles/
│       └── icons/
│
├── public/
│   └── icons/
│
└── dist/                    # Build output
```

---

### Core Services

#### 1. Product Service

```javascript
// src/services/productService.js

const fs = require('fs-extra');
const path = require('path');

class ProductService {
  constructor(projectPath) {
    this.projectPath = projectPath;
    this.productsFile = path.join(projectPath, 'products.json');
  }
  
  // Load all products
  async loadProducts() {
    try {
      const data = await fs.readJSON(this.productsFile, { encoding: 'utf8' });
      return Array.isArray(data) ? data : [];
    } catch (error) {
      if (error.code === 'ENOENT') {
        // File doesn't exist, create empty array
        await this.saveProducts([]);
        return [];
      }
      throw error;
    }
  }
  
  // Save all products
  async saveProducts(products) {
    // Sort by ID
    const sorted = products.sort((a, b) => a.id - b.id);
    
    // Write with UTF-8 encoding and 2-space indentation
    await fs.writeJSON(this.productsFile, sorted, {
      spaces: 2,
      encoding: 'utf8'
    });
  }
  
  // Get product by ID
  async getProduct(id) {
    const products = await this.loadProducts();
    return products.find(p => p.id === id);
  }
  
  // Add new product
  async addProduct(product) {
    const products = await this.loadProducts();
    
    // Auto-generate ID - always use max + 1, never reuse deleted IDs
    const maxId = products.length > 0 
      ? Math.max(...products.map(p => p.id))
      : 0;
    product.id = maxId + 1;
    
    // Add to array
    products.push(product);
    
    // Save
    await this.saveProducts(products);
    
    return product;
  }
  
  // Update existing product
  async updateProduct(id, updates) {
    const products = await this.loadProducts();
    const index = products.findIndex(p => p.id === id);
    
    if (index === -1) {
      throw new Error(`Product with ID ${id} not found`);
    }
    
    // Merge updates
    products[index] = { ...products[index], ...updates };
    
    // Save
    await this.saveProducts(products);
    
    return products[index];
  }
  
  // Delete product
  async deleteProduct(id) {
    const products = await this.loadProducts();
    const filtered = products.filter(p => p.id !== id);
    
    if (filtered.length === products.length) {
      throw new Error(`Product with ID ${id} not found`);
    }
    
    // Note: ID is NOT reused - next product will use max(allIds) + 1
    // This preserves URL integrity and prevents confusion
    
    // Save
    await this.saveProducts(filtered);
    
    return true;
  }
  
  // Duplicate product
  async duplicateProduct(id) {
    const original = await this.getProduct(id);
    if (!original) {
      throw new Error(`Product with ID ${id} not found`);
    }
    
    // Create copy with new ID
    const copy = {
      ...original,
      name: `${original.name} (Copy)`,
      isNew: false
    };
    delete copy.id; // Will be auto-generated
    
    return await this.addProduct(copy);
  }
}

module.exports = ProductService;
```

#### 2. Image Service

```javascript
// src/services/imageService.js

const sharp = require('sharp');
const fs = require('fs-extra');
const path = require('path');

class ImageService {
  constructor(projectPath) {
    this.projectPath = projectPath;
    this.imagesDir = path.join(projectPath, 'images');
  }
  
  // Process and save product image
  async processProductImage(inputFile, productId, imageType, index = null) {
    // Ensure images directory exists
    await fs.ensureDir(this.imagesDir);
    
    // Generate filename
    const baseName = this.generateFilename(productId, imageType, index);
    
    // Process image
    const image = sharp(inputFile.path);
    const metadata = await image.metadata();
    
    // Resize if needed
    if (metadata.width > 2000 || metadata.height > 2000) {
      image.resize(2000, 2000, {
        fit: 'inside',
        withoutEnlargement: true
      });
    }
    
    // Save in three formats
    const results = {};
    
    // JPG
    const jpgPath = path.join(this.imagesDir, `${baseName}.jpg`);
    await image.jpeg({ quality: 90, progressive: true }).toFile(jpgPath);
    results.jpg = `images/${baseName}.jpg`;
    
    // WebP
    const webpPath = path.join(this.imagesDir, `${baseName}.webp`);
    await image.webp({ quality: 80 }).toFile(webpPath);
    results.webp = `images/${baseName}.webp`;
    
    // AVIF
    const avifPath = path.join(this.imagesDir, `${baseName}.avif`);
    await image.avif({ quality: 60 }).toFile(avifPath);
    results.avif = `images/${baseName}.avif`;
    
    // Return JPG path (primary format for products.json)
    return results.jpg;
  }
  
  // Generate filename
  generateFilename(productId, imageType, index = null) {
    if (imageType === 'primary') {
      return `product-${productId}-primary`;
    } else if (imageType === 'gallery' && index !== null) {
      return `product-${productId}-gallery-${index}`;
    }
    throw new Error('Invalid image type or missing index');
  }
  
  // Delete product images
  async deleteProductImages(productId, imageType = 'all') {
    const glob = require('glob');
    
    let pattern;
    if (imageType === 'all') {
      pattern = `product-${productId}-*.{jpg,jpeg,png,webp,avif}`;
    } else if (imageType === 'primary') {
      pattern = `product-${productId}-primary.{jpg,jpeg,png,webp,avif}`;
    } else if (imageType === 'gallery') {
      pattern = `product-${productId}-gallery-*.{jpg,jpeg,png,webp,avif}`;
    }
    
    const files = glob.sync(path.join(this.imagesDir, pattern));
    
    for (const file of files) {
      await fs.unlink(file);
    }
    
    return files.length;
  }
  
  // Validate uploaded image
  async validateImage(file) {
    const errors = [];
    const warnings = [];
    
    // Check file type
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
    if (!validTypes.includes(file.type)) {
      errors.push('Invalid file type. Only JPG, PNG, WebP, AVIF allowed.');
    }
    
    // Check file size (10 MB max)
    if (file.size > 10 * 1024 * 1024) {
      errors.push(`File too large (${(file.size / 1024 / 1024).toFixed(2)} MB). Maximum 10 MB.`);
    }
    
    // Check dimensions
    try {
      const metadata = await sharp(file.path).metadata();
      
      if (metadata.width < 400 || metadata.height < 400) {
        errors.push(`Image too small (${metadata.width}x${metadata.height}). Minimum 400x400.`);
      }
      
      // Check aspect ratio
      const aspectRatio = metadata.width / metadata.height;
      if (aspectRatio < 0.8 || aspectRatio > 1.25) {
        warnings.push('Image is not square. Product cards look best with square images.');
      }
      
      return {
        valid: errors.length === 0,
        errors,
        warnings,
        dimensions: { width: metadata.width, height: metadata.height }
      };
    } catch (error) {
      errors.push('Failed to read image. File may be corrupted.');
      return { valid: false, errors, warnings };
    }
  }
}

module.exports = ImageService;
```

#### 3. Git Service

```javascript
// src/services/gitService.js

const simpleGit = require('simple-git');
const path = require('path');

class GitService {
  constructor(projectPath, config) {
    this.projectPath = projectPath;
    this.config = config;
    this.git = simpleGit(projectPath);
  }
  
  // Check if directory is a Git repository
  async isRepository() {
    return await this.git.checkIsRepo();
  }
  
  // Get repository status
  async getStatus() {
    const status = await this.git.status();
    
    return {
      hasChanges: !status.isClean(),
      modified: status.modified.length,
      added: status.created.length,
      deleted: status.deleted.length,
      files: status.files
    };
  }
  
  // Commit changes
  async commit(message) {
    await this.git.add('.');
    const result = await this.git.commit(message);
    return result;
  }
  
  // Push to remote
  async push(branch = 'main') {
    const { username, token } = this.config;
    
    // Temporarily set remote with auth
    const remote = `https://${username}:${token}@github.com/${username}/${this.getRepoName()}.git`;
    await this.git.remote(['set-url', 'origin', remote]);
    
    // Push
    const result = await this.git.push('origin', branch);
    
    // Remove token from remote URL
    const cleanRemote = remote.replace(`:${token}`, '');
    await this.git.remote(['set-url', 'origin', cleanRemote]);
    
    return result;
  }
  
  // Pull latest changes
  async pull(branch = 'main') {
    await this.git.fetch();
    const result = await this.git.pull('origin', branch);
    return result;
  }
  
  // Full publish workflow
  async publish(commitMessage) {
    try {
      // Pull latest
      await this.pull();
      
      // Commit
      await this.commit(commitMessage);
      
      // Push
      await this.push();
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
  
  // Get repository name from URL
  getRepoName() {
    const url = this.config.repositoryUrl;
    const match = url.match(/github\.com\/[^\/]+\/([^\/\.]+)/);
    return match ? match[1] : 'repository';
  }
}

module.exports = GitService;
```

---

### Data Flow

```
User Action (UI)
     ↓
React Component
     ↓
Redux Action
     ↓
Service Layer (productService, imageService, gitService)
     ↓
File System / Git
     ↓
Redux State Update
     ↓
UI Re-render
```

---

### State Management (Redux)

```javascript
// src/store/slices/productsSlice.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunks
export const loadProducts = createAsyncThunk(
  'products/load',
  async (projectPath) => {
    const service = new ProductService(projectPath);
    return await service.loadProducts();
  }
);

export const addProduct = createAsyncThunk(
  'products/add',
  async ({ product, projectPath }) => {
    const service = new ProductService(projectPath);
    return await service.addProduct(product);
  }
);

export const updateProduct = createAsyncThunk(
  'products/update',
  async ({ id, updates, projectPath }) => {
    const service = new ProductService(projectPath);
    return await service.updateProduct(id, updates);
  }
);

export const deleteProduct = createAsyncThunk(
  'products/delete',
  async ({ id, projectPath }) => {
    const service = new ProductService(projectPath);
    await service.deleteProduct(id);
    return id;
  }
);

// Slice
const productsSlice = createSlice({
  name: 'products',
  initialState: {
    items: [],
    loading: false,
    error: null,
    hasUnsavedChanges: false
  },
  reducers: {
    markSaved: (state) => {
      state.hasUnsavedChanges = false;
    }
  },
  extraReducers: (builder) => {
    builder
      // Load
      .addCase(loadProducts.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadProducts.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
        state.hasUnsavedChanges = false;
      })
      .addCase(loadProducts.rejected, (state, action) => {
        state.error = action.error.message;
        state.loading = false;
      })
      // Add
      .addCase(addProduct.fulfilled, (state, action) => {
        state.items.push(action.payload);
        state.hasUnsavedChanges = true;
      })
      // Update
      .addCase(updateProduct.fulfilled, (state, action) => {
        const index = state.items.findIndex(p => p.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        state.hasUnsavedChanges = true;
      })
      // Delete
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.items = state.items.filter(p => p.id !== action.payload);
        state.hasUnsavedChanges = true;
      });
  }
});

export const { markSaved } = productsSlice.actions;
export default productsSlice.reducer;
```

---

## ⚠️ Error Handling & Validation

### Input Validation

Use **Yup** schema for validation:

```javascript
import * as yup from 'yup';

const productSchema = yup.object().shape({
  name: yup.string()
    .required('Product name is required')
    .min(3, 'Name must be at least 3 characters')
    .max(200, 'Name must be less than 200 characters'),
    
  price: yup.number()
    .required('Price is required')
    .positive('Price must be positive')
    .test('decimal', 'Price must have max 2 decimal places', 
      value => (value * 100) % 1 === 0),
      
  description: yup.string()
    .required('Description is required')
    .min(10, 'Description must be at least 10 characters')
    .max(1000, 'Description must be less than 1000 characters'),
    
  category: yup.string()
    .required('Category is required')
    .oneOf(CATEGORIES, 'Invalid category'),
    
  discount: yup.boolean(),
  
  discountedPrice: yup.number()
    .when('discount', {
      is: true,
      then: yup.number()
        .required('Discounted price is required when discount is enabled')
        .positive('Discounted price must be positive')
        .lessThan(yup.ref('price'), 'Discounted price must be less than regular price')
    }),
    
  stock: yup.number()
    .required('Stock is required')
    .integer('Stock must be a whole number')
    .min(0, 'Stock cannot be negative'),
    
  isNew: yup.boolean(),
  
  images: yup.object().shape({
    primary: yup.string().required('Primary image is required'),
    gallery: yup.array().of(yup.string()).max(10, 'Maximum 10 gallery images')
  })
});
```

---

### Error Messages

**User-Friendly Error Display**:

```javascript
const ERROR_MESSAGES = {
  // File errors
  'ENOENT': 'File not found. Please check the project path.',
  'EACCES': 'Permission denied. Check folder permissions.',
  'ENOSPC': 'Not enough disk space.',
  
  // Git errors
  'Authentication failed': 'GitHub authentication failed. Check your token.',
  'Repository not found': 'Cannot access repository. Check URL and permissions.',
  'Merge conflict': 'Changes conflict with remote. Please resolve conflicts.',
  
  // Image errors
  'FILE_TOO_LARGE': 'Image file is too large (max 10 MB).',
  'INVALID_FORMAT': 'Invalid image format. Use JPG or PNG.',
  'TOO_SMALL': 'Image is too small (minimum 400x400 pixels).',
  
  // Validation errors
  'VALIDATION_ERROR': 'Please fix validation errors before saving.',
  'DUPLICATE_ID': 'Product ID already exists.',
  
  // Network errors
  'ENOTFOUND': 'Cannot connect to GitHub. Check internet connection.',
  'ETIMEDOUT': 'Connection timed out. Try again later.'
};

function getUserFriendlyError(error) {
  const code = error.code || error.message;
  
  for (const [key, message] of Object.entries(ERROR_MESSAGES)) {
    if (code.includes(key)) {
      return message;
    }
  }
  
  return `An unexpected error occurred: ${error.message}`;
}
```

---

## 🧪 Testing Requirements

### Unit Tests

**Test Product Service**:
```javascript
describe('ProductService', () => {
  test('should load products from file', async () => {
    const service = new ProductService('/test/path');
    const products = await service.loadProducts();
    expect(Array.isArray(products)).toBe(true);
  });
  
  test('should add new product with auto-generated ID', async () => {
    const service = new ProductService('/test/path');
    const product = { name: 'Test', price: 10 };
    const added = await service.addProduct(product);
    expect(added.id).toBeGreaterThan(0);
  });
  
  test('should validate product before saving', async () => {
    const product = { name: 'A' }; // Too short
    await expect(productSchema.validate(product))
      .rejects.toThrow('Name must be at least 3 characters');
  });
});
```

### Integration Tests

**Test Image Processing**:
```javascript
describe('ImageService', () => {
  test('should process and save image in 3 formats', async () => {
    const service = new ImageService('/test/path');
    const result = await service.processProductImage(testFile, 1, 'primary');
    
    expect(result).toMatch(/product-1-primary\.jpg$/);
    expect(fs.existsSync('/test/path/images/product-1-primary.webp')).toBe(true);
    expect(fs.existsSync('/test/path/images/product-1-primary.avif')).toBe(true);
  });
});
```

---

## 📦 Deployment & Distribution

### Build Configuration

**package.json**:
```json
{
  "name": "sakr-store-manager",
  "version": "1.0.0",
  "description": "GUI application for managing Sakr Store products",
  "main": "electron/main.js",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "electron:dev": "concurrently \"npm run dev\" \"wait-on http://localhost:5173 && electron .\"",
    "electron:build": "vite build && electron-builder"
  },
  "build": {
    "appId": "com.sakrstore.manager",
    "productName": "Sakr Store Manager",
    "files": [
      "dist/**/*",
      "electron/**/*",
      "package.json"
    ],
    "directories": {
      "output": "release"
    },
    "win": {
      "target": ["nsis", "portable"],
      "icon": "public/icons/icon.ico"
    },
    "mac": {
      "target": ["dmg"],
      "icon": "public/icons/icon.icns",
      "comment": "Future release - not included in initial build"
    },
    "linux": {
      "target": ["AppImage"],
      "icon": "public/icons/icon.png",
      "comment": "Future release - not included in initial build"
    }
  }
}
```

### Distribution

**Windows (Initial Release)**: 
- `.exe` installer (NSIS)
- Portable `.exe` (optional)
- Auto-updater support

**Future Platforms**:
- **macOS**: `.dmg` disk image  
- **Linux**: `.AppImage` portable app

---

## ✅ Implementation Checklist

### Phase 1: Core Functionality
- [ ] Project setup (Electron + React)
- [ ] Product list view
- [ ] Product editor form
- [ ] Add/Edit/Delete products
- [ ] Save to products.json
- [ ] Input validation

### Phase 2: Image Processing
- [ ] Image upload UI
- [ ] Image validation
- [ ] Sharp integration
- [ ] Multi-format conversion (JPG, WebP, AVIF)
- [ ] Image deletion on product delete

### Phase 3: GitHub Integration
- [ ] Settings panel
- [ ] Git configuration
- [ ] Commit & push functionality
- [ ] Conflict detection
- [ ] Auto-publish option

### Phase 4: Polish & Testing
- [ ] Error handling
- [ ] User feedback (notifications)
- [ ] Keyboard shortcuts
- [ ] Auto-save drafts
- [ ] Unit tests
- [ ] Integration tests
- [ ] User documentation

### Phase 5: Distribution
- [ ] Build configuration
- [ ] Windows installer (NSIS)
- [ ] Windows portable version
- [ ] Auto-updater
- [ ] Release documentation
- [ ] Future: macOS DMG (later version)
- [ ] Future: Linux AppImage (later version)

---

## 📚 Additional Resources

### Documentation to Include

1. **USER_GUIDE.md** - Step-by-step user manual
2. **DEVELOPER_GUIDE.md** - Code architecture and contribution guide
3. **TROUBLESHOOTING.md** - Common issues and solutions
4. **CHANGELOG.md** - Version history

### Example User Guide Sections

- Installing the application
- Setting up GitHub integration
- Adding your first product
- Uploading and managing images
- Publishing changes
- Keyboard shortcuts reference
- FAQ

---

## 🎯 Success Metrics

The application is successful if:

1. **Non-technical user can**:
   - Add a product in < 2 minutes ✓
   - Upload images without technical knowledge ✓
   - Publish to GitHub with one click ✓

2. **Technical quality**:
   - Zero data corruption or loss ✓
   - Images automatically converted to 3 formats ✓
   - Clean, maintainable codebase ✓

3. **User experience**:
   - Intuitive UI requiring no training ✓
   - Clear error messages with solutions ✓
   - Fast and responsive (< 100ms for most actions) ✓

---

**End of Specification**

This document provides comprehensive information for an AI agent to build the Sakr Store Manager application without needing to reference the original project files.

