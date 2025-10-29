import * as yup from 'yup';

/**
 * Product Schema - Comprehensive Yup Validation
 * Validates the entire product object based on all schema rules from Parts 1-4
 */

/**
 * Yup Schema for Product Validation
 * This schema validates all product fields with proper constraints and error messages
 */
export const productSchema = yup.object().shape({
  // ID - Non-negative integer (0 for new products, positive for existing)
  id: yup
    .number()
    .integer('ID must be an integer')
    .min(0, 'ID must be 0 or greater'),

  // Name - Required string, 3-200 characters, supports English/Arabic
  name: yup
    .string()
    .required('Name is required')
    .min(3, 'Name must be at least 3 characters long')
    .max(200, 'Name must not exceed 200 characters')
    .test('no-empty-whitespace', 'Name cannot be empty or only whitespace', value => {
      if (!value) return false;
      return value.trim().length >= 3;
    }),

  // Price - Required positive number with exactly 2 decimal places
  price: yup
    .number()
    .required('Price is required')
    .positive('Price must be greater than 0')
    .min(0.01, 'Price must be at least 0.01 EGP')
    .max(999999.99, 'Price must not exceed 999,999.99 EGP')
    .test('decimal-places', 'Price must have exactly 2 decimal places', value => {
      if (value === undefined || value === null) return false;
      // Check if value has at most 2 decimal places
      return (value * 100) % 1 === 0;
    }),

  // Description - Required string, 10-1000 characters, multiline, supports English/Arabic
  description: yup
    .string()
    .required('Description is required')
    .min(10, 'Description must be at least 10 characters long')
    .max(1000, 'Description must not exceed 1000 characters')
    .test('no-empty-whitespace', 'Description cannot be empty or only whitespace', value => {
      if (!value) return false;
      return value.trim().length >= 10;
    }),

  // Category - Required string, 2-50 characters, custom categories allowed
  category: yup
    .string()
    .required('Category is required')
    .min(2, 'Category must be at least 2 characters long')
    .max(50, 'Category must not exceed 50 characters')
    .test('no-empty-whitespace', 'Category cannot be empty or only whitespace', value => {
      if (!value) return false;
      return value.trim().length >= 2;
    }),

  // Discount - Boolean flag (optional)
  discount: yup
    .boolean()
    .notRequired()
    .default(false),

  // Discounted Price - Conditionally required when discount is true
  discountedPrice: yup
    .number()
    .transform((value, originalValue) => {
      // If discount is false, allow 0 or any value without strict validation
      return originalValue === '' || originalValue === null ? undefined : value;
    })
    .when('discount', {
      is: true,
      then: (schema) => schema
        .required('Discounted price is required when discount is enabled')
        .positive('Discounted price must be greater than 0')
        .test('decimal-places', 'Discounted price must have exactly 2 decimal places', value => {
          if (value === undefined || value === null) return false;
          return (value * 100) % 1 === 0;
        })
        .lessThan(
          yup.ref('price'),
          'Discounted price must be less than regular price'
        ),
      otherwise: (schema) => schema.notRequired().nullable()
    }),

  // Stock - Required non-negative integer, max 9999
  stock: yup
    .number()
    .required('Stock is required')
    .integer('Stock must be an integer')
    .min(0, 'Stock cannot be negative')
    .max(9999, 'Stock cannot exceed 9999'),

  // isNew - Boolean flag (optional)
  isNew: yup
    .boolean()
    .notRequired()
    .default(true),

  // Images - Object with primary and gallery
  images: yup
    .object()
    .shape({
      primary: yup
        .mixed()
        .required('Primary image is required')
        .test('valid-image', 'Primary image cannot be empty', value => {
          // Allow File objects (new uploads) or non-empty strings (existing paths)
          if (value instanceof File) return true;
          if (typeof value === 'string' && value.trim().length > 0) return true;
          return false;
        }),
      
      gallery: yup
        .array()
        .of(
          yup.mixed().test('is-string-or-file', 'Gallery items must be strings or File objects', value => {
            // Allow strings (existing image paths) or File objects (new uploads)
            return typeof value === 'string' || value instanceof File;
          })
        )
        .max(100, 'Gallery cannot exceed 100 images')
        .notRequired()
        .default([])
    })
    .required('Images object is required'),

  // Image - Legacy field (auto-populated, no validation needed)
  image: yup.string()
});

/**
 * Validate a product object using the Yup schema
 * 
 * @param {Object} product - The product object to validate
 * @returns {Promise<{valid: boolean, errors: Array<string>}>}
 */
export async function validateProductYup(product) {
  try {
    // Validate the product against the schema
    // abortEarly: false ensures all errors are collected
    await productSchema.validate(product, { abortEarly: false });
    
    // Validation successful
    return {
      valid: true,
      errors: []
    };
  } catch (error) {
    // Validation failed - extract error messages
    if (error.name === 'ValidationError') {
      return {
        valid: false,
        errors: error.errors // Array of error messages
      };
    }
    
    // Unexpected error
    throw error;
  }
}

/**
 * Validate a product object synchronously using the Yup schema
 * Note: Some async tests may not run in sync mode
 * 
 * @param {Object} product - The product object to validate
 * @returns {{valid: boolean, errors: Array<string>}}
 */
export function validateProductYupSync(product) {
  try {
    // Validate the product against the schema synchronously
    productSchema.validateSync(product, { abortEarly: false });
    
    // Validation successful
    return {
      valid: true,
      errors: []
    };
  } catch (error) {
    // Validation failed - extract error messages
    if (error.name === 'ValidationError') {
      return {
        valid: false,
        errors: error.errors // Array of error messages
      };
    }
    
    // Unexpected error
    throw error;
  }
}

/**
 * Validate a product object and return detailed field-level errors
 * 
 * @param {Object} product - The product object to validate
 * @returns {Promise<{valid: boolean, errors: Object}>}
 */
export async function validateProductWithDetails(product) {
  try {
    await productSchema.validate(product, { abortEarly: false });
    
    return {
      valid: true,
      errors: {}
    };
  } catch (error) {
    if (error.name === 'ValidationError') {
      // Convert error array to field-specific error object
      const fieldErrors = {};
      
      error.inner.forEach(err => {
        if (err.path && !fieldErrors[err.path]) {
          fieldErrors[err.path] = err.message;
        }
      });
      
      return {
        valid: false,
        errors: fieldErrors
      };
    }
    
    throw error;
  }
}

/**
 * Check if a product object is valid (returns boolean only)
 * 
 * @param {Object} product - The product object to validate
 * @returns {Promise<boolean>}
 */
export async function isProductValid(product) {
  try {
    await productSchema.validate(product);
    return true;
  } catch (error) {
    return false;
  }
}

// Default export
export default {
  productSchema,
  validateProductYup,
  validateProductYupSync,
  validateProductWithDetails,
  isProductValid
};
