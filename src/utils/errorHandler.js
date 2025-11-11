/**
 * Error Handler Utility
 * Maps technical error codes/messages to user-friendly messages
 */

/**
 * Error code mappings to user-friendly messages
 */
const ERROR_MESSAGES = {
  // File System Errors
  ENOENT: "File not found. Please check the project path.",
  EACCES: "Permission denied. Check folder permissions.",
  EPERM: "Operation not permitted. Check your permissions.",
  EISDIR: "Expected a file but found a directory.",
  ENOTDIR: "Expected a directory but found a file.",
  EEXIST: "File or folder already exists.",
  ENOSPC: "No space left on device.",
  
  // Store Sync Errors
  AUTHENTICATION_FAILED: "Store authentication failed. Check your token.",
  AUTH_FAILED: "Store authentication failed. Check your token.",
  UNAUTHORIZED: "Store authentication failed. Check your token.",
  FORBIDDEN: "Access forbidden. Check your store permissions.",
  NOT_FOUND: "Repository not found. Check your repository settings.",
  CONFLICT: "Your local changes conflict with the current store version. Please choose which version to keep.",
  MERGE_CONFLICT: "Your local changes conflict with the current store version. Please choose which version to keep.",
  NETWORK_ERROR: "Cannot connect to your online store. Please check your internet connection.",
  RATE_LIMIT: "Store rate limit exceeded. Please try again later.",
  
  // Image Errors
  FILE_TOO_LARGE: "Image file is too large (max 10 MB).",
  INVALID_FILE_TYPE: "Invalid file type. Please upload a valid image file (JPEG, PNG, WebP, AVIF).",
  IMAGE_LOAD_FAILED: "Failed to load image. The file may be corrupted.",
  IMAGE_PROCESSING_FAILED: "Failed to process image. Please try a different file.",
  
  // Validation Errors
  VALIDATION_ERROR: "Validation failed. Please check your input.",
  REQUIRED_FIELD: "This field is required.",
  INVALID_FORMAT: "Invalid format. Please check your input.",
  
  // Git Errors
  GIT_NOT_INSTALLED: "Git is not installed. Please install Git to use store sync features.",
  GIT_NOT_FOUND: "Git is not installed. Please install Git to use store sync features.",
  GIT_NOT_INITIALIZED: "Store repository not initialized. Please configure in Settings.",
  GIT_OPERATION_FAILED: "Store sync operation failed. Please try again.",
  PUSH_FAILED: "Failed to publish to your store. Check your connection and permissions.",
  PULL_FAILED: "Failed to get updates from your store. Check your connection.",
  COMMIT_FAILED: "Failed to save changes. Please try again.",
  
  // General Errors
  UNEXPECTED_ERROR: "An unexpected error occurred. Please try again.",
  OPERATION_CANCELLED: "Operation cancelled.",
  TIMEOUT: "Operation timed out. Please try again.",
};

/**
 * Get a user-friendly error message from an error object
 * @param {Error|string} error - The error object or message
 * @returns {string} User-friendly error message
 */
export function getUserFriendlyError(error) {
  // If error is a string, return it directly if it's already user-friendly
  if (typeof error === 'string') {
    return error;
  }

  // If error is null or undefined
  if (!error) {
    return ERROR_MESSAGES.UNEXPECTED_ERROR;
  }

  // Extract error code and message
  const errorCode = error.code || error.errno;
  const errorMessage = error.message || String(error);

  // Check for specific error codes first
  if (errorCode && ERROR_MESSAGES[errorCode]) {
    return ERROR_MESSAGES[errorCode];
  }

  // Check for error message patterns
  const messageLower = errorMessage.toLowerCase();

  // File system errors
  if (messageLower.includes('enoent') || messageLower.includes('no such file')) {
    return ERROR_MESSAGES.ENOENT;
  }
  if (messageLower.includes('eacces') || messageLower.includes('permission denied')) {
    return ERROR_MESSAGES.EACCES;
  }
  if (messageLower.includes('eperm')) {
    return ERROR_MESSAGES.EPERM;
  }

  // Store authentication errors
  if (messageLower.includes('authentication failed') || 
      messageLower.includes('auth failed') ||
      messageLower.includes('bad credentials')) {
    return ERROR_MESSAGES.AUTHENTICATION_FAILED;
  }
  if (messageLower.includes('unauthorized') || messageLower.includes('401')) {
    return ERROR_MESSAGES.UNAUTHORIZED;
  }
  if (messageLower.includes('forbidden') || messageLower.includes('403')) {
    return ERROR_MESSAGES.FORBIDDEN;
  }

  // Network errors
  if (messageLower.includes('network') || 
      messageLower.includes('enotfound') ||
      messageLower.includes('econnrefused') ||
      messageLower.includes('econnreset') ||
      messageLower.includes('etimedout')) {
    return ERROR_MESSAGES.NETWORK_ERROR;
  }

  // Store merge conflicts
  if (messageLower.includes('merge conflict') || 
      messageLower.includes('conflict')) {
    return ERROR_MESSAGES.MERGE_CONFLICT;
  }

  // Rate limiting
  if (messageLower.includes('rate limit')) {
    return ERROR_MESSAGES.RATE_LIMIT;
  }

  // Image errors
  if (messageLower.includes('file too large') || 
      messageLower.includes('file size')) {
    return ERROR_MESSAGES.FILE_TOO_LARGE;
  }
  if (messageLower.includes('invalid file type') || 
      messageLower.includes('unsupported format')) {
    return ERROR_MESSAGES.INVALID_FILE_TYPE;
  }

  // Git errors
  if (messageLower.includes('git') && (messageLower.includes('not found') || 
      messageLower.includes('spawn git enoent') ||
      messageLower.includes('command not found') ||
      messageLower.includes('not recognized as an internal or external command'))) {
    return ERROR_MESSAGES.GIT_NOT_INSTALLED;
  }
  if (messageLower.includes('not a git repository') || 
      messageLower.includes('git not initialized')) {
    return ERROR_MESSAGES.GIT_NOT_INITIALIZED;
  }
  if (messageLower.includes('push') && messageLower.includes('failed')) {
    return ERROR_MESSAGES.PUSH_FAILED;
  }
  if (messageLower.includes('pull') && messageLower.includes('failed')) {
    return ERROR_MESSAGES.PULL_FAILED;
  }

  // Validation errors
  if (messageLower.includes('validation')) {
    return ERROR_MESSAGES.VALIDATION_ERROR;
  }

  // Default: return a generic error with the original message if it's short
  if (errorMessage.length < 100) {
    return `An unexpected error occurred: ${errorMessage}`;
  }

  // For very long error messages, just show generic error
  return ERROR_MESSAGES.UNEXPECTED_ERROR;
}

/**
 * Create a standardized error object
 * @param {string} code - Error code
 * @param {string} message - Error message
 * @param {Error} [originalError] - Original error object
 * @returns {Error} Standardized error object
 */
export function createError(code, message, originalError = null) {
  const error = new Error(message);
  error.code = code;
  if (originalError) {
    error.originalError = originalError;
    error.stack = originalError.stack;
  }
  return error;
}

/**
 * Check if an error is a network error
 * @param {Error} error - Error object
 * @returns {boolean} True if network error
 */
export function isNetworkError(error) {
  if (!error) return false;
  const errorMessage = (error.message || '').toLowerCase();
  const errorCode = error.code || '';
  
  return (
    errorMessage.includes('network') ||
    errorMessage.includes('enotfound') ||
    errorMessage.includes('econnrefused') ||
    errorMessage.includes('econnreset') ||
    errorMessage.includes('etimedout') ||
    errorCode === 'ENOTFOUND' ||
    errorCode === 'ECONNREFUSED' ||
    errorCode === 'ECONNRESET' ||
    errorCode === 'ETIMEDOUT'
  );
}

/**
 * Check if an error is an authentication error
 * @param {Error} error - Error object
 * @returns {boolean} True if authentication error
 */
export function isAuthError(error) {
  if (!error) return false;
  const errorMessage = (error.message || '').toLowerCase();
  const errorCode = error.code || '';
  
  return (
    errorMessage.includes('authentication') ||
    errorMessage.includes('unauthorized') ||
    errorMessage.includes('401') ||
    errorMessage.includes('bad credentials') ||
    errorCode === 'UNAUTHORIZED' ||
    errorCode === 'AUTH_FAILED'
  );
}

/**
 * Check if an error is a permission error
 * @param {Error} error - Error object
 * @returns {boolean} True if permission error
 */
export function isPermissionError(error) {
  if (!error) return false;
  const errorMessage = (error.message || '').toLowerCase();
  const errorCode = error.code || '';
  
  return (
    errorMessage.includes('permission denied') ||
    errorMessage.includes('eacces') ||
    errorMessage.includes('eperm') ||
    errorCode === 'EACCES' ||
    errorCode === 'EPERM'
  );
}

export default {
  getUserFriendlyError,
  createError,
  isNetworkError,
  isAuthError,
  isPermissionError,
  ERROR_MESSAGES
};
