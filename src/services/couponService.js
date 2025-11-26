import { validateCoupon, isCouponCodeUnique, isCategoryValid } from '../schemas/couponSchema';

/**
 * CouponService - Handles all file system interactions with coupons.json
 * Uses Electron IPC to communicate with the main process for file operations
 * Mirrors the productService.js pattern for consistency
 */
class CouponService {
  /**
   * Constructor
   * @param {string} projectPath - The path to the Sakr Store repository
   */
  constructor(projectPath) {
    this.projectPath = projectPath;
  }

  /**
   * Load coupons from coupons.json
   * @returns {Promise<Array>} Array of coupon objects
   * @throws {Error} If reading fails
   */
  async loadCoupons() {
    try {
      const coupons = await window.electron.coupons.load(this.projectPath);
      return coupons;
    } catch (error) {
      console.error('CouponService: Error loading coupons', error);
      // If file doesn't exist, return empty array
      if (error.message && error.message.includes('COUPONS_NOT_FOUND')) {
        return [];
      }
      throw error;
    }
  }

  /**
   * Save coupons to coupons.json
   * @param {Array} coupons - Array of coupon objects to save
   * @returns {Promise<boolean>} True if save was successful
   * @throws {Error} If writing fails
   */
  async saveCoupons(coupons) {
    try {
      await window.electron.coupons.save(this.projectPath, coupons);
      return true;
    } catch (error) {
      console.error('CouponService: Error saving coupons', error);
      throw error;
    }
  }

  /**
   * Validate a coupon object
   * @param {Object} coupon - Coupon object to validate
   * @param {Array} existingCoupons - Array of existing coupons
   * @param {Array} availableCategories - Array of valid categories from products
   * @param {string} [currentCouponCode] - Current coupon code (for edit mode)
   * @returns {Promise<Object>} Validation result { valid: boolean, errors: Array, coupon: Object }
   */
  async validateCouponData(coupon, existingCoupons, availableCategories, currentCouponCode = null) {
    const errors = [];

    try {
      // Validate schema
      await validateCoupon(coupon);
    } catch (validationError) {
      // Collect all validation errors
      if (validationError.inner) {
        validationError.inner.forEach(err => {
          errors.push({
            field: err.path,
            message: err.message
          });
        });
      } else {
        errors.push({
          field: 'general',
          message: validationError.message
        });
      }
    }

    // Check code uniqueness
    if (coupon.code && !isCouponCodeUnique(coupon.code, existingCoupons, currentCouponCode)) {
      errors.push({
        field: 'code',
        message: 'This coupon code already exists'
      });
    }

    // Validate category exists
    if (coupon.category && !isCategoryValid(coupon.category, availableCategories)) {
      errors.push({
        field: 'category',
        message: 'Selected category does not exist in products'
      });
    }

    return {
      valid: errors.length === 0,
      errors,
      coupon
    };
  }

  /**
   * Generate next available coupon ID
   * @param {Array} coupons - Existing coupons
   * @returns {number} Next available ID
   */
  generateNextCouponId(coupons) {
    if (!coupons || coupons.length === 0) {
      return 1;
    }
    
    const maxId = Math.max(...coupons.map(c => c.id || 0));
    return maxId + 1;
  }

  /**
   * Format coupon code to uppercase alphanumeric
   * @param {string} code - Raw coupon code
   * @returns {string} Formatted coupon code
   */
  formatCouponCode(code) {
    if (!code) return '';
    return code.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  }

  /**
   * Create a default coupon template
   * @returns {Object} Default coupon object
   */
  getDefaultCoupon() {
    return {
      id: 0, // Will be auto-generated
      code: '',
      type: 'percentage',
      amount: 10,
      minSpend: 0,
      category: 'All',
      description: '',
      enabled: true
    };
  }

  /**
   * Apply coupon discount to a price
   * @param {number} price - Original price
   * @param {Object} coupon - Coupon object
   * @returns {number} Discounted price
   */
  applyDiscount(price, coupon) {
    if (!coupon || !coupon.enabled) return price;

    if (coupon.type === 'percentage') {
      const discount = (price * coupon.amount) / 100;
      return Math.max(0, price - discount);
    } else if (coupon.type === 'fixed') {
      return Math.max(0, price - coupon.amount);
    }

    return price;
  }

  /**
   * Calculate discount amount
   * @param {number} price - Original price
   * @param {Object} coupon - Coupon object
   * @returns {number} Discount amount
   */
  calculateDiscountAmount(price, coupon) {
    if (!coupon || !coupon.enabled) return 0;

    if (coupon.type === 'percentage') {
      return (price * coupon.amount) / 100;
    } else if (coupon.type === 'fixed') {
      return Math.min(price, coupon.amount); // Cannot discount more than the price
    }

    return 0;
  }
}

export default CouponService;
