import crypto from 'crypto';

/**
 * Encryption utility for securing sensitive data like GitHub Personal Access Tokens
 * Uses AES-256-GCM encryption with a machine-specific master password
 */

// Generate a machine-specific master password
// In production, you might want to use a combination of machine ID, app version, etc.
const MASTER_PASSWORD = 'SakrStoreManager_2024_Secret_Key_v1.0';

// Derive a 32-byte key from the master password
function deriveKey(password) {
  return crypto.scryptSync(password, 'salt', 32);
}

/**
 * Encrypts a token using AES-256-GCM
 * @param {string} token - The plain text token to encrypt
 * @param {string} [masterPassword=MASTER_PASSWORD] - The master password for encryption
 * @returns {string} - Base64 encoded encrypted data with IV and auth tag
 */
export function encryptToken(token, masterPassword = MASTER_PASSWORD) {
  if (!token) {
    throw new Error('Token is required for encryption');
  }

  try {
    // Generate a random initialization vector
    const iv = crypto.randomBytes(16);
    
    // Derive encryption key from master password
    const key = deriveKey(masterPassword);
    
    // Create cipher
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    
    // Encrypt the token
    let encrypted = cipher.update(token, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Get the authentication tag
    const authTag = cipher.getAuthTag();
    
    // Combine IV, auth tag, and encrypted data into a single string
    const combined = {
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex'),
      encryptedData: encrypted
    };
    
    // Return as base64 encoded JSON
    return Buffer.from(JSON.stringify(combined)).toString('base64');
  } catch (error) {
    throw new Error(`Encryption failed: ${error.message}`);
  }
}

/**
 * Decrypts a token using AES-256-GCM
 * @param {string} encryptedData - Base64 encoded encrypted data with IV and auth tag
 * @param {string} [masterPassword=MASTER_PASSWORD] - The master password for decryption
 * @returns {string} - The decrypted plain text token
 */
export function decryptToken(encryptedData, masterPassword = MASTER_PASSWORD) {
  if (!encryptedData) {
    throw new Error('Encrypted data is required for decryption');
  }

  try {
    // Decode the base64 string
    const combined = JSON.parse(Buffer.from(encryptedData, 'base64').toString('utf8'));
    
    // Extract components
    const iv = Buffer.from(combined.iv, 'hex');
    const authTag = Buffer.from(combined.authTag, 'hex');
    const encrypted = combined.encryptedData;
    
    // Derive decryption key from master password
    const key = deriveKey(masterPassword);
    
    // Create decipher
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);
    
    // Decrypt the token
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  } catch (error) {
    throw new Error(`Decryption failed: ${error.message}`);
  }
}

/**
 * Validates if a string appears to be encrypted data
 * @param {string} data - The data to validate
 * @returns {boolean} - True if data appears to be encrypted
 */
export function isEncrypted(data) {
  if (!data || typeof data !== 'string') {
    return false;
  }
  
  try {
    const decoded = Buffer.from(data, 'base64').toString('utf8');
    const parsed = JSON.parse(decoded);
    return parsed.iv && parsed.authTag && parsed.encryptedData;
  } catch {
    return false;
  }
}
