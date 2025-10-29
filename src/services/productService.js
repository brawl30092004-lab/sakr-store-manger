import { generateNextProductId, validateProduct } from './productValidation.js';
import { deleteProductImages, deleteProductImage } from './imageService.js';



/**
 * Ensure product.image is synced with images.primary for backward compatibility
 * @param {Object} product - Product object to process
 * @returns {Object} Product with synced image field
 */
function syncLegacyImageField(product) {
  if (product.images && product.images.primary) {
    return {
      ...product,
      image: product.images.primary
    };
  }
  return product;
}

/**
 * ProductService - Handles all file system interactions with products.json
 * Uses Electron IPC to communicate with the main process for file operations
 */
class ProductService {
  /**
   * Constructor
   * @param {string} projectPath - The path to the Sakr Store repository
   */
  constructor(projectPath) {
    this.projectPath = projectPath;
  }

  /**
   * Load products from products.json
   * @returns {Promise<Array>} Array of products
   * @throws {Error} If reading fails
   */
  async loadProducts() {
    try {
      const products = await window.electron.fs.loadProducts(this.projectPath);
      return products;
    } catch (error) {
      console.error('ProductService: Error loading products', error);
      throw error;
    }
  }

  /**
   * Save products to products.json
   * Automatically syncs the legacy image field with images.primary
   * @param {Array} products - Array of product objects to save
   * @returns {Promise<void>}
   * @throws {Error} If writing fails
   */
  async saveProducts(products) {
    try {
      // Sync legacy image field for all products before saving
      const productsWithSyncedImages = products.map(product => syncLegacyImageField(product));
      await window.electron.fs.saveProducts(this.projectPath, productsWithSyncedImages);
    } catch (error) {
      console.error('ProductService: Error saving products', error);
      throw error;
    }
  }

  /**
   * Add a new product
   * Automatically syncs the legacy image field with images.primary
   * @param {Object} product - Product object to add (without ID)
   * @returns {Promise<Array>} Updated products array
   * @throws {Error} If validation fails
   */
  async addProduct(product) {
    const products = await this.loadProducts();
    
    // Generate the next unique ID
    const newId = generateNextProductId(products);
    
    // Create the new product with generated ID and synced image field
    const newProduct = syncLegacyImageField({
      ...product,
      id: newId
    });
    
    // Validate the new product
    const validation = validateProduct(newProduct, products, true);
    if (!validation.valid) {
      const errorMessages = Object.entries(validation.errors)
        .map(([field, error]) => `${field}: ${error}`)
        .join(', ');
      throw new Error(`Product validation failed: ${errorMessages}`);
    }
    
    products.push(newProduct);
    await this.saveProducts(products);
    return products;
  }

  /**
   * Update an existing product
   * Automatically syncs the legacy image field with images.primary
   * @param {string} id - Product ID to update
   * @param {Object} updatedProduct - Updated product data (ID cannot be changed)
   * @returns {Promise<Array>} Updated products array
   * @throws {Error} If validation fails or product not found
   */
  async updateProduct(id, updatedProduct) {
    const products = await this.loadProducts();
    const index = products.findIndex(p => p.id === id);
    
    if (index === -1) {
      throw new Error(`Product with ID ${id} not found`);
    }
    
    const oldProduct = products[index];
    
    // Ensure ID is not changed and sync image field
    const productToUpdate = syncLegacyImageField({
      ...oldProduct,
      ...updatedProduct,
      id: oldProduct.id // Preserve original ID (immutable)
    });
    
    // Validate the updated product
    const validation = validateProduct(productToUpdate, products, false);
    if (!validation.valid) {
      const errorMessages = Object.entries(validation.errors)
        .map(([field, error]) => `${field}: ${error}`)
        .join(', ');
      throw new Error(`Product validation failed: ${errorMessages}`);
    }
    
    // Handle image cleanup: Delete old images that are no longer referenced
    const oldImages = oldProduct.images || {};
    const newImages = productToUpdate.images || {};
    
    // Check if primary image changed
    if (oldImages.primary && oldImages.primary !== newImages.primary) {
      await deleteProductImage(this.projectPath, oldImages.primary);
    }
    
    // Check if gallery images changed
    const oldGallery = oldImages.gallery || [];
    const newGallery = newImages.gallery || [];
    
    // Find gallery images that were removed
    const removedGalleryImages = oldGallery.filter(oldPath => !newGallery.includes(oldPath));
    
    // Delete each removed gallery image
    for (const imagePath of removedGalleryImages) {
      await deleteProductImage(this.projectPath, imagePath);
    }
    
    products[index] = productToUpdate;
    await this.saveProducts(products);
    return products;
  }

  /**
   * Delete a product
   * @param {string} id - Product ID to delete
   * @returns {Promise<Array>} Updated products array
   */
  async deleteProduct(id) {
    const products = await this.loadProducts();
    
    // Delete all associated images before removing from products.json
    await deleteProductImages(this.projectPath, id, 'all');
    
    const filteredProducts = products.filter(p => p.id !== id);
    await this.saveProducts(filteredProducts);
    return filteredProducts;
  }

  /**
   * Duplicate a product
   * Creates a copy of an existing product with a new ID and "(Copy)" appended to the name
   * @param {string} id - Product ID to duplicate
   * @returns {Promise<Array>} Updated products array with the duplicated product
   * @throws {Error} If product not found
   */
  async duplicateProduct(id) {
    const products = await this.loadProducts();
    const productToDuplicate = products.find(p => p.id === id);
    
    if (!productToDuplicate) {
      throw new Error(`Product with ID ${id} not found`);
    }
    
    // Create a copy of the product without the ID
    const { id: _removedId, ...productCopy } = productToDuplicate;
    
    // Append "(Copy)" to the name
    const duplicatedProduct = {
      ...productCopy,
      name: `${productToDuplicate.name} (Copy)`
    };
    
    // Use addProduct to generate a new ID and save
    return await this.addProduct(duplicatedProduct);
  }
}

export default ProductService;
