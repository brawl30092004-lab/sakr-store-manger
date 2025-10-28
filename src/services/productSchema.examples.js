/**
 * Product Schema Validation - Usage Examples
 * Demonstrates how to use Yup validation in real scenarios
 */

import {
  validateProductYup,
  validateProductYupSync,
  validateProductWithDetails,
  isProductValid
} from './productSchema.js';

// ============================================
// EXAMPLE 1: Basic Validation
// ============================================

console.log('=== EXAMPLE 1: Basic Validation ===\n');

const product1 = {
  id: 1,
  name: "Blue Cotton T-Shirt",
  price: 299.99,
  description: "Comfortable cotton t-shirt perfect for casual wear. Made from organic cotton.",
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

validateProductYup(product1).then(result => {
  if (result.valid) {
    console.log('✅ Product 1 is valid!');
  } else {
    console.log('❌ Product 1 has errors:', result.errors);
  }
});

// ============================================
// EXAMPLE 2: Catching Validation Errors
// ============================================

console.log('\n=== EXAMPLE 2: Catching Validation Errors ===\n');

const invalidProduct = {
  id: 2,
  name: "AB", // Too short!
  price: -50, // Negative!
  description: "Short", // Too short!
  category: "A", // Too short!
  discount: true,
  discountedPrice: 100, // Greater than price!
  stock: -10, // Negative!
  isNew: false,
  images: {
    primary: "", // Empty!
    gallery: []
  },
  image: ""
};

validateProductYup(invalidProduct).then(result => {
  console.log('Validation result:', result.valid);
  console.log('Errors found:');
  result.errors.forEach((error, index) => {
    console.log(`  ${index + 1}. ${error}`);
  });
});

// ============================================
// EXAMPLE 3: Field-Specific Errors for Forms
// ============================================

console.log('\n=== EXAMPLE 3: Field-Specific Errors ===\n');

validateProductWithDetails(invalidProduct).then(result => {
  console.log('Field errors:');
  Object.keys(result.errors).forEach(field => {
    console.log(`  - ${field}: ${result.errors[field]}`);
  });
});

// ============================================
// EXAMPLE 4: Quick Boolean Check
// ============================================

console.log('\n=== EXAMPLE 4: Quick Boolean Check ===\n');

isProductValid(product1).then(valid => {
  console.log(`Product 1 is ${valid ? 'valid ✅' : 'invalid ❌'}`);
});

isProductValid(invalidProduct).then(valid => {
  console.log(`Invalid product is ${valid ? 'valid ✅' : 'invalid ❌'}`);
});

// ============================================
// EXAMPLE 5: Synchronous Validation
// ============================================

console.log('\n=== EXAMPLE 5: Synchronous Validation ===\n');

const result = validateProductYupSync(product1);
console.log('Sync validation result:', result.valid);

// ============================================
// EXAMPLE 6: Discount Price Validation
// ============================================

console.log('\n=== EXAMPLE 6: Discount Price Validation ===\n');

const discountProduct = {
  id: 3,
  name: "Red Hoodie",
  price: 599.00,
  description: "Warm and comfortable hoodie for cold weather.",
  category: "Apparel",
  discount: true,
  discountedPrice: 449.00, // Less than price ✅
  stock: 25,
  isNew: false,
  images: {
    primary: "images/hoodie-red.jpg",
    gallery: []
  },
  image: "images/hoodie-red.jpg"
};

validateProductYup(discountProduct).then(result => {
  console.log('Discount product validation:', result.valid ? '✅ Valid' : '❌ Invalid');
  if (!result.valid) {
    console.log('Errors:', result.errors);
  }
});

// Invalid discount price (equal to regular price)
const invalidDiscountProduct = {
  ...discountProduct,
  discountedPrice: 599.00 // Equal to price ❌
};

validateProductYup(invalidDiscountProduct).then(result => {
  console.log('\nInvalid discount (equal price):', result.valid ? '✅ Valid' : '❌ Invalid');
  if (!result.valid) {
    console.log('Errors:', result.errors);
  }
});

// ============================================
// EXAMPLE 7: Gallery Validation
// ============================================

console.log('\n=== EXAMPLE 7: Gallery Validation ===\n');

const productWithGallery = {
  id: 4,
  name: "Black Jeans",
  price: 499.50,
  description: "Classic black jeans that go with everything.",
  category: "Apparel",
  discount: false,
  discountedPrice: 499.50,
  stock: 30,
  isNew: false,
  images: {
    primary: "images/jeans-black.jpg",
    gallery: [
      "images/jeans-black-front.jpg",
      "images/jeans-black-back.jpg",
      "images/jeans-black-side.jpg",
      "images/jeans-black-detail.jpg"
    ]
  },
  image: "images/jeans-black.jpg"
};

validateProductYup(productWithGallery).then(result => {
  console.log('Product with gallery:', result.valid ? '✅ Valid' : '❌ Invalid');
});

// Too many gallery images (> 10)
const tooManyImages = {
  ...productWithGallery,
  images: {
    primary: "images/jeans-black.jpg",
    gallery: Array(11).fill("image.jpg") // 11 images ❌
  }
};

validateProductYup(tooManyImages).then(result => {
  console.log('Too many gallery images:', result.valid ? '✅ Valid' : '❌ Invalid');
  if (!result.valid) {
    console.log('Errors:', result.errors);
  }
});

// ============================================
// EXAMPLE 8: Edge Cases
// ============================================

console.log('\n=== EXAMPLE 8: Edge Cases ===\n');

// Minimum valid values
const minProduct = {
  id: 1,
  name: "ABC", // Exactly 3 chars
  price: 0.01, // Minimum price
  description: "1234567890", // Exactly 10 chars
  category: "AB", // Exactly 2 chars
  discount: false,
  discountedPrice: 0.01,
  stock: 0, // Out of stock is valid
  isNew: false,
  images: {
    primary: "i", // Single character is valid
    gallery: []
  },
  image: "i"
};

validateProductYup(minProduct).then(result => {
  console.log('Minimum valid product:', result.valid ? '✅ Valid' : '❌ Invalid');
  if (!result.valid) {
    console.log('Errors:', result.errors);
  }
});

// Maximum valid values
const maxProduct = {
  id: 999999,
  name: "A".repeat(200), // Exactly 200 chars
  price: 999999.99, // Maximum price
  description: "A".repeat(1000), // Exactly 1000 chars
  category: "A".repeat(50), // Exactly 50 chars
  discount: false,
  discountedPrice: 999999.99,
  stock: 9999, // Maximum stock
  isNew: true,
  images: {
    primary: "images/product.jpg",
    gallery: Array(10).fill("image.jpg") // Exactly 10 images
  },
  image: "images/product.jpg"
};

validateProductYup(maxProduct).then(result => {
  console.log('Maximum valid product:', result.valid ? '✅ Valid' : '❌ Invalid');
  if (!result.valid) {
    console.log('Errors:', result.errors);
  }
});

// ============================================
// EXAMPLE 9: Real-World Usage in Form
// ============================================

console.log('\n=== EXAMPLE 9: Form Validation Pattern ===\n');

async function handleFormSubmit(formData) {
  console.log('Submitting form data...');
  
  // Validate with detailed errors for form fields
  const result = await validateProductWithDetails(formData);
  
  if (!result.valid) {
    console.log('❌ Form validation failed!');
    console.log('Field errors:');
    
    // Set errors for each field
    Object.keys(result.errors).forEach(field => {
      console.log(`  - ${field}: ${result.errors[field]}`);
      // In real app: setFieldError(field, result.errors[field])
    });
    
    return false;
  }
  
  console.log('✅ Form is valid! Submitting...');
  // In real app: await submitProduct(formData)
  return true;
}

// Test form submission
handleFormSubmit(product1);
handleFormSubmit(invalidProduct);

// ============================================
// EXAMPLE 10: Integration with ProductService
// ============================================

console.log('\n=== EXAMPLE 10: ProductService Integration ===\n');

class ProductServiceWithYup {
  async addProduct(product) {
    console.log('Adding product...');
    
    // Validate before adding
    const result = await validateProductYup(product);
    
    if (!result.valid) {
      const errorMsg = `Validation failed: ${result.errors.join(', ')}`;
      console.log(`❌ ${errorMsg}`);
      throw new Error(errorMsg);
    }
    
    console.log('✅ Product validated successfully!');
    // In real app: Save to products.json
    return product;
  }
  
  async updateProduct(id, product) {
    console.log(`Updating product ${id}...`);
    
    // Quick validation check
    if (!await isProductValid(product)) {
      console.log('❌ Product validation failed!');
      throw new Error('Invalid product data');
    }
    
    console.log('✅ Product updated successfully!');
    // In real app: Update in products.json
    return product;
  }
}

const service = new ProductServiceWithYup();

// Test service methods
service.addProduct(product1).catch(err => console.error(err.message));
service.addProduct(invalidProduct).catch(err => console.error(err.message));

console.log('\n=== All Examples Complete ===');
