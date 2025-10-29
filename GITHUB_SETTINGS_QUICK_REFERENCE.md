# GitHub Settings - Quick Reference Guide

## Quick Start (30 seconds)

1. **Start the app:**
   ```bash
   npm run electron:dev
   ```

2. **Open Settings:**
   - Click "Settings" in the menu bar

3. **Configure GitHub:**
   - Repository URL: `https://github.com/username/repo`
   - Username: `your-username`
   - Token: Get from https://github.com/settings/tokens (needs `repo` scope)
   - Project Path: Click "Browse" → select Git repository folder

4. **Test & Save:**
   - Click "Test Connection" (should show ✓ success)
   - Click "Save Settings"
   - Click "← Back" to return

## Config File Location

**Windows:** `%APPDATA%\SakrStoreManager\config.json`
**macOS:** `~/Library/Application Support/SakrStoreManager/config.json`
**Linux:** `~/.config/SakrStoreManager/config.json`

## Creating GitHub Personal Access Token

1. Go to https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Give it a descriptive name: "Sakr Store Manager"
4. Select scopes: ✅ **repo** (full control of private repositories)
5. Click "Generate token"
6. **Copy the token immediately** (you won't see it again!)
7. Paste into Settings → Personal Access Token field

## API Usage in Code

### Save Settings
```javascript
const result = await window.electron.saveSettings({
  repoUrl: 'https://github.com/user/repo',
  username: 'johndoe',
  token: 'ghp_abc123...',
  projectPath: 'C:/projects/my-repo'
});

if (result.success) {
  console.log('Settings saved!');
}
```

### Load Settings
```javascript
const config = await window.electron.loadSettings();
console.log(config);
// {
//   repoUrl: "...",
//   username: "...",
//   token: "••••••••",  // Masked!
//   hasToken: true,
//   projectPath: "..."
// }
```

### Browse Directory
```javascript
const path = await window.electron.browseDirectory();
if (path) {
  console.log('Selected:', path);
}
```

### Test Connection
```javascript
const result = await window.electron.testConnection(config);
if (result.success) {
  alert(result.message); // "Successfully connected!"
} else {
  alert(result.message); // Error details
}
```

## Using ConfigService (Main Process)

```javascript
import { getConfigService } from './services/configService.js';

const configService = getConfigService();

// Save
configService.saveConfig({ repoUrl: '...', username: '...', token: '...', projectPath: '...' });

// Load for display (token masked)
const config = configService.getConfigForDisplay();

// Load with decrypted token (for operations)
const fullConfig = configService.getConfigWithToken();

// Update specific fields
configService.updateConfig({ username: 'newname' });

// Check if exists
if (configService.hasConfig()) { /* ... */ }

// Get path
console.log(configService.getConfigPath());
```

## Using GitService (Main Process)

```javascript
import GitService from './services/gitService.js';

const gitService = new GitService('/path/to/repo', {
  username: 'johndoe',
  token: 'ghp_abc123...',
  repoUrl: 'https://github.com/user/repo'
});

// Check if valid Git repo
const isRepo = await gitService.isRepository();

// Test connection
const result = await gitService.testConnection();

// Get status
const status = await gitService.getStatus();

// Get remotes
const remotes = await gitService.getRemotes();
```

## Encryption Utilities

```javascript
import { encryptToken, decryptToken, isEncrypted } from './utils/encryption.js';

// Encrypt
const encrypted = encryptToken('ghp_abc123...');

// Decrypt
const original = decryptToken(encrypted);

// Check if encrypted
if (isEncrypted(data)) { /* ... */ }
```

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "Config file not found" | Save settings to create initial config |
| "Failed to decrypt token" | Delete config.json and re-enter credentials |
| "Not a valid Git repository" | Select folder with `.git` directory |
| "Authentication failed" | Verify token has `repo` scope and hasn't expired |
| Settings not persisting | Check app has write permissions to user data directory |

## Security Notes

✅ **Token is encrypted** - Uses AES-256-GCM encryption
✅ **Never in plain text** - Stored securely in config.json
✅ **Masked in UI** - Shows as `••••••••` when loaded
✅ **Secure storage** - OS-specific user data directory

⚠️ **Keep token safe** - Don't commit config.json to Git
⚠️ **Minimal scopes** - Only grant required permissions
⚠️ **Regenerate if exposed** - Create new token immediately

## Testing Checklist

- [ ] Can open Settings from menu
- [ ] Can fill in all form fields
- [ ] Browse button opens directory picker
- [ ] Test Connection validates credentials
- [ ] Save Settings creates config.json
- [ ] Token is encrypted in config.json
- [ ] Settings persist after app restart
- [ ] Token is masked when reloading Settings
- [ ] Can update settings without re-entering token
- [ ] Back button returns to main view

## Files Modified/Created

**Created:**
- `src/utils/encryption.js`
- `src/services/configService.js`
- `src/services/gitService.js`
- `src/components/Settings.jsx`
- `src/components/Settings.css`

**Modified:**
- `electron/main.js` (added IPC handlers)
- `electron/preload.js` (exposed settings API)
- `src/App.jsx` (added view routing)

## Dependencies

```json
{
  "simple-git": "^3.28.0"  // ✅ Already installed
}
```

## Config File Structure

```json
{
  "repoUrl": "https://github.com/user/repo",
  "username": "johndoe",
  "encryptedToken": "eyJpdiI6IjEyMzQ1Njc4OTBhYmNkZWYi...",
  "projectPath": "C:/projects/my-repo",
  "lastUpdated": "2025-10-29T12:34:56.789Z",
  "version": "1.0"
}
```

**Note:** `encryptedToken` is NOT plain text - it's encrypted with AES-256-GCM!

## Next Steps

After configuring GitHub settings:
1. ✅ Settings are saved securely
2. 🚧 Implement Git commit functionality
3. 🚧 Add push/pull operations
4. 🚧 Create auto-sync on product changes

---

**Status:** ✅ Ready for testing
**Last Updated:** October 29, 2025
