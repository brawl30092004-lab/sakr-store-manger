/**
 * Product Schema Validation Tests
 * Unit tests for Yup schema validation
 */

import { describe, it, expect } from 'vitest';
import {
  productSchema,
  validateProductYup,
  validateProductYupSync,
  validateProductWithDetails,
  isProductValid
} from '../services/productSchema.js';
import {
  validProduct,
  validProductWithDiscount,
  validProductMinimal,
  invalidProductNameTooShort,
  invalidProductNameWhitespace,
  invalidProductDiscountPriceHigh,
  invalidProductDiscountPriceEqual,
  invalidProductNegativeStock,
  invalidProductStockTooHigh,
  invalidProductDescriptionShort,
  invalidProductPriceZero,
  invalidProductPriceNegative,
  invalidProductMissingName,
  invalidProductMissingImages,
  invalidProductEmptyPrimaryImage,
  invalidProductGalleryTooLarge,
  invalidProductStockNotInteger,
  invalidProductCategoryShort,
  invalidProductMultipleErrors
} from '../services/productSchema.testCases.js';

describe('Product Schema Validation', () => {
  
  // ============================================
  // VALID PRODUCTS TESTS
  // ============================================
  
  describe('Valid Products', () => {
    it('should validate a complete valid product', async () => {
      const result = await validateProductYup(validProduct);
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should validate a valid product with discount', async () => {
      const result = await validateProductYup(validProductWithDiscount);
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should validate a minimal valid product (no gallery, out of stock)', async () => {
      const result = await validateProductYup(validProductMinimal);
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should return true when checking if valid product is valid', async () => {
      const result = await isProductValid(validProduct);
      expect(result).toBe(true);
    });
  });

  // ============================================
  // NAME VALIDATION TESTS
  // ============================================
  
  describe('Name Validation', () => {
    it('should reject name that is too short', async () => {
      const result = await validateProductYup(invalidProductNameTooShort);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(err => err.includes('at least 3 characters'))).toBe(true);
    });

    it('should reject name with only whitespace', async () => {
      const result = await validateProductYup(invalidProductNameWhitespace);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(err => err.includes('whitespace'))).toBe(true);
    });

    it('should reject missing name', async () => {
      const result = await validateProductYup(invalidProductMissingName);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(err => err.includes('required'))).toBe(true);
    });
  });

  // ============================================
  // PRICE VALIDATION TESTS
  // ============================================
  
  describe('Price Validation', () => {
    it('should reject price of zero', async () => {
      const result = await validateProductYup(invalidProductPriceZero);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(err => err.includes('greater than 0'))).toBe(true);
    });

    it('should reject negative price', async () => {
      const result = await validateProductYup(invalidProductPriceNegative);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(err => err.includes('greater than 0'))).toBe(true);
    });

    it('should accept valid price with 2 decimal places', async () => {
      const product = {
        ...validProduct,
        price: 299.99
      };
      const result = await validateProductYup(product);
      expect(result.valid).toBe(true);
    });
  });

  // ============================================
  // DESCRIPTION VALIDATION TESTS
  // ============================================
  
  describe('Description Validation', () => {
    it('should reject description that is too short', async () => {
      const result = await validateProductYup(invalidProductDescriptionShort);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(err => err.includes('at least 10 characters'))).toBe(true);
    });
  });

  // ============================================
  // CATEGORY VALIDATION TESTS
  // ============================================
  
  describe('Category Validation', () => {
    it('should reject category that is too short', async () => {
      const result = await validateProductYup(invalidProductCategoryShort);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(err => err.includes('at least 2 characters'))).toBe(true);
    });
  });

  // ============================================
  // DISCOUNT VALIDATION TESTS
  // ============================================
  
  describe('Discount Validation', () => {
    it('should reject discount price higher than regular price when discount is true', async () => {
      const result = await validateProductYup(invalidProductDiscountPriceHigh);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(err => err.includes('less than regular price'))).toBe(true);
    });

    it('should reject discount price equal to regular price when discount is true', async () => {
      const result = await validateProductYup(invalidProductDiscountPriceEqual);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(err => err.includes('less than regular price'))).toBe(true);
    });

    it('should accept when discount is false and prices are equal', async () => {
      const product = {
        ...validProduct,
        discount: false,
        price: 299.99,
        discountedPrice: 299.99
      };
      const result = await validateProductYup(product);
      expect(result.valid).toBe(true);
    });
  });

  // ============================================
  // STOCK VALIDATION TESTS
  // ============================================
  
  describe('Stock Validation', () => {
    it('should reject negative stock', async () => {
      const result = await validateProductYup(invalidProductNegativeStock);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(err => err.includes('cannot be negative'))).toBe(true);
    });

    it('should reject stock that exceeds maximum (9999)', async () => {
      const result = await validateProductYup(invalidProductStockTooHigh);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(err => err.includes('cannot exceed 9999'))).toBe(true);
    });

    it('should reject stock that is not an integer', async () => {
      const result = await validateProductYup(invalidProductStockNotInteger);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(err => err.includes('integer'))).toBe(true);
    });

    it('should accept zero stock (out of stock)', async () => {
      const product = {
        ...validProduct,
        stock: 0
      };
      const result = await validateProductYup(product);
      expect(result.valid).toBe(true);
    });
  });

  // ============================================
  // IMAGES VALIDATION TESTS
  // ============================================
  
  describe('Images Validation', () => {
    it('should reject missing images object', async () => {
      const result = await validateProductYup(invalidProductMissingImages);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(err => err.includes('required'))).toBe(true);
    });

    it('should reject empty primary image', async () => {
      const result = await validateProductYup(invalidProductEmptyPrimaryImage);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(err => err.includes('Primary image'))).toBe(true);
    });

    it('should reject gallery with more than 10 images', async () => {
      const result = await validateProductYup(invalidProductGalleryTooLarge);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors.some(err => err.includes('cannot exceed 10'))).toBe(true);
    });

    it('should accept empty gallery', async () => {
      const product = {
        ...validProduct,
        images: {
          primary: "images/product.jpg",
          gallery: []
        }
      };
      const result = await validateProductYup(product);
      expect(result.valid).toBe(true);
    });
  });

  // ============================================
  // MULTIPLE ERRORS TEST
  // ============================================
  
  describe('Multiple Errors', () => {
    it('should return all validation errors when abortEarly is false', async () => {
      const result = await validateProductYup(invalidProductMultipleErrors);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(3); // Multiple errors
    });

    it('should return field-specific errors with validateProductWithDetails', async () => {
      const result = await validateProductWithDetails(invalidProductMultipleErrors);
      expect(result.valid).toBe(false);
      expect(typeof result.errors).toBe('object');
      expect(Object.keys(result.errors).length).toBeGreaterThan(0);
    });
  });

  // ============================================
  // SYNCHRONOUS VALIDATION TESTS
  // ============================================
  
  describe('Synchronous Validation', () => {
    it('should validate synchronously with validateProductYupSync', () => {
      const result = validateProductYupSync(validProduct);
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should reject invalid product synchronously', () => {
      const result = validateProductYupSync(invalidProductNameTooShort);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  // ============================================
  // SCHEMA DIRECT TESTS
  // ============================================
  
  describe('Schema Direct Tests', () => {
    it('should validate using productSchema.validate directly', async () => {
      await expect(productSchema.validate(validProduct)).resolves.toBeDefined();
    });

    it('should throw ValidationError for invalid product', async () => {
      await expect(productSchema.validate(invalidProductNameTooShort))
        .rejects
        .toThrow();
    });
  });

  // ============================================
  // EDGE CASES
  // ============================================
  
  describe('Edge Cases', () => {
    it('should accept product with exactly 3 character name', async () => {
      const product = {
        ...validProduct,
        name: "ABC"
      };
      const result = await validateProductYup(product);
      expect(result.valid).toBe(true);
    });

    it('should accept product with exactly 10 character description', async () => {
      const product = {
        ...validProduct,
        description: "1234567890" // Exactly 10 characters
      };
      const result = await validateProductYup(product);
      expect(result.valid).toBe(true);
    });

    it('should accept product with exactly 10 gallery images', async () => {
      const product = {
        ...validProduct,
        images: {
          primary: "images/product.jpg",
          gallery: [
            "img1.jpg", "img2.jpg", "img3.jpg", "img4.jpg", "img5.jpg",
            "img6.jpg", "img7.jpg", "img8.jpg", "img9.jpg", "img10.jpg"
          ]
        }
      };
      const result = await validateProductYup(product);
      expect(result.valid).toBe(true);
    });

    it('should accept product with stock of 9999', async () => {
      const product = {
        ...validProduct,
        stock: 9999
      };
      const result = await validateProductYup(product);
      expect(result.valid).toBe(true);
    });

    it('should accept product with minimum price 0.01', async () => {
      const product = {
        ...validProduct,
        price: 0.01,
        discountedPrice: 0.01
      };
      const result = await validateProductYup(product);
      expect(result.valid).toBe(true);
    });

    it('should accept product with maximum price 999999.99', async () => {
      const product = {
        ...validProduct,
        price: 999999.99,
        discountedPrice: 999999.99
      };
      const result = await validateProductYup(product);
      expect(result.valid).toBe(true);
    });
  });

  // ============================================
  // BOOLEAN VALIDATION TESTS
  // ============================================
  
  describe('Boolean Fields', () => {
    it('should accept isNew as true', async () => {
      const product = {
        ...validProduct,
        isNew: true
      };
      const result = await validateProductYup(product);
      expect(result.valid).toBe(true);
    });

    it('should accept isNew as false', async () => {
      const product = {
        ...validProduct,
        isNew: false
      };
      const result = await validateProductYup(product);
      expect(result.valid).toBe(true);
    });

    it('should accept discount as true', async () => {
      const result = await validateProductYup(validProductWithDiscount);
      expect(result.valid).toBe(true);
    });

    it('should accept discount as false', async () => {
      const result = await validateProductYup(validProduct);
      expect(result.valid).toBe(true);
    });
  });
});
