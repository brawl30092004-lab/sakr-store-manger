/**
 * Product Validation Examples - Part 4: Images & Flags
 * Demonstrates validation for images object, legacy image field, and isNew flag
 */

import {
  validateProductImages,
  validateProductImagePrimary,
  validateProductImageGallery,
  validateProductIsNew
} from './productValidation.js';

// ============================================
// IMAGES OBJECT VALIDATION EXAMPLES
// ============================================

console.log('=== IMAGES OBJECT VALIDATION ===\n');

// ✅ Valid: Complete images object with primary and gallery
const validImages1 = {
  primary: "images/tshirt-blue.jpg",
  gallery: ["images/tshirt-blue-back.jpg", "images/tshirt-blue-detail.jpg"]
};
console.log('Valid images with gallery:', validateProductImages(validImages1));
// Expected: { valid: true, error: null }

// ✅ Valid: Images object with only primary (empty gallery)
const validImages2 = {
  primary: "images/hoodie-red.jpg",
  gallery: []
};
console.log('Valid images without gallery:', validateProductImages(validImages2));
// Expected: { valid: true, error: null }

// ✅ Valid: Images object without gallery property
const validImages3 = {
  primary: "images/jeans-black.jpg"
};
console.log('Valid images (gallery omitted):', validateProductImages(validImages3));
// Expected: { valid: true, error: null }

// ❌ Invalid: Not an object
const invalidImages1 = "images/product.jpg";
console.log('Invalid (not an object):', validateProductImages(invalidImages1));
// Expected: { valid: false, error: 'Images must be an object' }

// ❌ Invalid: Missing primary property
const invalidImages2 = {
  gallery: ["images/photo1.jpg"]
};
console.log('Invalid (missing primary):', validateProductImages(invalidImages2));
// Expected: { valid: false, error: 'Images object must have a primary property' }

// ❌ Invalid: Empty primary
const invalidImages3 = {
  primary: "",
  gallery: []
};
console.log('Invalid (empty primary):', validateProductImages(invalidImages3));
// Expected: { valid: false, error: 'Primary image cannot be empty' }

console.log('\n');

// ============================================
// PRIMARY IMAGE VALIDATION EXAMPLES
// ============================================

console.log('=== PRIMARY IMAGE VALIDATION ===\n');

// ✅ Valid: Standard file path
const validPrimary1 = "images/products/laptop.jpg";
console.log('Valid primary (standard path):', validateProductImagePrimary(validPrimary1));
// Expected: { valid: true, error: null }

// ✅ Valid: Relative path
const validPrimary2 = "assets/img/phone.png";
console.log('Valid primary (relative path):', validateProductImagePrimary(validPrimary2));
// Expected: { valid: true, error: null }

// ❌ Invalid: Not a string
const invalidPrimary1 = 12345;
console.log('Invalid primary (not a string):', validateProductImagePrimary(invalidPrimary1));
// Expected: { valid: false, error: 'Primary image must be a string' }

// ❌ Invalid: Empty string
const invalidPrimary2 = "";
console.log('Invalid primary (empty string):', validateProductImagePrimary(invalidPrimary2));
// Expected: { valid: false, error: 'Primary image cannot be empty' }

// ❌ Invalid: Whitespace only
const invalidPrimary3 = "   ";
console.log('Invalid primary (whitespace):', validateProductImagePrimary(invalidPrimary3));
// Expected: { valid: false, error: 'Primary image cannot be empty' }

console.log('\n');

// ============================================
// GALLERY VALIDATION EXAMPLES
// ============================================

console.log('=== GALLERY VALIDATION ===\n');

// ✅ Valid: Empty gallery
const validGallery1 = [];
console.log('Valid gallery (empty):', validateProductImageGallery(validGallery1));
// Expected: { valid: true, error: null }

// ✅ Valid: Gallery with multiple images
const validGallery2 = [
  "images/product-front.jpg",
  "images/product-back.jpg",
  "images/product-side.jpg"
];
console.log('Valid gallery (3 images):', validateProductImageGallery(validGallery2));
// Expected: { valid: true, error: null }

// ✅ Valid: Gallery with max 10 images
const validGallery3 = [
  "img1.jpg", "img2.jpg", "img3.jpg", "img4.jpg", "img5.jpg",
  "img6.jpg", "img7.jpg", "img8.jpg", "img9.jpg", "img10.jpg"
];
console.log('Valid gallery (10 images):', validateProductImageGallery(validGallery3));
// Expected: { valid: true, error: null }

// ❌ Invalid: Not an array
const invalidGallery1 = "images/photo.jpg";
console.log('Invalid gallery (not an array):', validateProductImageGallery(invalidGallery1));
// Expected: { valid: false, error: 'Gallery must be an array' }

// ❌ Invalid: More than 10 images
const invalidGallery2 = [
  "img1.jpg", "img2.jpg", "img3.jpg", "img4.jpg", "img5.jpg",
  "img6.jpg", "img7.jpg", "img8.jpg", "img9.jpg", "img10.jpg",
  "img11.jpg"
];
console.log('Invalid gallery (11 images):', validateProductImageGallery(invalidGallery2));
// Expected: { valid: false, error: 'Gallery cannot exceed 10 images' }

// ❌ Invalid: Array contains non-string
const invalidGallery3 = ["img1.jpg", 123, "img3.jpg"];
console.log('Invalid gallery (non-string element):', validateProductImageGallery(invalidGallery3));
// Expected: { valid: false, error: 'Gallery image at index 1 must be a string' }

console.log('\n');

// ============================================
// isNew FLAG VALIDATION EXAMPLES
// ============================================

console.log('=== isNew FLAG VALIDATION ===\n');

// ✅ Valid: true
const validIsNew1 = true;
console.log('Valid isNew (true):', validateProductIsNew(validIsNew1));
// Expected: { valid: true, error: null }

// ✅ Valid: false
const validIsNew2 = false;
console.log('Valid isNew (false):', validateProductIsNew(validIsNew2));
// Expected: { valid: true, error: null }

// ❌ Invalid: String "true"
const invalidIsNew1 = "true";
console.log('Invalid isNew (string):', validateProductIsNew(invalidIsNew1));
// Expected: { valid: false, error: 'isNew must be a boolean (true or false)' }

// ❌ Invalid: Number 1
const invalidIsNew2 = 1;
console.log('Invalid isNew (number):', validateProductIsNew(invalidIsNew2));
// Expected: { valid: false, error: 'isNew must be a boolean (true or false)' }

// ❌ Invalid: Undefined
const invalidIsNew3 = undefined;
console.log('Invalid isNew (undefined):', validateProductIsNew(invalidIsNew3));
// Expected: { valid: false, error: 'isNew must be a boolean (true or false)' }

console.log('\n');

// ============================================
// COMPLETE PRODUCT EXAMPLES WITH PART 4 FIELDS
// ============================================

console.log('=== COMPLETE PRODUCT EXAMPLES ===\n');

// ✅ Example 1: New product with images
const newProduct = {
  id: 1,
  name: "Blue Cotton T-Shirt",
  price: 299.99,
  description: "Comfortable cotton t-shirt perfect for casual wear",
  image: "images/tshirt-blue.jpg", // Auto-populated
  images: {
    primary: "images/tshirt-blue.jpg",
    gallery: [
      "images/tshirt-blue-back.jpg",
      "images/tshirt-blue-detail.jpg"
    ]
  },
  category: "Apparel",
  discount: false,
  discountedPrice: 299.99,
  stock: 50,
  isNew: true // Marked as new
};
console.log('New Product Example:', JSON.stringify(newProduct, null, 2));

// ✅ Example 2: Regular product without gallery
const regularProduct = {
  id: 2,
  name: "Classic Black Jeans",
  price: 499.00,
  description: "Timeless black jeans that go with everything",
  image: "images/jeans-black.jpg", // Auto-populated
  images: {
    primary: "images/jeans-black.jpg",
    gallery: []
  },
  category: "Apparel",
  discount: true,
  discountedPrice: 399.00,
  stock: 25,
  isNew: false // Not marked as new
};
console.log('\nRegular Product Example:', JSON.stringify(regularProduct, null, 2));

// ✅ Example 3: Default product object (template for new products)
const defaultProduct = {
  id: 0,                    // Will be auto-generated
  name: "",
  price: 0.00,
  description: "",
  image: "",                // Auto-populated from images.primary
  images: {
    primary: "",
    gallery: []
  },
  category: "Apparel",      // Or the first category in the list
  discount: false,
  discountedPrice: 0.00,
  stock: 0,
  isNew: true               // New products are marked as "New" by default
};
console.log('\nDefault Product Template:', JSON.stringify(defaultProduct, null, 2));

console.log('\n=== END OF PART 4 EXAMPLES ===');
