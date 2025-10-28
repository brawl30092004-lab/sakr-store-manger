/**
 * Product Validation Tests
 * Test suite to verify ID generation and validation logic
 */

import {
  generateNextProductId,
  validateProductId,
  validateProductName,
  validateProductPrice,
  validateProductDescription,
  validateProductCategory,
  validateProductDiscount,
  validateProductDiscountedPrice,
  validateProductStock,
  validateProduct,
  formatPrice,
  truncateText,
  getCategoriesFromProducts,
  getStockStatus
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

// ==================== DESCRIPTION VALIDATION TESTS ====================

console.log('\n=== Description Validation Tests ===');

// Valid: Standard description
const validDescription = validateProductDescription('This is a great product that everyone should buy.');
console.log(`✓ Valid description: ${validDescription.valid ? 'PASS' : 'FAIL'}`);

// Valid: Minimum length (10 chars)
const minDescription = validateProductDescription('Ten chars!');
console.log(`✓ Minimum length (10 chars): ${minDescription.valid ? 'PASS' : 'FAIL'}`);

// Invalid: Too short (9 chars after trim)
const tooShortDesc = validateProductDescription('  Short  ');
console.log(`✓ Too short (< 10 chars): ${!tooShortDesc.valid ? 'PASS' : 'FAIL'} (${tooShortDesc.error})`);

// Valid: Maximum length (1000 chars)
const maxDescription = validateProductDescription('a'.repeat(1000));
console.log(`✓ Maximum length (1000 chars): ${maxDescription.valid ? 'PASS' : 'FAIL'}`);

// Invalid: Too long (1001 chars)
const tooLongDesc = validateProductDescription('a'.repeat(1001));
console.log(`✓ Too long (1001 chars): ${!tooLongDesc.valid ? 'PASS' : 'FAIL'} (${tooLongDesc.error})`);

// Valid: Multiline description
const multilineDesc = validateProductDescription('Line 1\nLine 2\nLine 3 with enough text');
console.log(`✓ Multiline description: ${multilineDesc.valid ? 'PASS' : 'FAIL'}`);

// Valid: Mixed English/Arabic
const mixedDesc = validateProductDescription('This product منتج رائع is amazing!');
console.log(`✓ Mixed English/Arabic: ${mixedDesc.valid ? 'PASS' : 'FAIL'}`);

// Invalid: Not a string
const notStringDesc = validateProductDescription(12345);
console.log(`✓ Not a string: ${!notStringDesc.valid ? 'PASS' : 'FAIL'} (${notStringDesc.error})`);

// ==================== CATEGORY VALIDATION TESTS ====================

console.log('\n=== Category Validation Tests ===');

// Valid: Standard category
const validCategory = validateProductCategory('Electronics');
console.log(`✓ Valid category: ${validCategory.valid ? 'PASS' : 'FAIL'}`);

// Valid: Minimum length (2 chars)
const minCategory = validateProductCategory('TV');
console.log(`✓ Minimum length (2 chars): ${minCategory.valid ? 'PASS' : 'FAIL'}`);

// Invalid: Too short (1 char)
const tooShortCat = validateProductCategory('A');
console.log(`✓ Too short (1 char): ${!tooShortCat.valid ? 'PASS' : 'FAIL'} (${tooShortCat.error})`);

// Valid: Maximum length (50 chars)
const maxCategory = validateProductCategory('a'.repeat(50));
console.log(`✓ Maximum length (50 chars): ${maxCategory.valid ? 'PASS' : 'FAIL'}`);

// Invalid: Too long (51 chars)
const tooLongCat = validateProductCategory('a'.repeat(51));
console.log(`✓ Too long (51 chars): ${!tooLongCat.valid ? 'PASS' : 'FAIL'} (${tooLongCat.error})`);

// Valid: Case sensitive test
const upperCaseCategory = validateProductCategory('ELECTRONICS');
console.log(`✓ Uppercase category: ${upperCaseCategory.valid ? 'PASS' : 'FAIL'}`);

// Valid: Custom category
const customCategory = validateProductCategory('My Custom Category');
console.log(`✓ Custom category: ${customCategory.valid ? 'PASS' : 'FAIL'}`);

// Invalid: Not a string
const notStringCat = validateProductCategory(123);
console.log(`✓ Not a string: ${!notStringCat.valid ? 'PASS' : 'FAIL'} (${notStringCat.error})`);

// ==================== TRUNCATE TEXT TESTS ====================

console.log('\n=== Truncate Text Tests ===');

// Test default truncation (50 chars)
const longText = 'This is a very long text that should be truncated at 50 characters';
const truncated50 = truncateText(longText);
console.log(`✓ Default truncation (50): ${truncated50 === 'This is a very long text that should be truncat...' ? 'PASS' : 'FAIL'}`);
console.log(`  Result: "${truncated50}"`);

// Test custom truncation (20 chars)
const truncated20 = truncateText(longText, 20);
console.log(`✓ Custom truncation (20): ${truncated20 === 'This is a very long ...' ? 'PASS' : 'FAIL'}`);
console.log(`  Result: "${truncated20}"`);

// Test short text (no truncation)
const shortText = 'Short';
const notTruncated = truncateText(shortText);
console.log(`✓ Short text (no truncation): ${notTruncated === 'Short' ? 'PASS' : 'FAIL'}`);

// Test exact length
const exactLengthText = 'a'.repeat(50);
const exactTruncated = truncateText(exactLengthText);
console.log(`✓ Exact length (50): ${exactTruncated === exactLengthText ? 'PASS' : 'FAIL'}`);

// Test non-string input
const nonStringTruncated = truncateText(null);
console.log(`✓ Non-string input: ${nonStringTruncated === '' ? 'PASS' : 'FAIL'}`);

// ==================== GET CATEGORIES TESTS ====================

console.log('\n=== Get Categories from Products Tests ===');

// Test with valid products
const testProducts = [
  { id: 1, name: 'Product 1', category: 'Electronics' },
  { id: 2, name: 'Product 2', category: 'Clothing' },
  { id: 3, name: 'Product 3', category: 'Electronics' },
  { id: 4, name: 'Product 4', category: 'Food' },
  { id: 5, name: 'Product 5', category: 'Clothing' }
];
const categories = getCategoriesFromProducts(testProducts);
console.log(`✓ Extract unique categories: ${categories.length === 3 ? 'PASS' : 'FAIL'}`);
console.log(`  Categories: ${JSON.stringify(categories)}`);

// Test sorting
const isSorted = categories.every((cat, i) => i === 0 || cat >= categories[i - 1]);
console.log(`✓ Categories sorted: ${isSorted ? 'PASS' : 'FAIL'}`);

// Test with empty array
const emptyCategories = getCategoriesFromProducts([]);
console.log(`✓ Empty array: ${emptyCategories.length === 0 ? 'PASS' : 'FAIL'}`);

// Test with products missing category field
const missingCategoryProducts = [
  { id: 1, name: 'Product 1' },
  { id: 2, name: 'Product 2', category: 'Electronics' }
];
const partialCategories = getCategoriesFromProducts(missingCategoryProducts);
console.log(`✓ Missing category field: ${partialCategories.length === 1 && partialCategories[0] === 'Electronics' ? 'PASS' : 'FAIL'}`);

// ==================== DISCOUNT VALIDATION TESTS ====================

console.log('\n=== Discount Validation Tests ===');

// Valid: true
const validDiscountTrue = validateProductDiscount(true);
console.log(`✓ Valid discount (true): ${validDiscountTrue.valid ? 'PASS' : 'FAIL'}`);

// Valid: false
const validDiscountFalse = validateProductDiscount(false);
console.log(`✓ Valid discount (false): ${validDiscountFalse.valid ? 'PASS' : 'FAIL'}`);

// Invalid: not a boolean (string)
const invalidDiscountString = validateProductDiscount('true');
console.log(`✓ Invalid discount (string): ${!invalidDiscountString.valid ? 'PASS' : 'FAIL'} (${invalidDiscountString.error})`);

// Invalid: not a boolean (number)
const invalidDiscountNumber = validateProductDiscount(1);
console.log(`✓ Invalid discount (number): ${!invalidDiscountNumber.valid ? 'PASS' : 'FAIL'} (${invalidDiscountNumber.error})`);

// ==================== DISCOUNTED PRICE VALIDATION TESTS ====================

console.log('\n=== Discounted Price Validation Tests ===');

// Valid: discounted price less than regular price (discount = true)
const validDiscountedPrice = validateProductDiscountedPrice(19.99, 25.99, true);
console.log(`✓ Valid discounted price (19.99 < 25.99): ${validDiscountedPrice.valid ? 'PASS' : 'FAIL'}`);

// Valid: discounted price when discount = false (no comparison needed)
const validDiscountedPriceFalse = validateProductDiscountedPrice(25.99, 25.99, false);
console.log(`✓ Valid discounted price (discount=false): ${validDiscountedPriceFalse.valid ? 'PASS' : 'FAIL'}`);

// Invalid: discounted price >= regular price when discount = true
const invalidDiscountedPriceHigh = validateProductDiscountedPrice(25.99, 25.99, true);
console.log(`✓ Invalid discounted price (25.99 >= 25.99): ${!invalidDiscountedPriceHigh.valid ? 'PASS' : 'FAIL'} (${invalidDiscountedPriceHigh.error})`);

// Invalid: discounted price > regular price
const invalidDiscountedPriceHigher = validateProductDiscountedPrice(30.00, 25.99, true);
console.log(`✓ Invalid discounted price (30.00 > 25.99): ${!invalidDiscountedPriceHigher.valid ? 'PASS' : 'FAIL'} (${invalidDiscountedPriceHigher.error})`);

// Invalid: negative price
const negativeDiscountedPrice = validateProductDiscountedPrice(-10.00, 25.99, true);
console.log(`✓ Negative discounted price: ${!negativeDiscountedPrice.valid ? 'PASS' : 'FAIL'} (${negativeDiscountedPrice.error})`);

// Invalid: zero price
const zeroDiscountedPrice = validateProductDiscountedPrice(0, 25.99, true);
console.log(`✓ Zero discounted price: ${!zeroDiscountedPrice.valid ? 'PASS' : 'FAIL'} (${zeroDiscountedPrice.error})`);

// Invalid: more than 2 decimal places
const threeDecimalsDiscounted = validateProductDiscountedPrice(19.999, 25.99, true);
console.log(`✓ Three decimals (19.999): ${!threeDecimalsDiscounted.valid ? 'PASS' : 'FAIL'} (${threeDecimalsDiscounted.error})`);

// Valid: exactly 2 decimal places
const twoDecimalsDiscounted = validateProductDiscountedPrice(19.99, 25.99, true);
console.log(`✓ Two decimals (19.99): ${twoDecimalsDiscounted.valid ? 'PASS' : 'FAIL'}`);

// Valid: 1 decimal place (19.9 = 19.90)
const oneDecimalDiscounted = validateProductDiscountedPrice(19.9, 25.99, true);
console.log(`✓ One decimal (19.9): ${oneDecimalDiscounted.valid ? 'PASS' : 'FAIL'}`);

// ==================== STOCK VALIDATION TESTS ====================

console.log('\n=== Stock Validation Tests ===');

// Valid: positive stock
const validStock = validateProductStock(100);
console.log(`✓ Valid stock (100): ${validStock.valid ? 'PASS' : 'FAIL'}`);

// Valid: zero stock (allowed)
const zeroStock = validateProductStock(0);
console.log(`✓ Zero stock (allowed): ${zeroStock.valid ? 'PASS' : 'FAIL'}`);

// Valid: maximum stock (9999)
const maxStock = validateProductStock(9999);
console.log(`✓ Maximum stock (9999): ${maxStock.valid ? 'PASS' : 'FAIL'}`);

// Invalid: negative stock
const negativeStock = validateProductStock(-5);
console.log(`✓ Negative stock: ${!negativeStock.valid ? 'PASS' : 'FAIL'} (${negativeStock.error})`);

// Invalid: exceeds maximum (10000)
const excessStock = validateProductStock(10000);
console.log(`✓ Excess stock (10000): ${!excessStock.valid ? 'PASS' : 'FAIL'} (${excessStock.error})`);

// Invalid: not an integer (decimal)
const decimalStock = validateProductStock(10.5);
console.log(`✓ Decimal stock (10.5): ${!decimalStock.valid ? 'PASS' : 'FAIL'} (${decimalStock.error})`);

// Invalid: not a number (string)
const stringStock = validateProductStock('10');
console.log(`✓ String stock ('10'): ${!stringStock.valid ? 'PASS' : 'FAIL'} (${stringStock.error})`);

// ==================== STOCK STATUS TESTS ====================

console.log('\n=== Stock Status Tests ===');

// Test: Out of stock (0)
const statusOutOfStock = getStockStatus(0);
console.log(`✓ Out of stock (0): ${statusOutOfStock.message === 'Out of Stock' && statusOutOfStock.level === 'danger' && statusOutOfStock.color === 'red' ? 'PASS' : 'FAIL'}`);
console.log(`  Message: "${statusOutOfStock.message}", Level: ${statusOutOfStock.level}, Color: ${statusOutOfStock.color}`);

// Test: Low stock (1-10)
const statusLowStock1 = getStockStatus(1);
console.log(`✓ Low stock (1): ${statusLowStock1.message === 'Only 1 left' && statusLowStock1.level === 'warning' && statusLowStock1.color === 'orange' ? 'PASS' : 'FAIL'}`);
console.log(`  Message: "${statusLowStock1.message}", Level: ${statusLowStock1.level}, Color: ${statusLowStock1.color}`);

const statusLowStock5 = getStockStatus(5);
console.log(`✓ Low stock (5): ${statusLowStock5.message === 'Only 5 left' && statusLowStock5.level === 'warning' ? 'PASS' : 'FAIL'}`);

const statusLowStock10 = getStockStatus(10);
console.log(`✓ Low stock (10): ${statusLowStock10.message === 'Only 10 left' && statusLowStock10.level === 'warning' ? 'PASS' : 'FAIL'}`);

// Test: In stock (>10)
const statusInStock11 = getStockStatus(11);
console.log(`✓ In stock (11): ${statusInStock11.message === 'In Stock' && statusInStock11.level === 'success' && statusInStock11.color === 'green' ? 'PASS' : 'FAIL'}`);
console.log(`  Message: "${statusInStock11.message}", Level: ${statusInStock11.level}, Color: ${statusInStock11.color}`);

const statusInStock100 = getStockStatus(100);
console.log(`✓ In stock (100): ${statusInStock100.message === 'In Stock' && statusInStock100.level === 'success' ? 'PASS' : 'FAIL'}`);

// Test: Invalid stock (negative)
const statusInvalid = getStockStatus(-1);
console.log(`✓ Invalid stock (-1): ${statusInvalid.message === 'Invalid stock' && statusInvalid.level === 'error' ? 'PASS' : 'FAIL'}`);

// ==================== COMPLETE PRODUCT VALIDATION TESTS ====================

console.log('\n=== Complete Product Validation Tests ===');

// Valid new product with all fields
const validNewProduct = {
  name: 'Test Product',
  price: 25.50,
  description: 'This is a great test product with a detailed description.',
  category: 'Test Category',
  discount: false,
  discountedPrice: 25.50,
  stock: 100
};
const newProductValidation = validateProduct(validNewProduct, [], true);
console.log(`✓ Valid new product: ${newProductValidation.valid ? 'PASS' : 'FAIL'}`);

// Valid product with discount
const validDiscountProduct = {
  name: 'Discounted Product',
  price: 50.00,
  description: 'This product is on sale with a great discount!',
  category: 'Electronics',
  discount: true,
  discountedPrice: 39.99,
  stock: 25
};
const discountProductValidation = validateProduct(validDiscountProduct, [], true);
console.log(`✓ Valid discounted product: ${discountProductValidation.valid ? 'PASS' : 'FAIL'}`);

// Invalid: Missing name
const missingNameProduct = {
  price: 25.50,
  description: 'This is a great product.',
  category: 'Electronics',
  discount: false,
  discountedPrice: 25.50,
  stock: 10
};
const missingNameValidation = validateProduct(missingNameProduct, [], true);
console.log(`✓ Missing name: ${!missingNameValidation.valid ? 'PASS' : 'FAIL'} (Errors: ${JSON.stringify(missingNameValidation.errors)})`);

// Invalid: Missing price
const missingPriceProduct = {
  name: 'Test Product',
  description: 'This is a great product.',
  category: 'Electronics',
  discount: false,
  discountedPrice: 25.50,
  stock: 10
};
const missingPriceValidation = validateProduct(missingPriceProduct, [], true);
console.log(`✓ Missing price: ${!missingPriceValidation.valid ? 'PASS' : 'FAIL'} (Errors: ${JSON.stringify(missingPriceValidation.errors)})`);

// Invalid: Missing description
const missingDescProduct = {
  name: 'Test Product',
  price: 25.50,
  category: 'Electronics',
  discount: false,
  discountedPrice: 25.50,
  stock: 10
};
const missingDescValidation = validateProduct(missingDescProduct, [], true);
console.log(`✓ Missing description: ${!missingDescValidation.valid ? 'PASS' : 'FAIL'} (Errors: ${JSON.stringify(missingDescValidation.errors)})`);

// Invalid: Missing category
const missingCategoryProduct = {
  name: 'Test Product',
  price: 25.50,
  description: 'This is a great product.',
  discount: false,
  discountedPrice: 25.50,
  stock: 10
};
const missingCategoryValidation = validateProduct(missingCategoryProduct, [], true);
console.log(`✓ Missing category: ${!missingCategoryValidation.valid ? 'PASS' : 'FAIL'} (Errors: ${JSON.stringify(missingCategoryValidation.errors)})`);

// Invalid: Missing discount flag
const missingDiscountProduct = {
  name: 'Test Product',
  price: 25.50,
  description: 'This is a great product.',
  category: 'Electronics',
  discountedPrice: 25.50,
  stock: 10
};
const missingDiscountValidation = validateProduct(missingDiscountProduct, [], true);
console.log(`✓ Missing discount flag: ${!missingDiscountValidation.valid ? 'PASS' : 'FAIL'} (Errors: ${JSON.stringify(missingDiscountValidation.errors)})`);

// Invalid: Missing stock
const missingStockProduct = {
  name: 'Test Product',
  price: 25.50,
  description: 'This is a great product.',
  category: 'Electronics',
  discount: false,
  discountedPrice: 25.50
};
const missingStockValidation = validateProduct(missingStockProduct, [], true);
console.log(`✓ Missing stock: ${!missingStockValidation.valid ? 'PASS' : 'FAIL'} (Errors: ${JSON.stringify(missingStockValidation.errors)})`);

// Invalid: Discounted price >= regular price when discount = true
const invalidDiscountPriceProduct = {
  name: 'Test Product',
  price: 25.50,
  description: 'This is a great product.',
  category: 'Electronics',
  discount: true,
  discountedPrice: 30.00, // Higher than price!
  stock: 10
};
const invalidDiscountPriceValidation = validateProduct(invalidDiscountPriceProduct, [], true);
console.log(`✓ Invalid discounted price (> regular price): ${!invalidDiscountPriceValidation.valid ? 'PASS' : 'FAIL'} (Errors: ${JSON.stringify(invalidDiscountPriceValidation.errors)})`);

// Invalid: Multiple errors
const multipleErrorsProduct = {
  name: 'ab', // Too short
  price: -5, // Negative
  description: 'Short', // Too short
  category: 'A', // Too short
  discount: 'yes', // Not a boolean
  discountedPrice: -10, // Negative
  stock: -5 // Negative
};
const multipleErrorsValidation = validateProduct(multipleErrorsProduct, [], true);
console.log(`✓ Multiple errors: ${!multipleErrorsValidation.valid ? 'PASS' : 'FAIL'} (Errors: ${JSON.stringify(multipleErrorsValidation.errors)})`);

// Valid existing product with ID
const validExistingProduct = {
  id: 1,
  name: 'Existing Product',
  price: 50.00,
  description: 'This is an existing product with all required fields.',
  category: 'Electronics',
  discount: false,
  discountedPrice: 50.00,
  stock: 20
};
const existingProductValidation = validateProduct(validExistingProduct, [{ id: 1 }], false);
console.log(`✓ Valid existing product: ${existingProductValidation.valid ? 'PASS' : 'FAIL'}`);

console.log('\n=== All Tests Complete ===');
