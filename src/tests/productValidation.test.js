/**
 * Product Validation Tests
 * Test suite to verify ID generation and validation logic
 */

import {
  generateNextProductId,
  validateProductId,
  validateProductName,
  validateProductPrice,
  validateProduct,
  formatPrice
} from '../services/productValidation.js';

// ==================== ID GENERATION TESTS ====================

console.log('=== ID Generation Tests ===');

// Test 1: Empty products array should return 1
const emptyProducts = [];
const firstId = generateNextProductId(emptyProducts);
console.log(`✓ Empty array: ${firstId === 1 ? 'PASS' : 'FAIL'} (Expected: 1, Got: ${firstId})`);

// Test 2: Products with sequential IDs
const sequentialProducts = [{ id: 1 }, { id: 2 }, { id: 3 }];
const nextSequentialId = generateNextProductId(sequentialProducts);
console.log(`✓ Sequential IDs: ${nextSequentialId === 4 ? 'PASS' : 'FAIL'} (Expected: 4, Got: ${nextSequentialId})`);

// Test 3: Products with gaps (deleted products)
const gappedProducts = [{ id: 1 }, { id: 3 }, { id: 5 }];
const nextGappedId = generateNextProductId(gappedProducts);
console.log(`✓ Gapped IDs: ${nextGappedId === 6 ? 'PASS' : 'FAIL'} (Expected: 6, Got: ${nextGappedId})`);

// Test 4: Null or undefined input
const nullId = generateNextProductId(null);
console.log(`✓ Null input: ${nullId === 1 ? 'PASS' : 'FAIL'} (Expected: 1, Got: ${nullId})`);

// ==================== ID VALIDATION TESTS ====================

console.log('\n=== ID Validation Tests ===');

// Valid ID
const validId = validateProductId(5, [{ id: 1 }, { id: 2 }], false);
console.log(`✓ Valid ID: ${validId.valid ? 'PASS' : 'FAIL'}`);

// Invalid: Negative ID
const negativeId = validateProductId(-1, [], false);
console.log(`✓ Negative ID: ${!negativeId.valid ? 'PASS' : 'FAIL'} (${negativeId.error})`);

// Invalid: Zero ID
const zeroId = validateProductId(0, [], false);
console.log(`✓ Zero ID: ${!zeroId.valid ? 'PASS' : 'FAIL'} (${zeroId.error})`);

// Invalid: Duplicate ID
const duplicateId = validateProductId(1, [{ id: 1 }, { id: 2 }], true);
console.log(`✓ Duplicate ID: ${!duplicateId.valid ? 'PASS' : 'FAIL'} (${duplicateId.error})`);

// ==================== NAME VALIDATION TESTS ====================

console.log('\n=== Name Validation Tests ===');

// Valid: English name
const validEnglishName = validateProductName('Chocolate Bar');
console.log(`✓ Valid English: ${validEnglishName.valid ? 'PASS' : 'FAIL'}`);

// Valid: Arabic name
const validArabicName = validateProductName('شوكولاتة');
console.log(`✓ Valid Arabic: ${validArabicName.valid ? 'PASS' : 'FAIL'}`);

// Valid: Mixed language
const validMixedName = validateProductName('Chocolate شوكولاتة');
console.log(`✓ Valid Mixed: ${validMixedName.valid ? 'PASS' : 'FAIL'}`);

// Invalid: Too short
const tooShortName = validateProductName('ab');
console.log(`✓ Too short (2 chars): ${!tooShortName.valid ? 'PASS' : 'FAIL'} (${tooShortName.error})`);

// Valid: Exactly 3 chars
const exactlyThreeName = validateProductName('abc');
console.log(`✓ Exactly 3 chars: ${exactlyThreeName.valid ? 'PASS' : 'FAIL'}`);

// Invalid: Too long (201 chars)
const tooLongName = validateProductName('a'.repeat(201));
console.log(`✓ Too long (201 chars): ${!tooLongName.valid ? 'PASS' : 'FAIL'} (${tooLongName.error})`);

// Valid: Exactly 200 chars
const exactly200Name = validateProductName('a'.repeat(200));
console.log(`✓ Exactly 200 chars: ${exactly200Name.valid ? 'PASS' : 'FAIL'}`);

// Invalid: Empty whitespace
const emptyWhitespaceName = validateProductName('   ');
console.log(`✓ Empty whitespace: ${!emptyWhitespaceName.valid ? 'PASS' : 'FAIL'} (${emptyWhitespaceName.error})`);

// Valid: Name with surrounding whitespace (should trim)
const nameWithWhitespace = validateProductName('  Product  ');
console.log(`✓ Name with whitespace: ${nameWithWhitespace.valid ? 'PASS' : 'FAIL'}`);

// ==================== PRICE VALIDATION TESTS ====================

console.log('\n=== Price Validation Tests ===');

// Valid: Standard price
const validPrice = validateProductPrice(99.99);
console.log(`✓ Valid price (99.99): ${validPrice.valid ? 'PASS' : 'FAIL'}`);

// Valid: Minimum price
const minPrice = validateProductPrice(0.01);
console.log(`✓ Minimum price (0.01): ${minPrice.valid ? 'PASS' : 'FAIL'}`);

// Valid: Maximum price
const maxPrice = validateProductPrice(999999.99);
console.log(`✓ Maximum price (999999.99): ${maxPrice.valid ? 'PASS' : 'FAIL'}`);

// Invalid: Zero price
const zeroPrice = validateProductPrice(0);
console.log(`✓ Zero price: ${!zeroPrice.valid ? 'PASS' : 'FAIL'} (${zeroPrice.error})`);

// Invalid: Negative price
const negativePrice = validateProductPrice(-10.50);
console.log(`✓ Negative price: ${!negativePrice.valid ? 'PASS' : 'FAIL'} (${negativePrice.error})`);

// Invalid: Below minimum
const belowMinPrice = validateProductPrice(0.001);
console.log(`✓ Below minimum (0.001): ${!belowMinPrice.valid ? 'PASS' : 'FAIL'} (${belowMinPrice.error})`);

// Invalid: Above maximum
const aboveMaxPrice = validateProductPrice(1000000);
console.log(`✓ Above maximum (1000000): ${!aboveMaxPrice.valid ? 'PASS' : 'FAIL'} (${aboveMaxPrice.error})`);

// Invalid: 3 decimal places
const threeDecimals = validateProductPrice(99.999);
console.log(`✓ Three decimals (99.999): ${!threeDecimals.valid ? 'PASS' : 'FAIL'} (${threeDecimals.error})`);

// Valid: 1 decimal place (acceptable, will be auto-formatted to 2 in UI)
const oneDecimal = validateProductPrice(99.9);
console.log(`✓ One decimal (99.9): ${oneDecimal.valid ? 'PASS' : 'FAIL'} (Acceptable - will format to 99.90)`);

// Valid: No decimals but mathematically 2 decimals (e.g., 10.00)
const wholeNumber = validateProductPrice(10.00);
console.log(`✓ Whole number as 2 decimals (10.00): ${wholeNumber.valid ? 'PASS' : 'FAIL'}`);

// Test formatPrice function
console.log(`✓ Format 99.9 to ${formatPrice(99.9)} (Expected: 99.90)`);
console.log(`✓ Format 10 to ${formatPrice(10)} (Expected: 10.00)`);

// ==================== COMPLETE PRODUCT VALIDATION TESTS ====================

console.log('\n=== Complete Product Validation Tests ===');

// Valid new product
const validNewProduct = {
  name: 'Test Product',
  price: 25.50
};
const newProductValidation = validateProduct(validNewProduct, [], true);
console.log(`✓ Valid new product: ${newProductValidation.valid ? 'PASS' : 'FAIL'}`);

// Invalid: Missing name
const missingNameProduct = {
  price: 25.50
};
const missingNameValidation = validateProduct(missingNameProduct, [], true);
console.log(`✓ Missing name: ${!missingNameValidation.valid ? 'PASS' : 'FAIL'} (Errors: ${JSON.stringify(missingNameValidation.errors)})`);

// Invalid: Missing price
const missingPriceProduct = {
  name: 'Test Product'
};
const missingPriceValidation = validateProduct(missingPriceProduct, [], true);
console.log(`✓ Missing price: ${!missingPriceValidation.valid ? 'PASS' : 'FAIL'} (Errors: ${JSON.stringify(missingPriceValidation.errors)})`);

// Invalid: Multiple errors
const multipleErrorsProduct = {
  name: 'ab', // Too short
  price: -5 // Negative
};
const multipleErrorsValidation = validateProduct(multipleErrorsProduct, [], true);
console.log(`✓ Multiple errors: ${!multipleErrorsValidation.valid ? 'PASS' : 'FAIL'} (Errors: ${JSON.stringify(multipleErrorsValidation.errors)})`);

// Valid existing product with ID
const validExistingProduct = {
  id: 1,
  name: 'Existing Product',
  price: 50.00
};
const existingProductValidation = validateProduct(validExistingProduct, [{ id: 1 }], false);
console.log(`✓ Valid existing product: ${existingProductValidation.valid ? 'PASS' : 'FAIL'}`);

console.log('\n=== All Tests Complete ===');
