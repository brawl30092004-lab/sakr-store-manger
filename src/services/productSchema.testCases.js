/**
 * Product Schema Test Cases
 * Mock product objects for testing Yup validation
 */

// ✅ Valid Product - All fields correct
export const validProduct = {
  id: 1,
  name: "Blue Cotton T-Shirt",
  price: 299.99,
  description: "Comfortable cotton t-shirt perfect for casual wear. Made from 100% organic cotton.",
  category: "Apparel",
  discount: false,
  discountedPrice: 299.99,
  stock: 50,
  isNew: true,
  images: {
    primary: "images/tshirt-blue.jpg",
    gallery: ["images/tshirt-blue-back.jpg", "images/tshirt-blue-detail.jpg"]
  },
  image: "images/tshirt-blue.jpg"
};

// ✅ Valid Product with Discount
export const validProductWithDiscount = {
  id: 2,
  name: "Red Hoodie",
  price: 599.00,
  description: "Warm and comfortable hoodie for cold weather. Features a front pocket and adjustable hood.",
  category: "Apparel",
  discount: true,
  discountedPrice: 449.00, // Less than price
  stock: 25,
  isNew: false,
  images: {
    primary: "images/hoodie-red.jpg",
    gallery: []
  },
  image: "images/hoodie-red.jpg"
};

// ✅ Valid Product - Minimal (no gallery)
export const validProductMinimal = {
  id: 3,
  name: "Black Jeans",
  price: 499.50,
  description: "Classic black jeans that go with everything. Comfortable fit.",
  category: "Apparel",
  discount: false,
  discountedPrice: 499.50,
  stock: 0, // Out of stock is valid
  isNew: false,
  images: {
    primary: "images/jeans-black.jpg",
    gallery: []
  },
  image: "images/jeans-black.jpg"
};

// ❌ Invalid - Name too short (less than 3 characters)
export const invalidProductNameTooShort = {
  id: 4,
  name: "AB", // Only 2 characters
  price: 299.99,
  description: "This product has a name that is too short for validation.",
  category: "Apparel",
  discount: false,
  discountedPrice: 299.99,
  stock: 10,
  isNew: true,
  images: {
    primary: "images/product.jpg",
    gallery: []
  },
  image: "images/product.jpg"
};

// ❌ Invalid - Name empty whitespace
export const invalidProductNameWhitespace = {
  id: 5,
  name: "   ", // Only whitespace
  price: 299.99,
  description: "This product has a name with only whitespace.",
  category: "Apparel",
  discount: false,
  discountedPrice: 299.99,
  stock: 10,
  isNew: true,
  images: {
    primary: "images/product.jpg",
    gallery: []
  },
  image: "images/product.jpg"
};

// ❌ Invalid - Discount true but discounted price > regular price
export const invalidProductDiscountPriceHigh = {
  id: 6,
  name: "Expensive Product",
  price: 299.99,
  description: "This product has a discounted price higher than the regular price.",
  category: "Electronics",
  discount: true,
  discountedPrice: 399.99, // Greater than price!
  stock: 15,
  isNew: false,
  images: {
    primary: "images/product.jpg",
    gallery: []
  },
  image: "images/product.jpg"
};

// ❌ Invalid - Discount true but discounted price equals regular price
export const invalidProductDiscountPriceEqual = {
  id: 7,
  name: "Same Price Product",
  price: 299.99,
  description: "This product has a discounted price equal to the regular price.",
  category: "Electronics",
  discount: true,
  discountedPrice: 299.99, // Equal to price (not less than)
  stock: 15,
  isNew: false,
  images: {
    primary: "images/product.jpg",
    gallery: []
  },
  image: "images/product.jpg"
};

// ❌ Invalid - Stock is negative
export const invalidProductNegativeStock = {
  id: 8,
  name: "Negative Stock Product",
  price: 199.99,
  description: "This product has a negative stock value which is not allowed.",
  category: "Accessories",
  discount: false,
  discountedPrice: 199.99,
  stock: -5, // Negative stock!
  isNew: true,
  images: {
    primary: "images/product.jpg",
    gallery: []
  },
  image: "images/product.jpg"
};

// ❌ Invalid - Stock exceeds maximum (9999)
export const invalidProductStockTooHigh = {
  id: 9,
  name: "High Stock Product",
  price: 99.99,
  description: "This product has a stock value that exceeds the maximum allowed.",
  category: "Electronics",
  discount: false,
  discountedPrice: 99.99,
  stock: 10000, // Exceeds max of 9999
  isNew: false,
  images: {
    primary: "images/product.jpg",
    gallery: []
  },
  image: "images/product.jpg"
};

// ❌ Invalid - Description too short (less than 10 characters)
export const invalidProductDescriptionShort = {
  id: 10,
  name: "Short Description",
  price: 149.99,
  description: "Too short", // Only 9 characters
  category: "Other",
  discount: false,
  discountedPrice: 149.99,
  stock: 5,
  isNew: false,
  images: {
    primary: "images/product.jpg",
    gallery: []
  },
  image: "images/product.jpg"
};

// ❌ Invalid - Price is zero
export const invalidProductPriceZero = {
  id: 11,
  name: "Zero Price Product",
  price: 0, // Price must be greater than 0
  description: "This product has a price of zero which is not allowed.",
  category: "Other",
  discount: false,
  discountedPrice: 0,
  stock: 10,
  isNew: false,
  images: {
    primary: "images/product.jpg",
    gallery: []
  },
  image: "images/product.jpg"
};

// ❌ Invalid - Price is negative
export const invalidProductPriceNegative = {
  id: 12,
  name: "Negative Price Product",
  price: -99.99, // Negative price
  description: "This product has a negative price which is not allowed.",
  category: "Other",
  discount: false,
  discountedPrice: -99.99,
  stock: 10,
  isNew: false,
  images: {
    primary: "images/product.jpg",
    gallery: []
  },
  image: "images/product.jpg"
};

// ❌ Invalid - Missing required field (name)
export const invalidProductMissingName = {
  id: 13,
  // name is missing
  price: 199.99,
  description: "This product is missing the required name field.",
  category: "Other",
  discount: false,
  discountedPrice: 199.99,
  stock: 10,
  isNew: false,
  images: {
    primary: "images/product.jpg",
    gallery: []
  },
  image: "images/product.jpg"
};

// ❌ Invalid - Missing images object
export const invalidProductMissingImages = {
  id: 14,
  name: "No Images Product",
  price: 99.99,
  description: "This product is missing the required images object.",
  category: "Other",
  discount: false,
  discountedPrice: 99.99,
  stock: 10,
  isNew: false,
  // images is missing
  image: "images/product.jpg"
};

// ❌ Invalid - Empty primary image
export const invalidProductEmptyPrimaryImage = {
  id: 15,
  name: "Empty Primary Image",
  price: 99.99,
  description: "This product has an empty primary image which is not allowed.",
  category: "Other",
  discount: false,
  discountedPrice: 99.99,
  stock: 10,
  isNew: false,
  images: {
    primary: "", // Empty primary image
    gallery: []
  },
  image: ""
};

// ❌ Invalid - Gallery exceeds 10 images
export const invalidProductGalleryTooLarge = {
  id: 16,
  name: "Large Gallery Product",
  price: 399.99,
  description: "This product has more than 10 images in the gallery.",
  category: "Electronics",
  discount: false,
  discountedPrice: 399.99,
  stock: 20,
  isNew: true,
  images: {
    primary: "images/product.jpg",
    gallery: [
      "img1.jpg", "img2.jpg", "img3.jpg", "img4.jpg", "img5.jpg",
      "img6.jpg", "img7.jpg", "img8.jpg", "img9.jpg", "img10.jpg",
      "img11.jpg" // 11 images - exceeds max of 10
    ]
  },
  image: "images/product.jpg"
};

// ❌ Invalid - Stock is not an integer
export const invalidProductStockNotInteger = {
  id: 17,
  name: "Decimal Stock Product",
  price: 149.99,
  description: "This product has a decimal stock value which is not allowed.",
  category: "Other",
  discount: false,
  discountedPrice: 149.99,
  stock: 10.5, // Stock must be an integer
  isNew: false,
  images: {
    primary: "images/product.jpg",
    gallery: []
  },
  image: "images/product.jpg"
};

// ❌ Invalid - Category too short
export const invalidProductCategoryShort = {
  id: 18,
  name: "Short Category",
  price: 99.99,
  description: "This product has a category that is too short.",
  category: "A", // Only 1 character (min is 2)
  discount: false,
  discountedPrice: 99.99,
  stock: 5,
  isNew: false,
  images: {
    primary: "images/product.jpg",
    gallery: []
  },
  image: "images/product.jpg"
};

// ❌ Invalid - Multiple errors
export const invalidProductMultipleErrors = {
  id: 19,
  name: "AB", // Too short
  price: -50, // Negative
  description: "Short", // Too short (less than 10 chars)
  category: "X", // Too short
  discount: true,
  discountedPrice: 100, // Greater than price (even though price is negative)
  stock: -10, // Negative
  isNew: false,
  images: {
    primary: "", // Empty
    gallery: []
  },
  image: ""
};

// Export all test cases
export const testCases = {
  valid: {
    validProduct,
    validProductWithDiscount,
    validProductMinimal
  },
  invalid: {
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
  }
};

export default testCases;
