import * as yup from 'yup';

/**
 * Yup validation schema for coupon objects
 * Validates coupon structure matching coupons.json format
 */
export const couponSchema = yup.object({
  code: yup.string()
    .required('Coupon code is required')
    .matches(/^[A-Z0-9]+$/, 'Only uppercase letters and numbers allowed')
    .min(4, 'Minimum 4 characters required')
    .max(20, 'Maximum 20 characters allowed')
    .trim(),
  
  type: yup.string()
    .oneOf(['percentage', 'fixed'], 'Type must be either "percentage" or "fixed"')
    .required('Discount type is required'),
  
  amount: yup.number()
    .positive('Amount must be a positive number')
    .required('Discount amount is required')
    .when('type', {
      is: 'percentage',
      then: (schema) => schema
        .max(100, 'Percentage discount cannot exceed 100%')
        .min(1, 'Percentage must be at least 1%'),
      otherwise: (schema) => schema.min(0.01, 'Fixed amount must be greater than 0')
    })
    .typeError('Amount must be a valid number'),
  
  minSpend: yup.number()
    .min(0, 'Minimum spend cannot be negative')
    .default(0)
    .typeError('Minimum spend must be a valid number'),
  
  category: yup.string()
    .required('Category is required')
    .trim(),
  
  description: yup.string()
    .max(200, 'Description cannot exceed 200 characters')
    .default('')
    .trim(),
  
  enabled: yup.boolean()
    .default(true)
});

/**
 * Validate a coupon object
 * @param {Object} coupon - Coupon object to validate
 * @returns {Promise<Object>} Validated coupon object
 * @throws {ValidationError} If validation fails
 */
export const validateCoupon = async (coupon) => {
  return await couponSchema.validate(coupon, { abortEarly: false });
};

/**
 * Validate coupon uniqueness
 * @param {string} code - Coupon code to check
 * @param {Array} existingCoupons - Array of existing coupons
 * @param {string} [currentCouponCode] - Current coupon code (for edit mode)
 * @returns {boolean} True if code is unique
 */
export const isCouponCodeUnique = (code, existingCoupons, currentCouponCode = null) => {
  const normalizedCode = code.trim().toUpperCase();
  
  return !existingCoupons.some(coupon => {
    const existingCode = coupon.code.trim().toUpperCase();
    // If editing, allow the same code for the current coupon
    if (currentCouponCode && existingCode === currentCouponCode.trim().toUpperCase()) {
      return false;
    }
    return existingCode === normalizedCode;
  });
};

/**
 * Validate category exists in products
 * @param {string} category - Category to validate
 * @param {Array} availableCategories - Array of valid categories (including "All")
 * @returns {boolean} True if category is valid
 */
export const isCategoryValid = (category, availableCategories) => {
  if (category === 'All') return true;
  return availableCategories.includes(category);
};
