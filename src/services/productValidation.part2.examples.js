/**
 * Product Validation Examples - Part 2
 * Examples demonstrating description and category validation
 */

import {
  validateProductDescription,
  validateProductCategory,
  truncateText,
  getCategoriesFromProducts,
  validateProduct
} from '../services/productValidation.js';

console.log('=== Part 2: Description & Category Examples ===\n');

// ==================== DESCRIPTION EXAMPLES ====================

console.log('--- Description Validation Examples ---\n');

// Example 1: Valid product description
const description1 = 'Premium chocolate bar made with 70% cocoa from Ecuador. Rich, smooth flavor with hints of vanilla and caramel.';
const desc1Result = validateProductDescription(description1);
console.log('Example 1: Valid description');
console.log(`Description: "${description1}"`);
console.log(`Valid: ${desc1Result.valid}`);
console.log(`Character count: ${description1.length}/1000\n`);

// Example 2: Multiline description (Arabic + English)
const description2 = `شوكولاتة فاخرة
Premium Chocolate Bar

Made with organic cocoa beans from Ecuador.
صنع من حبوب الكاكاو العضوية من الإكوادور.

Perfect for chocolate lovers!`;

const desc2Result = validateProductDescription(description2);
console.log('Example 2: Multiline mixed language');
console.log(`Description:\n${description2}`);
console.log(`Valid: ${desc2Result.valid}`);
console.log(`Character count: ${description2.length}/1000\n`);

// Example 3: Too short description (validation error)
const description3 = 'Tasty!';
const desc3Result = validateProductDescription(description3);
console.log('Example 3: Too short (validation error)');
console.log(`Description: "${description3}"`);
console.log(`Valid: ${desc3Result.valid}`);
console.log(`Error: ${desc3Result.error}`);
console.log(`Character count: ${description3.trim().length} (minimum is 10)\n`);

// Example 4: Maximum length description
const description4 = 'A'.repeat(1000); // Exactly 1000 characters
const desc4Result = validateProductDescription(description4);
console.log('Example 4: Maximum length (1000 chars)');
console.log(`Description: "${description4.substring(0, 50)}..." (truncated for display)`);
console.log(`Valid: ${desc4Result.valid}`);
console.log(`Character count: ${description4.length}/1000\n`);

// ==================== CATEGORY EXAMPLES ====================

console.log('\n--- Category Validation Examples ---\n');

// Example 1: Standard category
const category1 = 'Electronics';
const cat1Result = validateProductCategory(category1);
console.log('Example 1: Standard category');
console.log(`Category: "${category1}"`);
console.log(`Valid: ${cat1Result.valid}\n`);

// Example 2: Custom category with spaces
const category2 = 'Kitchen Appliances';
const cat2Result = validateProductCategory(category2);
console.log('Example 2: Custom category with spaces');
console.log(`Category: "${category2}"`);
console.log(`Valid: ${cat2Result.valid}\n`);

// Example 3: Arabic category
const category3 = 'إلكترونيات';
const cat3Result = validateProductCategory(category3);
console.log('Example 3: Arabic category');
console.log(`Category: "${category3}"`);
console.log(`Valid: ${cat3Result.valid}\n`);

// Example 4: Too short (validation error)
const category4 = 'A';
const cat4Result = validateProductCategory(category4);
console.log('Example 4: Too short (validation error)');
console.log(`Category: "${category4}"`);
console.log(`Valid: ${cat4Result.valid}`);
console.log(`Error: ${cat4Result.error}\n`);

// ==================== TRUNCATE TEXT EXAMPLES ====================

console.log('\n--- Truncate Text Examples ---\n');

// Example 1: Truncate for product card (default 50 chars)
const longDesc = 'This is a premium product with excellent features and amazing quality that exceeds expectations.';
const truncated = truncateText(longDesc);
console.log('Example 1: Truncate for product card (default 50)');
console.log(`Original: "${longDesc}"`);
console.log(`Truncated: "${truncated}"`);
console.log(`Original length: ${longDesc.length}, Truncated length: ${truncated.length}\n`);

// Example 2: Custom truncation length (100 chars)
const truncated100 = truncateText(longDesc, 100);
console.log('Example 2: Custom truncation (100 chars)');
console.log(`Truncated: "${truncated100}"`);
console.log(`Length: ${truncated100.length}\n`);

// Example 3: Short text (no truncation needed)
const shortDesc = 'Great product!';
const notTruncated = truncateText(shortDesc);
console.log('Example 3: Short text (no truncation)');
console.log(`Original: "${shortDesc}"`);
console.log(`Result: "${notTruncated}"`);
console.log(`No truncation occurred: ${shortDesc === notTruncated}\n`);

// ==================== GET CATEGORIES EXAMPLES ====================

console.log('\n--- Get Categories from Products Examples ---\n');

// Example 1: Extract categories from product list
const sampleProducts = [
  { id: 1, name: 'Laptop', category: 'Electronics' },
  { id: 2, name: 'T-Shirt', category: 'Clothing' },
  { id: 3, name: 'Coffee Maker', category: 'Kitchen Appliances' },
  { id: 4, name: 'Smartphone', category: 'Electronics' },
  { id: 5, name: 'Jeans', category: 'Clothing' },
  { id: 6, name: 'Blender', category: 'Kitchen Appliances' },
  { id: 7, name: 'Headphones', category: 'Electronics' },
  { id: 8, name: 'Novel', category: 'Books' }
];

const categories = getCategoriesFromProducts(sampleProducts);
console.log('Example 1: Extract unique categories');
console.log(`Products: ${sampleProducts.length}`);
console.log(`Unique categories: ${categories.length}`);
console.log(`Categories: ${JSON.stringify(categories, null, 2)}`);
console.log(`Sorted alphabetically: ${categories.every((cat, i) => i === 0 || cat >= categories[i - 1])}\n`);

// Example 2: Category counts for UI
console.log('Example 2: Category counts for sidebar/filter UI');
categories.forEach(category => {
  const count = sampleProducts.filter(p => p.category === category).length;
  console.log(`  ${category}: ${count} products`);
});
console.log();

// ==================== COMPLETE PRODUCT VALIDATION ====================

console.log('\n--- Complete Product Validation (with Description & Category) ---\n');

// Example 1: Valid product with all fields
const validProduct = {
  name: 'Premium Chocolate Bar',
  price: 25.99,
  description: 'Handcrafted chocolate bar made with 70% organic cocoa from Ecuador. Rich flavor with hints of vanilla and sea salt.',
  category: 'Food & Beverages'
};

const validResult = validateProduct(validProduct, [], true);
console.log('Example 1: Valid complete product');
console.log(JSON.stringify(validProduct, null, 2));
console.log(`Valid: ${validResult.valid}`);
console.log(`Errors: ${JSON.stringify(validResult.errors)}\n`);

// Example 2: Invalid product (missing fields)
const invalidProduct1 = {
  name: 'Product',
  price: 10.00
  // Missing description and category
};

const invalidResult1 = validateProduct(invalidProduct1, [], true);
console.log('Example 2: Invalid product (missing description and category)');
console.log(JSON.stringify(invalidProduct1, null, 2));
console.log(`Valid: ${invalidResult1.valid}`);
console.log(`Errors: ${JSON.stringify(invalidResult1.errors, null, 2)}\n`);

// Example 3: Invalid product (invalid fields)
const invalidProduct2 = {
  name: 'Test Product',
  price: 15.50,
  description: 'Too short', // Less than 10 chars
  category: 'A' // Less than 2 chars
};

const invalidResult2 = validateProduct(invalidProduct2, [], true);
console.log('Example 3: Invalid product (field validation errors)');
console.log(JSON.stringify(invalidProduct2, null, 2));
console.log(`Valid: ${invalidResult2.valid}`);
console.log(`Errors: ${JSON.stringify(invalidResult2.errors, null, 2)}\n`);

// ==================== REAL-WORLD USE CASE ====================

console.log('\n--- Real-World Use Case: Product Form Validation ---\n');

// Simulating user input from a product form
function validateProductForm(formData) {
  console.log('Validating product form...');
  console.log(`Input: ${JSON.stringify(formData, null, 2)}\n`);
  
  const result = validateProduct(formData, [], true);
  
  if (result.valid) {
    console.log('✅ Product is valid! Ready to save.');
  } else {
    console.log('❌ Product validation failed:');
    Object.entries(result.errors).forEach(([field, error]) => {
      console.log(`  - ${field}: ${error}`);
    });
  }
  
  return result;
}

// Test 1: Valid form submission
console.log('Test 1: Valid form submission');
validateProductForm({
  name: 'Wireless Mouse',
  price: 29.99,
  description: 'Ergonomic wireless mouse with adjustable DPI settings. Perfect for gaming and productivity.',
  category: 'Computer Accessories'
});

console.log('\n' + '='.repeat(60) + '\n');

// Test 2: Invalid form submission
console.log('Test 2: Invalid form submission (multiple errors)');
validateProductForm({
  name: 'AB', // Too short
  price: -5, // Negative
  description: 'Bad desc', // Too short
  category: 'X' // Too short
});

console.log('\n=== Examples Complete ===');
