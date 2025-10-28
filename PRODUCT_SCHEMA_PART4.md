# Product Schema - Part 4: Images & Flags

## Overview
This document defines the modern images object, legacy image field, and the isNew flag for product management.

---

## 6. images (Object, Required)

**Purpose:** Modern image management system  
**Type:** Object  
**Required:** Yes

### Structure
An object with two properties: `primary` and `gallery`.

### 6.1 images.primary (String, Required)

**Purpose:** The main product image  
**Type:** String  
**Required:** Yes  
**Format:** Relative file path (e.g., `images/filename.jpg`)

**Constraints:**
- Must not be empty
- Should be a valid relative path

**Validation:**
- Must be a non-empty string
- File existence will be checked by the image processor

**Example:**
```javascript
images: {
  primary: "images/tshirt-blue.jpg"
}
```

### 6.2 images.gallery (Array, Optional)

**Purpose:** Additional product images  
**Type:** Array of Strings  
**Required:** No  
**Default:** `[]`

**Constraints:**
- Array of file paths (strings)
- Can be an empty array `[]`
- Maximum 10 images

**Validation:**
- Must be an array
- Each element must be a string
- Length must not exceed 10

**Example:**
```javascript
images: {
  primary: "images/tshirt-blue.jpg",
  gallery: [
    "images/tshirt-blue-back.jpg",
    "images/tshirt-blue-detail.jpg"
  ]
}
```

---

## 5. image (String, Optional but Recommended)

**Purpose:** Legacy fallback image path  
**Type:** String  
**Required:** Optional (but recommended for backward compatibility)

### Auto-Population Logic

This field is **automatically managed** and should be kept in sync with `images.primary`.

**Behavior:**
- When saving a product, always set `product.image = product.images.primary`
- This ensures backward compatibility with older store versions
- No user input required

**UI Handling:**
- This field should be **hidden from the user**
- It is managed automatically by the system

**Implementation:**
```javascript
// Before saving a product
product.image = product.images.primary;
```

---

## 11. isNew (Boolean, Required)

**Purpose:** Marks product as new/featured  
**Type:** Boolean  
**Required:** Yes  
**Default:** `true` (for newly created products)

**Constraints:**
- Must be `true` or `false`

**Validation:**
- Must be a boolean value

**Behavior:**
- If `true`, a "New" badge is shown on the product card
- Helps highlight new or featured products

**UI:**
- Toggle switch or checkbox
- Label: "Mark as new/featured product"

**Example:**
```javascript
{
  isNew: true  // Shows "New" badge
}
```

---

## Default Product Object

Template object for creating new products:

```javascript
{
  id: 0,                    // Auto-generated
  name: "",
  price: 0.00,
  description: "",
  image: "",                // Auto-populated from images.primary
  images: {
    primary: "",
    gallery: []
  },
  category: "Apparel",      // Or first category in list
  discount: false,
  discountedPrice: 0.00,
  stock: 0,
  isNew: true               // New products marked as "New" by default
}
```

---

## Testing Requirements

1. **Product List Display:**
   - Update the Product List to show the "New" badge if `isNew` is `true`
   
2. **Add Product Logic:**
   - When creating the "Add Product" functionality, ensure it uses the Default Product Object as its starting point

3. **Image Sync:**
   - Verify that `product.image` is automatically set to `product.images.primary` when saving

---

## Validation Summary

| Field | Type | Required | Validation Rules |
|-------|------|----------|------------------|
| `images` | Object | Yes | Must have `primary` property |
| `images.primary` | String | Yes | Non-empty string |
| `images.gallery` | Array | No | Array of strings, max 10 items |
| `image` | String | Optional | Auto-populated from `images.primary` |
| `isNew` | Boolean | Yes | Must be boolean |

---

## Next Steps

- Implement validation logic in `productValidation.js`
- Update `productService.js` to auto-populate the `image` field
- Update `productsSlice.js` with the default product object
- Update `MainContent.jsx` to display the "New" badge
- Create test cases for Part 4 validation
