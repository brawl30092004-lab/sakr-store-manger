/**
 * QUICK REFERENCE GUIDE
 * Product Validation - Part 1: ID, Name, Price
 * 
 * This file provides quick examples of how to use the validation functions
 */

import {
  generateNextProductId,
  validateProductId,
  validateProductName,
  validateProductPrice,
  validateProduct,
  formatPrice,
  productValidationSchema
} from './productValidation.js';

// ============================================
// EXAMPLE 1: Generate ID for New Product
// ============================================

const existingProducts = [
  { id: 1, name: 'Product 1', price: 10.00 },
  { id: 2, name: 'Product 2', price: 20.00 },
  { id: 5, name: 'Product 5', price: 50.00 } // Note: ID 3 and 4 were deleted
];

const nextId = generateNextProductId(existingProducts);
console.log(nextId); // Output: 6 (not 3, IDs are never reused!)

// ============================================
// EXAMPLE 2: Validate Individual Fields
// ============================================

// Validate ID
const idValidation = validateProductId(7, existingProducts, true);
if (!idValidation.valid) {
  console.error('ID Error:', idValidation.error);
}

// Validate Name
const nameValidation = validateProductName('Chocolate شوكولاتة');
if (!nameValidation.valid) {
  console.error('Name Error:', nameValidation.error);
}

// Validate Price
const priceValidation = validateProductPrice(99.99);
if (!priceValidation.valid) {
  console.error('Price Error:', priceValidation.error);
}

// ============================================
// EXAMPLE 3: Validate Complete Product (New)
// ============================================

const newProduct = {
  name: 'New Chocolate Bar',
  price: 25.50
};

const newValidation = validateProduct(newProduct, existingProducts, true);

if (newValidation.valid) {
  console.log('✅ Product is valid!');
  // Proceed to add product with generated ID
  const productToAdd = {
    ...newProduct,
    id: generateNextProductId(existingProducts)
  };
} else {
  console.error('❌ Validation failed:');
  Object.entries(newValidation.errors).forEach(([field, error]) => {
    console.error(`  - ${field}: ${error}`);
  });
}

// ============================================
// EXAMPLE 4: Validate Complete Product (Update)
// ============================================

const existingProduct = {
  id: 1,
  name: 'Updated Product Name',
  price: 35.99
};

const updateValidation = validateProduct(existingProduct, existingProducts, false);

if (updateValidation.valid) {
  console.log('✅ Updated product is valid!');
} else {
  console.error('❌ Validation failed:', updateValidation.errors);
}

// ============================================
// EXAMPLE 5: Format Price for Display
// ============================================

const price1 = 99.9;
console.log(formatPrice(price1)); // "99.90"

const price2 = 10;
console.log(formatPrice(price2)); // "10.00"

const price3 = 15.5;
console.log(formatPrice(price3)); // "15.50"

// ============================================
// EXAMPLE 6: Handle Validation Errors in UI
// ============================================

function handleProductSubmit(productData, isNew = true) {
  const validation = validateProduct(productData, existingProducts, isNew);
  
  if (!validation.valid) {
    // Display errors in UI
    const errorMessages = {
      id: validation.errors.id || null,
      name: validation.errors.name || null,
      price: validation.errors.price || null
    };
    
    // Show error messages to user
    if (errorMessages.name) {
      showFieldError('name', errorMessages.name);
    }
    if (errorMessages.price) {
      showFieldError('price', errorMessages.price);
    }
    
    return false;
  }
  
  // If valid, proceed with save
  if (isNew) {
    const newId = generateNextProductId(existingProducts);
    productData.id = newId;
  }
  
  return true;
}

function showFieldError(fieldName, errorMessage) {
  // Example UI error display
  const errorElement = document.querySelector(`#${fieldName}-error`);
  if (errorElement) {
    errorElement.textContent = errorMessage;
    errorElement.style.display = 'block';
  }
}

// ============================================
// EXAMPLE 7: Real-time Field Validation
// ============================================

function validateNameField(nameInput) {
  const name = nameInput.value;
  const validation = validateProductName(name);
  
  const errorElement = document.querySelector('#name-error');
  const charCounter = document.querySelector('#name-counter');
  
  if (validation.valid) {
    errorElement.style.display = 'none';
    nameInput.classList.remove('error');
    nameInput.classList.add('valid');
  } else {
    errorElement.textContent = validation.error;
    errorElement.style.display = 'block';
    nameInput.classList.add('error');
    nameInput.classList.remove('valid');
  }
  
  // Update character counter
  charCounter.textContent = `${name.length}/200`;
}

function validatePriceField(priceInput) {
  const price = parseFloat(priceInput.value);
  const validation = validateProductPrice(price);
  
  const errorElement = document.querySelector('#price-error');
  
  if (validation.valid) {
    errorElement.style.display = 'none';
    priceInput.classList.remove('error');
    priceInput.classList.add('valid');
    
    // Format on blur
    priceInput.value = formatPrice(price);
  } else {
    errorElement.textContent = validation.error;
    errorElement.style.display = 'block';
    priceInput.classList.add('error');
    priceInput.classList.remove('valid');
  }
}

// ============================================
// EXAMPLE 8: Check Schema Constraints
// ============================================

console.log('Product Validation Schema:');
console.log('ID constraints:', productValidationSchema.id.constraints);
// Output: { positive: true, unique: true, immutable: true }

console.log('Name constraints:', productValidationSchema.name.constraints);
// Output: { minLength: 3, maxLength: 200, noEmptyWhitespace: true, supportedLanguages: [...] }

console.log('Price constraints:', productValidationSchema.price.constraints);
// Output: { positive: true, min: 0.01, max: 999999.99, decimalPlaces: 2 }

// ============================================
// EXAMPLE 9: Common Validation Patterns
// ============================================

// Pattern 1: Validate before ProductService.addProduct()
async function addNewProduct(productData, productService) {
  const products = await productService.loadProducts();
  const validation = validateProduct(productData, products, true);
  
  if (!validation.valid) {
    throw new Error(`Invalid product: ${JSON.stringify(validation.errors)}`);
  }
  
  // ProductService will generate ID automatically
  await productService.addProduct(productData);
}

// Pattern 2: Validate before ProductService.updateProduct()
async function updateExistingProduct(productId, updates, productService) {
  const products = await productService.loadProducts();
  const existing = products.find(p => p.id === productId);
  
  if (!existing) {
    throw new Error(`Product ${productId} not found`);
  }
  
  const updatedProduct = { ...existing, ...updates };
  const validation = validateProduct(updatedProduct, products, false);
  
  if (!validation.valid) {
    throw new Error(`Invalid updates: ${JSON.stringify(validation.errors)}`);
  }
  
  await productService.updateProduct(productId, updates);
}

// ============================================
// EXAMPLE 10: Error Message Localization
// ============================================

const errorMessagesArabic = {
  'Name must be at least 3 characters long': 'يجب أن يكون الاسم 3 أحرف على الأقل',
  'Name must not exceed 200 characters': 'يجب ألا يتجاوز الاسم 200 حرف',
  'Price must be greater than 0': 'يجب أن يكون السعر أكبر من صفر',
  'Price must have exactly 2 decimal places': 'يجب أن يحتوي السعر على رقمين عشريين بالضبط'
};

function localizeError(errorMessage, language = 'en') {
  if (language === 'ar') {
    return errorMessagesArabic[errorMessage] || errorMessage;
  }
  return errorMessage;
}

// Usage
const validation = validateProductName('ab');
if (!validation.valid) {
  const localizedError = localizeError(validation.error, 'ar');
  console.log(localizedError); // Arabic error message
}
