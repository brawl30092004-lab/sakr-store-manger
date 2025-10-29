/**
 * ExportService - Handles exporting products to a clean "Exported" folder
 * Creates organized structure with product name-based folders
 */

/**
 * Generate a URL-safe slug from product name
 * Handles English, Arabic, special characters, and ensures uniqueness
 * 
 * @param {string} name - Product name
 * @param {number} id - Product ID (for uniqueness)
 * @returns {string} URL-safe slug
 */
function generateSlug(name, id) {
  // Remove leading/trailing whitespace
  let slug = name.trim();
  
  // Convert to lowercase
  slug = slug.toLowerCase();
  
  // Replace Arabic characters with transliteration or remove
  // For simplicity, we'll keep Arabic but make it safe
  slug = slug
    // Replace spaces and special chars with hyphens
    .replace(/[\s_]+/g, '-')
    // Remove unsafe filesystem characters
    .replace(/[<>:"/\\|?*]/g, '')
    // Replace multiple hyphens with single hyphen
    .replace(/-+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, '');
  
  // If slug is empty or only special chars, use product ID
  if (!slug || slug.length === 0) {
    slug = `product-${id}`;
  }
  
  // Limit length to 50 characters (filesystem safety)
  if (slug.length > 50) {
    slug = slug.substring(0, 50).replace(/-+$/, '');
  }
  
  // Add ID suffix to ensure uniqueness
  slug = `${slug}-${id}`;
  
  return slug;
}

/**
 * Export products to organized "Exported" folder structure
 * 
 * Structure:
 * Exported/
 * ├── products.json (with updated paths)
 * └── images/
 *     ├── classic-black-t-shirt-1/
 *     │   ├── primary.jpg
 *     │   ├── primary.webp
 *     │   ├── primary.avif
 *     │   ├── gallery-1.jpg
 *     │   └── ...
 *     └── modern-coffee-mug-2/
 *         └── ...
 * 
 * @param {Array} products - Array of product objects
 * @param {string} projectPath - Source project path
 * @param {Object} options - Export options
 * @returns {Promise<Object>} Export results with stats
 */
export async function exportProducts(products, projectPath, options = {}) {
  const {
    exportPath = null, // If null, creates "Exported" in projectPath
    includeFormats = ['jpg', 'webp', 'avif'], // Which formats to include
    onProgress = null // Progress callback (current, total, message)
  } = options;
  
  try {
    // Determine export path
    const targetPath = exportPath || window.electron.fs ?
      await window.electron.fs.joinPath(projectPath, 'Exported') :
      `${projectPath}/Exported`;
    
    // Create export directory structure
    if (window.electron?.export) {
      await window.electron.export.createDirectory(targetPath);
      await window.electron.export.createDirectory(
        await window.electron.fs.joinPath(targetPath, 'images')
      );
    }
    
    const exportedProducts = [];
    const stats = {
      totalProducts: products.length,
      processedProducts: 0,
      totalImages: 0,
      copiedImages: 0,
      errors: []
    };
    
    // Process each product
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      
      if (onProgress) {
        onProgress(i + 1, products.length, `Exporting ${product.name}...`);
      }
      
      try {
        // Generate slug for product folder
        const productSlug = generateSlug(product.name, product.id);
        const productImageFolder = `images/${productSlug}`;
        
        // Create product image folder
        const productImagePath = window.electron.fs ?
          await window.electron.fs.joinPath(targetPath, productImageFolder) :
          `${targetPath}/${productImageFolder}`;
        
        if (window.electron?.export) {
          await window.electron.export.createDirectory(productImagePath);
        }
        
        // Copy and rename primary image
        const newProduct = { ...product };
        
        if (product.images?.primary) {
          const copied = await copyAndRenameImage(
            projectPath,
            targetPath,
            product.images.primary,
            productImageFolder,
            'primary',
            includeFormats
          );
          
          if (copied.success) {
            newProduct.images.primary = copied.newPath;
            newProduct.image = copied.newPath; // Sync legacy field
            stats.copiedImages += copied.count;
          }
        }
        
        // Copy and rename gallery images
        if (product.images?.gallery && Array.isArray(product.images.gallery)) {
          const newGallery = [];
          
          for (let j = 0; j < product.images.gallery.length; j++) {
            const galleryImage = product.images.gallery[j];
            
            const copied = await copyAndRenameImage(
              projectPath,
              targetPath,
              galleryImage,
              productImageFolder,
              `gallery-${j + 1}`,
              includeFormats
            );
            
            if (copied.success) {
              newGallery.push(copied.newPath);
              stats.copiedImages += copied.count;
            }
          }
          
          newProduct.images.gallery = newGallery;
        }
        
        exportedProducts.push(newProduct);
        stats.processedProducts++;
        stats.totalImages += (product.images?.gallery?.length || 0) + 1;
        
      } catch (error) {
        console.error(`Error exporting product ${product.id}:`, error);
        stats.errors.push({
          productId: product.id,
          productName: product.name,
          error: error.message
        });
      }
    }
    
    // Save exported products.json
    if (window.electron?.export) {
      const productsJsonPath = await window.electron.fs.joinPath(targetPath, 'products.json');
      await window.electron.export.saveJSON(productsJsonPath, exportedProducts);
    }
    
    // Create export metadata
    const metadata = {
      exportDate: new Date().toISOString(),
      exportedFrom: projectPath,
      totalProducts: stats.processedProducts,
      totalImages: stats.copiedImages,
      formats: includeFormats,
      version: '1.0'
    };
    
    if (window.electron?.export) {
      const metadataPath = await window.electron.fs.joinPath(targetPath, 'export-info.json');
      await window.electron.export.saveJSON(metadataPath, metadata);
    }
    
    if (onProgress) {
      onProgress(products.length, products.length, 'Export completed!');
    }
    
    return {
      success: true,
      exportPath: targetPath,
      stats,
      metadata
    };
    
  } catch (error) {
    console.error('Export failed:', error);
    throw new Error(`Export failed: ${error.message}`);
  }
}

/**
 * Copy and rename image file with all its format variants
 * 
 * @param {string} sourcePath - Source project path
 * @param {string} targetPath - Target export path
 * @param {string} sourceImagePath - Relative path to source image
 * @param {string} targetFolder - Target folder (e.g., "images/product-slug")
 * @param {string} newName - New base name (e.g., "primary" or "gallery-1")
 * @param {Array} includeFormats - Which formats to copy
 * @returns {Promise<Object>} Result with success status and new path
 */
async function copyAndRenameImage(sourcePath, targetPath, sourceImagePath, targetFolder, newName, includeFormats) {
  try {
    // Extract base name without extension
    const extMatch = sourceImagePath.match(/\.(jpg|jpeg|png|webp|avif)$/i);
    if (!extMatch) {
      return { success: false, count: 0 };
    }
    
    const basePath = sourceImagePath.replace(/\.[^.]+$/, '');
    let copiedCount = 0;
    
    // Copy all format variants
    const formatMap = {
      'jpg': ['.jpg', '.jpeg'],
      'webp': ['.webp'],
      'avif': ['.avif']
    };
    
    for (const format of includeFormats) {
      const extensions = formatMap[format] || [`.${format}`];
      
      for (const ext of extensions) {
        const sourceFile = window.electron.fs ?
          await window.electron.fs.joinPath(sourcePath, `${basePath}${ext}`) :
          `${sourcePath}/${basePath}${ext}`;
        
        const targetFile = window.electron.fs ?
          await window.electron.fs.joinPath(targetPath, targetFolder, `${newName}${ext}`) :
          `${targetPath}/${targetFolder}/${newName}${ext}`;
        
        // Check if source file exists
        const exists = window.electron?.export ?
          await window.electron.export.fileExists(sourceFile) :
          false;
        
        if (exists) {
          // Copy file
          if (window.electron?.export) {
            await window.electron.export.copyFile(sourceFile, targetFile);
            copiedCount++;
          }
        }
      }
    }
    
    // Return path to primary JPG
    const newPath = `${targetFolder}/primary.jpg`;
    
    return {
      success: copiedCount > 0,
      newPath,
      count: copiedCount
    };
    
  } catch (error) {
    console.error('Error copying image:', error);
    return { success: false, count: 0 };
  }
}

/**
 * Validate export options
 * 
 * @param {Object} options - Export options to validate
 * @returns {Object} Validation result
 */
export function validateExportOptions(options) {
  const errors = [];
  
  if (options.includeFormats) {
    const validFormats = ['jpg', 'webp', 'avif'];
    const invalid = options.includeFormats.filter(f => !validFormats.includes(f));
    
    if (invalid.length > 0) {
      errors.push(`Invalid formats: ${invalid.join(', ')}`);
    }
    
    if (options.includeFormats.length === 0) {
      errors.push('At least one format must be selected');
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Get export statistics preview (without actually exporting)
 * 
 * @param {Array} products - Array of products
 * @returns {Object} Statistics preview
 */
export function getExportPreview(products) {
  let totalImages = 0;
  let productsWithoutImages = 0;
  
  products.forEach(product => {
    if (product.images?.primary) {
      totalImages += 1; // Primary
      totalImages += (product.images.gallery?.length || 0); // Gallery
    } else {
      productsWithoutImages++;
    }
  });
  
  return {
    totalProducts: products.length,
    totalImages,
    productsWithoutImages,
    estimatedSizeMB: totalImages * 0.15 // Rough estimate: 150KB per image avg
  };
}
