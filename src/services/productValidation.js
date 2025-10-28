/**
 * Product Validation Utilities
 * Handles validation for product fields and ID generation logic
 */

/**
 * Generate the next product ID
 * Finds the maximum ID from existing products and returns that number plus one
 * This ensures IDs are never reused, even if a product is deleted
 * 
 * @param {Array} products - Array of all existing products
 * @returns {number} The next available product ID (starts at 1 if no products exist)
 */
export function generateNextProductId(products) {
  if (!products || products.length === 0) {
    return 1;
  }
  
  const maxId = Math.max(...products.map(p => p.id || 0));
  return maxId + 1;
}

/**
 * Validate product ID
 * 
 * @param {number} id - The product ID to validate
 * @param {Array} existingProducts - Array of existing products (for uniqueness check)
 * @param {boolean} isNew - Whether this is a new product (ID should not exist)
 * @returns {{valid: boolean, error: string|null}}
 */
export function validateProductId(id, existingProducts = [], isNew = false) {
  // ID must be a positive integer
  if (typeof id !== 'number' || !Number.isInteger(id) || id <= 0) {
    return {
      valid: false,
      error: 'ID must be a positive integer'
    };
  }
  
  // Check uniqueness for new products
  if (isNew && existingProducts.some(p => p.id === id)) {
    return {
      valid: false,
      error: 'ID already exists'
    };
  }
  
  return { valid: true, error: null };
}

/**
 * Validate product name
 * Must support English, Arabic, and mixed text
 * 
 * @param {string} name - The product name to validate
 * @returns {{valid: boolean, error: string|null}}
 */
export function validateProductName(name) {
  // Must be a string
  if (typeof name !== 'string') {
    return {
      valid: false,
      error: 'Name must be a string'
    };
  }
  
  // Cannot be empty whitespace
  const trimmedName = name.trim();
  if (trimmedName.length === 0) {
    return {
      valid: false,
      error: 'Name cannot be empty or only whitespace'
    };
  }
  
  // Min 3 characters (after trimming)
  if (trimmedName.length < 3) {
    return {
      valid: false,
      error: 'Name must be at least 3 characters long'
    };
  }
  
  // Max 200 characters (before trimming)
  if (name.length > 200) {
    return {
      valid: false,
      error: 'Name must not exceed 200 characters'
    };
  }
  
  return { valid: true, error: null };
}

/**
 * Validate product price
 * Must be a positive number with exactly 2 decimal places
 * 
 * @param {number} price - The product price to validate
 * @returns {{valid: boolean, error: string|null}}
 */
export function validateProductPrice(price) {
  // Must be a number
  if (typeof price !== 'number' || isNaN(price)) {
    return {
      valid: false,
      error: 'Price must be a valid number'
    };
  }
  
  // Must be positive (greater than 0)
  if (price <= 0) {
    return {
      valid: false,
      error: 'Price must be greater than 0'
    };
  }
  
  // Minimum price 0.01
  if (price < 0.01) {
    return {
      valid: false,
      error: 'Price must be at least 0.01 EGP'
    };
  }
  
  // Maximum price 999999.99
  if (price > 999999.99) {
    return {
      valid: false,
      error: 'Price must not exceed 999,999.99 EGP'
    };
  }
  
  // Must have exactly 2 decimal places
  // Convert to string and check decimal places to avoid floating point issues
  const priceStr = price.toString();
  const decimalIndex = priceStr.indexOf('.');
  
  if (decimalIndex === -1) {
    // No decimal point - valid if it's a whole number (e.g., 10 = 10.00)
    return { valid: true, error: null };
  }
  
  const decimalPlaces = priceStr.length - decimalIndex - 1;
  if (decimalPlaces > 2) {
    return {
      valid: false,
      error: 'Price must have exactly 2 decimal places'
    };
  }
  
  return { valid: true, error: null };
}

/**
 * Format price to exactly 2 decimal places
 * Useful for UI display and input formatting
 * 
 * @param {number} price - The price to format
 * @returns {string} Formatted price string
 */
export function formatPrice(price) {
  return Number(price).toFixed(2);
}

/**
 * Validate a complete product object (Part 1: id, name, price)
 * 
 * @param {Object} product - The product object to validate
 * @param {Array} existingProducts - Array of existing products
 * @param {boolean} isNew - Whether this is a new product
 * @returns {{valid: boolean, errors: Object}}
 */
export function validateProduct(product, existingProducts = [], isNew = false) {
  const errors = {};
  
  // Validate ID (only for existing products or when ID is provided)
  if (!isNew && product.id !== undefined) {
    const idValidation = validateProductId(product.id, existingProducts, false);
    if (!idValidation.valid) {
      errors.id = idValidation.error;
    }
  }
  
  // Validate name
  if (product.name !== undefined) {
    const nameValidation = validateProductName(product.name);
    if (!nameValidation.valid) {
      errors.name = nameValidation.error;
    }
  } else {
    errors.name = 'Name is required';
  }
  
  // Validate price
  if (product.price !== undefined) {
    const priceValidation = validateProductPrice(product.price);
    if (!priceValidation.valid) {
      errors.price = priceValidation.error;
    }
  } else {
    errors.price = 'Price is required';
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Product Validation Schema
 * Defines the rules and constraints for core product fields
 */
export const productValidationSchema = {
  id: {
    type: 'integer',
    required: true,
    constraints: {
      positive: true,
      unique: true,
      immutable: true // Cannot be changed once created
    },
    description: 'Unique, non-reusable identifier'
  },
  
  name: {
    type: 'string',
    required: true,
    constraints: {
      minLength: 3,
      maxLength: 200,
      noEmptyWhitespace: true,
      supportedLanguages: ['English', 'Arabic', 'Mixed']
    },
    description: 'Display name of the product'
  },
  
  price: {
    type: 'number',
    required: true,
    constraints: {
      positive: true,
      min: 0.01,
      max: 999999.99,
      decimalPlaces: 2
    },
    currency: 'EGP',
    description: 'Regular price in Egyptian Pounds'
  }
};

// Default export for convenience
export default {
  generateNextProductId,
  validateProductId,
  validateProductName,
  validateProductPrice,
  validateProduct,
  formatPrice,
  productValidationSchema
};
