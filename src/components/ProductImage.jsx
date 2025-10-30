import React from 'react';
import { useImagePath } from '../hooks/useImagePath';

/**
 * ProductImage component - Handles image path resolution and loading
 * Uses the useImagePath hook to convert relative paths to absolute file:// URLs
 */
const ProductImage = React.memo(function ProductImage({ product, className = "product-image" }) {
  // Placeholder SVG for missing images
  const placeholderSvg = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23ddd" width="200" height="200"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="18" fill="%23999"%3ENo Image%3C/text%3E%3C/svg%3E';

  // Safety check: if product is undefined, show placeholder
  if (!product) {
    return (
      <div className={className}>
        <img src={placeholderSvg} alt="No product" />
      </div>
    );
  }

  // Resolve the image path
  const imagePath = product.image || product.images?.primary;
  const resolvedPath = useImagePath(imagePath);

  return (
    <div className={className}>
      <img 
        src={resolvedPath || placeholderSvg} 
        alt={product.name || 'Product'}
        onError={(e) => {
          // If the resolved path fails to load, show placeholder
          if (e.target.src !== placeholderSvg) {
            e.target.src = placeholderSvg;
          }
        }}
      />
      {product.isNew && <span className="badge badge-new">New</span>}
      {product.discount && <span className="badge badge-discount">Sale</span>}
    </div>
  );
});

export default ProductImage;
