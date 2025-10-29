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
 * Validate product description
 * Must support English, Arabic, and mixed text with multiline support
 * 
 * @param {string} description - The product description to validate
 * @returns {{valid: boolean, error: string|null}}
 */
export function validateProductDescription(description) {
  // Must be a string
  if (typeof description !== 'string') {
    return {
      valid: false,
      error: 'Description must be a string'
    };
  }
  
  // Min 10 characters (after trimming)
  const trimmedDescription = description.trim();
  if (trimmedDescription.length < 10) {
    return {
      valid: false,
      error: 'Description must be at least 10 characters long'
    };
  }
  
  // Max 1000 characters (before trimming)
  if (description.length > 1000) {
    return {
      valid: false,
      error: 'Description must not exceed 1000 characters'
    };
  }
  
  return { valid: true, error: null };
}

/**
 * Validate product category
 * Categories are case-sensitive and custom categories are allowed
 * 
 * @param {string} category - The product category to validate
 * @returns {{valid: boolean, error: string|null}}
 */
export function validateProductCategory(category) {
  // Must be a string
  if (typeof category !== 'string') {
    return {
      valid: false,
      error: 'Category must be a string'
    };
  }
  
  // Min 2 characters (after trimming)
  const trimmedCategory = category.trim();
  if (trimmedCategory.length < 2) {
    return {
      valid: false,
      error: 'Category must be at least 2 characters long'
    };
  }
  
  // Max 50 characters (before trimming)
  if (category.length > 50) {
    return {
      valid: false,
      error: 'Category must not exceed 50 characters'
    };
  }
  
  return { valid: true, error: null };
}

/**
 * Validate product discount flag
 * 
 * @param {boolean} discount - The discount flag to validate (optional)
 * @returns {{valid: boolean, error: string|null}}
 */
export function validateProductDiscount(discount) {
  // Discount is optional - if not provided, it's valid
  if (discount === undefined || discount === null) {
    return { valid: true, error: null };
  }
  
  // If provided, must be a boolean
  if (typeof discount !== 'boolean') {
    return {
      valid: false,
      error: 'Discount must be a boolean (true or false)'
    };
  }
  
  return { valid: true, error: null };
}

/**
 * Validate product discounted price
 * Must be less than regular price when discount is true
 * 
 * @param {number} discountedPrice - The discounted price to validate
 * @param {number} regularPrice - The regular price for comparison
 * @param {boolean} discount - Whether discount is active
 * @returns {{valid: boolean, error: string|null}}
 */
export function validateProductDiscountedPrice(discountedPrice, regularPrice, discount) {
  // Must be a number
  if (typeof discountedPrice !== 'number' || isNaN(discountedPrice)) {
    return {
      valid: false,
      error: 'Discounted price must be a valid number'
    };
  }
  
  // Must be positive (greater than 0)
  if (discountedPrice <= 0) {
    return {
      valid: false,
      error: 'Discounted price must be greater than 0'
    };
  }
  
  // Must have maximum 2 decimal places
  // Convert to string and check decimal places to avoid floating point issues
  const priceStr = discountedPrice.toString();
  const decimalIndex = priceStr.indexOf('.');
  
  if (decimalIndex !== -1) {
    const decimalPlaces = priceStr.length - decimalIndex - 1;
    if (decimalPlaces > 2) {
      return {
        valid: false,
        error: 'Discounted price must have exactly 2 decimal places'
      };
    }
  }
  
  // When discount is true, discounted price must be less than regular price
  if (discount === true && regularPrice !== undefined) {
    if (discountedPrice >= regularPrice) {
      return {
        valid: false,
        error: 'Discounted price must be less than regular price'
      };
    }
  }
  
  return { valid: true, error: null };
}

/**
 * Validate product stock
 * Must be a non-negative integer with max value of 9999
 * 
 * @param {number} stock - The stock quantity to validate
 * @returns {{valid: boolean, error: string|null}}
 */
export function validateProductStock(stock) {
  // Must be a number
  if (typeof stock !== 'number' || isNaN(stock)) {
    return {
      valid: false,
      error: 'Stock must be a valid number'
    };
  }
  
  // Must be an integer
  if (!Number.isInteger(stock)) {
    return {
      valid: false,
      error: 'Stock must be an integer'
    };
  }
  
  // Must be non-negative (0 is allowed)
  if (stock < 0) {
    return {
      valid: false,
      error: 'Stock cannot be negative'
    };
  }
  
  // Maximum stock is 9999
  if (stock > 9999) {
    return {
      valid: false,
      error: 'Stock cannot exceed 9999'
    };
  }
  
  return { valid: true, error: null };
}

/**
 * Validate product images object
 * Must have a primary image and optional gallery array
 * 
 * @param {Object} images - The images object to validate
 * @returns {{valid: boolean, error: string|null}}
 */
export function validateProductImages(images) {
  // Must be an object
  if (typeof images !== 'object' || images === null || Array.isArray(images)) {
    return {
      valid: false,
      error: 'Images must be an object'
    };
  }
  
  // Must have primary property
  if (!images.hasOwnProperty('primary')) {
    return {
      valid: false,
      error: 'Images object must have a primary property'
    };
  }
  
  // Validate primary image
  const primaryValidation = validateProductImagePrimary(images.primary);
  if (!primaryValidation.valid) {
    return primaryValidation;
  }
  
  // Validate gallery if present
  if (images.hasOwnProperty('gallery')) {
    const galleryValidation = validateProductImageGallery(images.gallery);
    if (!galleryValidation.valid) {
      return galleryValidation;
    }
  }
  
  return { valid: true, error: null };
}

/**
 * Validate product primary image
 * Must be a non-empty string (relative file path)
 * 
 * @param {string} primary - The primary image path to validate
 * @returns {{valid: boolean, error: string|null}}
 */
export function validateProductImagePrimary(primary) {
  // Must be a string
  if (typeof primary !== 'string') {
    return {
      valid: false,
      error: 'Primary image must be a string'
    };
  }
  
  // Cannot be empty
  if (primary.trim().length === 0) {
    return {
      valid: false,
      error: 'Primary image cannot be empty'
    };
  }
  
  return { valid: true, error: null };
}

/**
 * Validate product image gallery
 * Must be an array of strings with max 100 images (optional)
 * 
 * @param {Array} gallery - The gallery array to validate
 * @returns {{valid: boolean, error: string|null}}
 */
export function validateProductImageGallery(gallery) {
  // Gallery is optional - if not provided, it's valid
  if (gallery === undefined || gallery === null) {
    return { valid: true, error: null };
  }
  
  // Must be an array
  if (!Array.isArray(gallery)) {
    return {
      valid: false,
      error: 'Gallery must be an array'
    };
  }
  
  // Max 100 images
  if (gallery.length > 100) {
    return {
      valid: false,
      error: 'Gallery cannot exceed 100 images'
    };
  }
  
  // Each element must be a string
  for (let i = 0; i < gallery.length; i++) {
    if (typeof gallery[i] !== 'string') {
      return {
        valid: false,
        error: `Gallery image at index ${i} must be a string`
      };
    }
  }
  
  return { valid: true, error: null };
}

/**
 * Validate product isNew flag
 * 
 * @param {boolean} isNew - The isNew flag to validate (optional)
 * @returns {{valid: boolean, error: string|null}}
 */
export function validateProductIsNew(isNew) {
  // isNew is optional - if not provided, it's valid
  if (isNew === undefined || isNew === null) {
    return { valid: true, error: null };
  }
  
  // If provided, must be a boolean
  if (typeof isNew !== 'boolean') {
    return {
      valid: false,
      error: 'isNew must be a boolean (true or false)'
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
 * Truncate text for display in product cards
 * 
 * @param {string} text - The text to truncate
 * @param {number} maxLength - Maximum length before truncation (default: 50)
 * @returns {string} Truncated text with ellipsis or original text
 */
export function truncateText(text, maxLength = 50) {
  if (typeof text !== 'string') {
    return '';
  }
  
  if (text.length <= maxLength) {
    return text;
  }
  
  return text.substring(0, maxLength) + '...';
}

/**
 * Extract unique categories from product list
 * Returns a sorted array of unique category names
 * 
 * @param {Array} products - Array of product objects
 * @returns {Array<string>} Sorted array of unique category names
 */
export function getCategoriesFromProducts(products) {
  if (!Array.isArray(products) || products.length === 0) {
    return [];
  }
  
  const categorySet = new Set();
  
  products.forEach(product => {
    if (product.category && typeof product.category === 'string') {
      categorySet.add(product.category);
    }
  });
  
  return Array.from(categorySet).sort();
}

/**
 * Get stock status based on stock quantity
 * Returns status object with message, level, and color for UI display
 * 
 * @param {number} stock - The stock quantity
 * @returns {{message: string, level: string, color: string}}
 */
export function getStockStatus(stock) {
  if (typeof stock !== 'number' || isNaN(stock) || stock < 0) {
    return {
      message: 'Invalid stock',
      level: 'error',
      color: 'gray'
    };
  }
  
  if (stock === 0) {
    return {
      message: 'Out of Stock',
      level: 'danger',
      color: 'red'
    };
  }
  
  if (stock > 0 && stock <= 10) {
    return {
      message: `Only ${stock} left`,
      level: 'warning',
      color: 'orange'
    };
  }
  
  // stock > 10
  return {
    message: 'In Stock',
    level: 'success',
    color: 'green'
  };
}

/**
 * Validate a complete product object
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
  
  // Validate description
  if (product.description !== undefined) {
    const descriptionValidation = validateProductDescription(product.description);
    if (!descriptionValidation.valid) {
      errors.description = descriptionValidation.error;
    }
  } else {
    errors.description = 'Description is required';
  }
  
  // Validate category
  if (product.category !== undefined) {
    const categoryValidation = validateProductCategory(product.category);
    if (!categoryValidation.valid) {
      errors.category = categoryValidation.error;
    }
  } else {
    errors.category = 'Category is required';
  }
  
  // Validate discount (optional)
  if (product.discount !== undefined) {
    const discountValidation = validateProductDiscount(product.discount);
    if (!discountValidation.valid) {
      errors.discount = discountValidation.error;
    }
  }
  
  // Validate discountedPrice (only required when discount is true)
  if (product.discount === true) {
    if (product.discountedPrice !== undefined) {
      const discountedPriceValidation = validateProductDiscountedPrice(
        product.discountedPrice,
        product.price,
        product.discount
      );
      if (!discountedPriceValidation.valid) {
        errors.discountedPrice = discountedPriceValidation.error;
      }
    } else {
      errors.discountedPrice = 'Discounted price is required when discount is enabled';
    }
  }
  
  // Validate stock
  if (product.stock !== undefined) {
    const stockValidation = validateProductStock(product.stock);
    if (!stockValidation.valid) {
      errors.stock = stockValidation.error;
    }
  } else {
    errors.stock = 'Stock is required';
  }
  
  // Validate images
  if (product.images !== undefined) {
    const imagesValidation = validateProductImages(product.images);
    if (!imagesValidation.valid) {
      errors.images = imagesValidation.error;
    }
  } else {
    errors.images = 'Images object is required';
  }
  
  // Validate isNew (optional)
  if (product.isNew !== undefined) {
    const isNewValidation = validateProductIsNew(product.isNew);
    if (!isNewValidation.valid) {
      errors.isNew = isNewValidation.error;
    }
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
  },
  
  description: {
    type: 'string',
    required: true,
    constraints: {
      minLength: 10,
      maxLength: 1000,
      supportedLanguages: ['English', 'Arabic', 'Mixed'],
      multiline: true
    },
    description: 'Detailed product description'
  },
  
  category: {
    type: 'string',
    required: true,
    constraints: {
      minLength: 2,
      maxLength: 50,
      caseSensitive: true,
      customAllowed: true
    },
    description: 'Product category for filtering'
  },
  
  discount: {
    type: 'boolean',
    required: false,
    default: false,
    constraints: {
      values: [true, false]
    },
    description: 'Flag to indicate if product is on sale (optional)'
  },
  
  discountedPrice: {
    type: 'number',
    required: 'conditional', // Required when discount = true
    constraints: {
      positive: true,
      decimalPlaces: 2,
      lessThan: 'price' // Must be less than regular price when discount is true
    },
    currency: 'EGP',
    default: 'price', // Defaults to regular price when discount is false
    description: 'Sale price when product is discounted'
  },
  
  stock: {
    type: 'integer',
    required: true,
    constraints: {
      nonNegative: true,
      min: 0,
      max: 9999
    },
    description: 'Available inventory quantity'
  },
  
  images: {
    type: 'object',
    required: true,
    properties: {
      primary: {
        type: 'string',
        required: true,
        constraints: {
          noEmptyWhitespace: true
        },
        description: 'Main product image (relative file path)'
      },
      gallery: {
        type: 'array',
        required: false,
        default: [],
        constraints: {
          maxLength: 100,
          elementType: 'string'
        },
        description: 'Additional product images (optional, up to 100 images)'
      }
    },
    description: 'Modern image management system'
  },
  
  image: {
    type: 'string',
    required: false, // Optional but recommended
    autoPopulated: true,
    constraints: {
      syncWith: 'images.primary'
    },
    description: 'Legacy fallback image path (auto-populated from images.primary)'
  },
  
  isNew: {
    type: 'boolean',
    required: false,
    default: true, // New products are marked as "New" by default
    constraints: {
      values: [true, false]
    },
    description: 'Flag to mark product as new/featured (optional)'
  }
};

// Default export for convenience
export default {
  generateNextProductId,
  validateProductId,
  validateProductName,
  validateProductPrice,
  validateProductDescription,
  validateProductCategory,
  validateProductDiscount,
  validateProductDiscountedPrice,
  validateProductStock,
  validateProductImages,
  validateProductImagePrimary,
  validateProductImageGallery,
  validateProductIsNew,
  validateProduct,
  formatPrice,
  truncateText,
  getCategoriesFromProducts,
  getStockStatus,
  productValidationSchema
};
