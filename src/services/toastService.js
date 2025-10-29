/**
 * Toast Notification Service
 * Provides a unified interface for displaying toast notifications
 * Uses react-hot-toast library
 */

import toast from 'react-hot-toast';
import { getUserFriendlyError } from '../utils/errorHandler.js';

/**
 * Toast configuration options
 */
const defaultOptions = {
  duration: 4000,
  position: 'bottom-right',
  style: {
    borderRadius: '8px',
    fontSize: '14px',
  },
};

/**
 * Show a success toast notification
 * @param {string} message - Success message to display
 * @param {object} options - Additional toast options
 */
export function showSuccess(message, options = {}) {
  toast.success(message, {
    ...defaultOptions,
    ...options,
    icon: '✅',
    style: {
      ...defaultOptions.style,
      background: '#10b981',
      color: '#fff',
      ...options.style,
    },
  });
}

/**
 * Show an error toast notification
 * @param {Error|string} error - Error object or message to display
 * @param {object} options - Additional toast options
 */
export function showError(error, options = {}) {
  const message = getUserFriendlyError(error);
  
  toast.error(message, {
    ...defaultOptions,
    duration: 6000, // Errors show longer
    ...options,
    icon: '❌',
    style: {
      ...defaultOptions.style,
      background: '#ef4444',
      color: '#fff',
      ...options.style,
    },
  });
}

/**
 * Show a warning toast notification
 * @param {string} message - Warning message to display
 * @param {object} options - Additional toast options
 */
export function showWarning(message, options = {}) {
  toast(message, {
    ...defaultOptions,
    duration: 5000,
    ...options,
    icon: '⚠️',
    style: {
      ...defaultOptions.style,
      background: '#f59e0b',
      color: '#fff',
      ...options.style,
    },
  });
}

/**
 * Show an info toast notification
 * @param {string} message - Info message to display
 * @param {object} options - Additional toast options
 */
export function showInfo(message, options = {}) {
  toast(message, {
    ...defaultOptions,
    ...options,
    icon: 'ℹ️',
    style: {
      ...defaultOptions.style,
      background: '#3b82f6',
      color: '#fff',
      ...options.style,
    },
  });
}

/**
 * Show a loading toast notification
 * Returns a toast ID that can be used to dismiss or update the toast
 * @param {string} message - Loading message to display
 * @param {object} options - Additional toast options
 * @returns {string} Toast ID
 */
export function showLoading(message, options = {}) {
  return toast.loading(message, {
    ...defaultOptions,
    ...options,
  });
}

/**
 * Dismiss a specific toast by ID
 * @param {string} toastId - Toast ID to dismiss
 */
export function dismissToast(toastId) {
  toast.dismiss(toastId);
}

/**
 * Dismiss all active toasts
 */
export function dismissAll() {
  toast.dismiss();
}

/**
 * Update an existing toast
 * @param {string} toastId - Toast ID to update
 * @param {object} options - New toast options
 */
export function updateToast(toastId, options) {
  toast.dismiss(toastId);
  if (options.type === 'success') {
    showSuccess(options.message, options);
  } else if (options.type === 'error') {
    showError(options.message, options);
  } else if (options.type === 'warning') {
    showWarning(options.message, options);
  } else {
    showInfo(options.message, options);
  }
}

/**
 * Show a promise toast - shows loading, then success or error based on promise result
 * @param {Promise} promise - Promise to track
 * @param {object} messages - Object with loading, success, and error messages
 * @param {object} options - Additional toast options
 */
export function showPromise(promise, messages, options = {}) {
  return toast.promise(
    promise,
    {
      loading: messages.loading || 'Loading...',
      success: messages.success || 'Success!',
      error: (err) => getUserFriendlyError(err),
    },
    {
      ...defaultOptions,
      ...options,
    }
  );
}

// Pre-configured toast messages for common operations
export const ToastMessages = {
  // Product operations
  PRODUCT_SAVED: 'Product saved successfully.',
  PRODUCT_DELETED: 'Product deleted successfully.',
  PRODUCT_UPDATED: 'Product updated successfully.',
  PRODUCT_LOADED: 'Products loaded successfully.',
  
  // GitHub operations
  GITHUB_PUBLISHED: 'Published to GitHub!',
  GITHUB_CONNECTED: 'Connected to GitHub successfully.',
  GITHUB_DISCONNECTED: 'Disconnected from GitHub.',
  GITHUB_PULLING: 'Pulling changes from GitHub...',
  GITHUB_PULLED: 'Changes pulled from GitHub successfully.',
  GITHUB_PUSHING: 'Publishing to GitHub...',
  
  // Image operations
  IMAGE_UPLOADED: 'Image uploaded successfully.',
  IMAGE_DELETED: 'Image deleted successfully.',
  IMAGE_PROCESSING: 'Processing image...',
  IMAGE_NOT_SQUARE: 'Image is not square. Product cards display best with square images.',
  
  // Settings operations
  SETTINGS_SAVED: 'Settings saved successfully.',
  SETTINGS_LOADED: 'Settings loaded successfully.',
  
  // Validation warnings
  VALIDATION_WARNING: 'Please check the form for errors.',
  
  // Git operations
  GIT_INITIALIZED: 'Git repository initialized successfully.',
  GIT_COMMIT: 'Changes committed successfully.',
};

export default {
  showSuccess,
  showError,
  showWarning,
  showInfo,
  showLoading,
  dismissToast,
  dismissAll,
  updateToast,
  showPromise,
  ToastMessages,
};
