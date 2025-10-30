/**
 * Image Recommendations Service
 * Provides utilities to check if images meet recommended specifications
 */

// Recommended image specifications
export const IMAGE_RECOMMENDATIONS = {
  minWidth: 800,
  maxWidth: 1200,
  minHeight: 800,
  maxHeight: 1200,
  aspectRatio: 1, // 1:1 (square)
  tolerancePercent: 5 // Allow 5% tolerance for aspect ratio
};

/**
 * Check if image dimensions meet recommendations
 * @param {number} width - Image width in pixels
 * @param {number} height - Image height in pixels
 * @returns {Object} - Status and details
 */
export function checkImageRecommendations(width, height) {
  const result = {
    isRecommended: true,
    isSquare: false,
    isGoodSize: false,
    warnings: [],
    suggestions: []
  };

  // Check if square (1:1 aspect ratio with tolerance)
  const actualRatio = width / height;
  const tolerance = IMAGE_RECOMMENDATIONS.tolerancePercent / 100;
  const minRatio = IMAGE_RECOMMENDATIONS.aspectRatio - tolerance;
  const maxRatio = IMAGE_RECOMMENDATIONS.aspectRatio + tolerance;
  
  result.isSquare = actualRatio >= minRatio && actualRatio <= maxRatio;
  
  if (!result.isSquare) {
    result.isRecommended = false;
    result.warnings.push('Image is not square');
    result.suggestions.push('Crop to 1:1 aspect ratio for best results');
  }

  // Check if size is within recommended range
  const isWidthGood = width >= IMAGE_RECOMMENDATIONS.minWidth && width <= IMAGE_RECOMMENDATIONS.maxWidth;
  const isHeightGood = height >= IMAGE_RECOMMENDATIONS.minHeight && height <= IMAGE_RECOMMENDATIONS.maxHeight;
  
  result.isGoodSize = isWidthGood && isHeightGood;

  if (!isWidthGood || !isHeightGood) {
    if (width < IMAGE_RECOMMENDATIONS.minWidth || height < IMAGE_RECOMMENDATIONS.minHeight) {
      result.warnings.push('Image is smaller than recommended');
      result.suggestions.push(`Use images at least ${IMAGE_RECOMMENDATIONS.minWidth}×${IMAGE_RECOMMENDATIONS.minHeight}px for best quality`);
    } else if (width > IMAGE_RECOMMENDATIONS.maxWidth || height > IMAGE_RECOMMENDATIONS.maxHeight) {
      result.warnings.push('Image is larger than recommended');
      result.suggestions.push(`Images larger than ${IMAGE_RECOMMENDATIONS.maxWidth}×${IMAGE_RECOMMENDATIONS.maxHeight}px will be automatically optimized`);
    }
  }

  return result;
}

/**
 * Get a human-readable status message
 * @param {Object} recommendations - Result from checkImageRecommendations
 * @returns {string} - Status message
 */
export function getRecommendationStatusMessage(recommendations) {
  if (recommendations.isRecommended) {
    return '✓ Meets recommendations';
  }
  
  if (!recommendations.isSquare && !recommendations.isGoodSize) {
    return 'Not square • Size not optimal';
  }
  
  if (!recommendations.isSquare) {
    return 'Not square (crop recommended)';
  }
  
  if (!recommendations.isGoodSize) {
    return 'Size not optimal';
  }
  
  return 'Review recommendations';
}

/**
 * Get badge type for UI display
 * @param {Object} recommendations - Result from checkImageRecommendations
 * @returns {string} - Badge type: 'success', 'warning', 'info'
 */
export function getRecommendationBadgeType(recommendations) {
  if (recommendations.isRecommended) {
    return 'success';
  }
  
  if (!recommendations.isSquare) {
    return 'warning';
  }
  
  return 'info';
}

/**
 * Calculate suggested crop dimensions to achieve 1:1 ratio
 * @param {number} width - Current image width
 * @param {number} height - Current image height
 * @returns {Object} - Suggested crop dimensions
 */
export function getSuggestedCropDimensions(width, height) {
  const size = Math.min(width, height);
  
  return {
    width: size,
    height: size,
    x: (width - size) / 2,
    y: (height - size) / 2
  };
}
