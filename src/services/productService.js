import { generateNextProductId, validateProduct } from './productValidation.js';

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
    
    // Ensure ID is not changed and sync image field
    const productToUpdate = syncLegacyImageField({
      ...products[index],
      ...updatedProduct,
      id: products[index].id // Preserve original ID (immutable)
    });
    
    // Validate the updated product
    const validation = validateProduct(productToUpdate, products, false);
    if (!validation.valid) {
      const errorMessages = Object.entries(validation.errors)
        .map(([field, error]) => `${field}: ${error}`)
        .join(', ');
      throw new Error(`Product validation failed: ${errorMessages}`);
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
    const filteredProducts = products.filter(p => p.id !== id);
    await this.saveProducts(filteredProducts);
    return filteredProducts;
  }
}

export default ProductService;
