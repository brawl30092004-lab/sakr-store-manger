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
   * @param {Array} products - Array of product objects to save
   * @returns {Promise<void>}
   * @throws {Error} If writing fails
   */
  async saveProducts(products) {
    try {
      await window.electron.fs.saveProducts(this.projectPath, products);
    } catch (error) {
      console.error('ProductService: Error saving products', error);
      throw error;
    }
  }

  /**
   * Add a new product
   * @param {Object} product - Product object to add
   * @returns {Promise<Array>} Updated products array
   */
  async addProduct(product) {
    const products = await this.loadProducts();
    products.push(product);
    await this.saveProducts(products);
    return products;
  }

  /**
   * Update an existing product
   * @param {string} id - Product ID to update
   * @param {Object} updatedProduct - Updated product data
   * @returns {Promise<Array>} Updated products array
   */
  async updateProduct(id, updatedProduct) {
    const products = await this.loadProducts();
    const index = products.findIndex(p => p.id === id);
    if (index !== -1) {
      products[index] = { ...products[index], ...updatedProduct };
      await this.saveProducts(products);
    }
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
