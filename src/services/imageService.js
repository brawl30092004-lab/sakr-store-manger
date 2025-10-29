/**
 * ImageService - Client-side image validation and processing
 * Validates uploaded images for type, size, and dimensions
 */

import { createError } from '../utils/errorHandler.js';

/**
 * Supported image formats
 */
const SUPPORTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/avif'
];

/**
 * Image constraints
 */
const IMAGE_CONSTRAINTS = {
  maxSizeBytes: 10 * 1024 * 1024, // 10 MB
  minWidth: 400,
  minHeight: 400,
  maxGalleryImages: 10
};

/**
 * Validate an uploaded image file
 * Checks file type, size, and dimensions
 * 
 * @param {File} file - The image file to validate
 * @returns {Promise<{valid: boolean, error?: string, dimensions?: {width: number, height: number}}>}
 */
export async function validateUploadedImage(file) {
  // Step 1: Check if file exists
  if (!file) {
    return {
      valid: false,
      error: 'No file provided'
    };
  }

  // Step 2: Check file type
  if (!SUPPORTED_IMAGE_TYPES.includes(file.type)) {
    throw createError('INVALID_FILE_TYPE', `Invalid file type. Supported formats: JPEG, PNG, WebP, AVIF`);
  }

  // Step 3: Check file size
  if (file.size > IMAGE_CONSTRAINTS.maxSizeBytes) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
    const maxMB = IMAGE_CONSTRAINTS.maxSizeBytes / (1024 * 1024);
    throw createError('FILE_TOO_LARGE', `File too large (${sizeMB} MB). Maximum size is ${maxMB} MB`);
  }

  // Step 4: Check image dimensions
  try {
    const dimensions = await getImageDimensions(file);
    
    if (dimensions.width < IMAGE_CONSTRAINTS.minWidth || dimensions.height < IMAGE_CONSTRAINTS.minHeight) {
      return {
        valid: false,
        error: `Image too small (${dimensions.width}x${dimensions.height}px). Minimum size is ${IMAGE_CONSTRAINTS.minWidth}x${IMAGE_CONSTRAINTS.minHeight}px`
      };
    }

    // All checks passed
    return {
      valid: true,
      dimensions
    };
  } catch (error) {
    return {
      valid: false,
      error: 'Failed to load image. Please try another file.'
    };
  }
}

/**
 * Get dimensions of an image file
 * 
 * @param {File} file - The image file
 * @returns {Promise<{width: number, height: number}>}
 */
function getImageDimensions(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url); // Clean up
      resolve({
        width: img.width,
        height: img.height
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url); // Clean up
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}

/**
 * Convert a File to a data URL for preview
 * 
 * @param {File} file - The image file
 * @returns {Promise<string>} Data URL of the image
 */
export function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      resolve(e.target.result);
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsDataURL(file);
  });
}

/**
 * Format file size in human-readable format
 * 
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted size (e.g., "1.5 MB")
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Get file extension from filename
 * 
 * @param {string} filename - The filename
 * @returns {string} File extension (e.g., "jpg")
 */
export function getFileExtension(filename) {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2).toLowerCase();
}

/**
 * Validate gallery image count
 * 
 * @param {number} currentCount - Current number of gallery images
 * @param {number} addingCount - Number of images being added
 * @returns {{valid: boolean, error?: string}}
 */
export function validateGalleryCount(currentCount, addingCount = 1) {
  const totalCount = currentCount + addingCount;
  
  if (totalCount > IMAGE_CONSTRAINTS.maxGalleryImages) {
    return {
      valid: false,
      error: `Maximum ${IMAGE_CONSTRAINTS.maxGalleryImages} gallery images allowed. You currently have ${currentCount}.`
    };
  }
  
  return { valid: true };
}

/**
 * Export constraints for use in components
 */
export const imageConstraints = IMAGE_CONSTRAINTS;
export const supportedImageTypes = SUPPORTED_IMAGE_TYPES;

/**
 * Process uploaded image through Electron backend
 * Converts image to multiple formats (JPG, WebP, AVIF) and saves to project
 * 
 * @param {File} file - The uploaded image file
 * @param {string} projectPath - Project root path
 * @param {number} productId - Product ID
 * @param {string} imageType - 'primary' or 'gallery'
 * @param {number|null} index - Gallery image index (null for primary)
 * @returns {Promise<string>} Path to the saved JPG image (e.g., 'images/product-23-primary.jpg')
 */
export async function processProductImage(file, projectPath, productId, imageType, index = null) {
  if (!file) {
    throw new Error('No file provided for processing');
  }

  if (!projectPath) {
    throw new Error('Project path is required for image processing');
  }

  if (!productId) {
    throw new Error('Product ID is required for image processing');
  }

  if (!window.electron?.image?.processImage) {
    throw new Error('Electron image processing API is not available');
  }

  try {
    console.log(`Processing ${imageType} image${index !== null ? ` (index ${index})` : ''} for product ${productId}`);
    
    // Convert File to data URL for transfer to main process
    const imageData = await fileToDataURL(file);

    // Call Electron backend to process the image
    const result = await window.electron.image.processImage(
      imageData,
      projectPath,
      productId,
      imageType,
      index
    );

    if (!result.success) {
      throw new Error(result.error || 'Failed to process image');
    }

    console.log(`Successfully processed image: ${result.path}`);
    return result.path;
  } catch (error) {
    console.error('Error processing product image:', error);
    console.error('Context:', { productId, imageType, index, projectPath });
    throw new Error(`Image processing failed: ${error.message}`);
  }
}

/**
 * Delete image files (all formats) from project
 * 
 * @param {string} projectPath - Project root path
 * @param {string} imagePath - Relative path to image (e.g., 'images/product-23-primary.jpg')
 * @returns {Promise<boolean>} Success status
 */
export async function deleteProductImage(projectPath, imagePath) {
  if (!imagePath) {
    return true; // Nothing to delete
  }

  try {
    const result = await window.electron.image.deleteImage(projectPath, imagePath);
    
    if (!result.success) {
      console.warn('Failed to delete image:', result.error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error deleting product image:', error);
    return false;
  }
}

/**
 * Delete all images associated with a product
 * 
 * @param {string} projectPath - Project root path
 * @param {number} productId - Product ID
 * @param {string} imageType - 'all', 'primary', or 'gallery' (default: 'all')
 * @returns {Promise<{success: boolean, deletedCount: number}>} Result with deletion count
 */
export async function deleteProductImages(projectPath, productId, imageType = 'all') {
  if (!productId) {
    return { success: true, deletedCount: 0 };
  }

  try {
    const result = await window.electron.image.deleteProductImages(projectPath, productId, imageType);
    
    if (!result.success) {
      console.warn('Failed to delete product images:', result.error);
      return { success: false, deletedCount: 0 };
    }

    return { success: true, deletedCount: result.deletedCount };
  } catch (error) {
    console.error('Error deleting product images:', error);
    return { success: false, deletedCount: 0 };
  }
}
