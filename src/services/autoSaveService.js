/**
 * Auto-Save Service
 * Manages auto-saving form state to localStorage for draft recovery
 */

const DRAFT_KEY_PREFIX = 'product_draft_';
const DRAFT_TIMESTAMP_KEY = 'draft_timestamp_';
const AUTO_SAVE_INTERVAL = 30000; // 30 seconds

/**
 * Save form state as a draft
 * @param {number|string} productId - Product ID (use 'new' for new products)
 * @param {Object} formData - Form data to save
 */
export const saveDraft = (productId, formData) => {
  try {
    const draftKey = `${DRAFT_KEY_PREFIX}${productId}`;
    const timestampKey = `${DRAFT_TIMESTAMP_KEY}${productId}`;
    
    localStorage.setItem(draftKey, JSON.stringify(formData));
    localStorage.setItem(timestampKey, Date.now().toString());
    
    console.log(`Draft saved for product ${productId}`);
  } catch (error) {
    console.error('Failed to save draft:', error);
  }
};

/**
 * Load draft for a product
 * @param {number|string} productId - Product ID (use 'new' for new products)
 * @returns {Object|null} Draft data or null if not found
 */
export const loadDraft = (productId) => {
  try {
    const draftKey = `${DRAFT_KEY_PREFIX}${productId}`;
    const timestampKey = `${DRAFT_TIMESTAMP_KEY}${productId}`;
    
    const draft = localStorage.getItem(draftKey);
    const timestamp = localStorage.getItem(timestampKey);
    
    if (draft && timestamp) {
      return {
        data: JSON.parse(draft),
        timestamp: parseInt(timestamp, 10)
      };
    }
    
    return null;
  } catch (error) {
    console.error('Failed to load draft:', error);
    return null;
  }
};

/**
 * Clear draft for a product
 * @param {number|string} productId - Product ID (use 'new' for new products)
 */
export const clearDraft = (productId) => {
  try {
    const draftKey = `${DRAFT_KEY_PREFIX}${productId}`;
    const timestampKey = `${DRAFT_TIMESTAMP_KEY}${productId}`;
    
    localStorage.removeItem(draftKey);
    localStorage.removeItem(timestampKey);
    
    console.log(`Draft cleared for product ${productId}`);
  } catch (error) {
    console.error('Failed to clear draft:', error);
  }
};

/**
 * Check if a draft exists for a product
 * @param {number|string} productId - Product ID (use 'new' for new products)
 * @returns {boolean} True if draft exists
 */
export const hasDraft = (productId) => {
  const draftKey = `${DRAFT_KEY_PREFIX}${productId}`;
  return localStorage.getItem(draftKey) !== null;
};

/**
 * Get all draft product IDs
 * @returns {Array} Array of product IDs with drafts
 */
export const getAllDraftIds = () => {
  const draftIds = [];
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith(DRAFT_KEY_PREFIX)) {
      const id = key.replace(DRAFT_KEY_PREFIX, '');
      draftIds.push(id);
    }
  }
  
  return draftIds;
};

/**
 * Start auto-save timer
 * @param {number|string} productId - Product ID
 * @param {Function} getFormData - Function that returns current form data
 * @returns {number} Timer ID for cleanup
 */
export const startAutoSave = (productId, getFormData) => {
  const timerId = setInterval(() => {
    const formData = getFormData();
    if (formData) {
      saveDraft(productId, formData);
    }
  }, AUTO_SAVE_INTERVAL);
  
  console.log(`Auto-save started for product ${productId}`);
  return timerId;
};

/**
 * Stop auto-save timer
 * @param {number} timerId - Timer ID returned from startAutoSave
 */
export const stopAutoSave = (timerId) => {
  if (timerId) {
    clearInterval(timerId);
    console.log('Auto-save stopped');
  }
};

/**
 * Format timestamp for display
 * @param {number} timestamp - Unix timestamp
 * @returns {string} Formatted date/time string
 */
export const formatDraftTimestamp = (timestamp) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  
  if (diffMins < 1) {
    return 'just now';
  } else if (diffMins < 60) {
    return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  } else {
    return date.toLocaleString();
  }
};
