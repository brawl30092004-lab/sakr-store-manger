# GitHub Clone Consistency Fix

## Problem Description

When using GitHub mode and successfully saving settings, the application behavior was inconsistent:
- **Sometimes** it would clone the repository
- **Other times** it would save without cloning

This created confusion and unpredictable behavior for users.

## Root Cause

The issue occurred when users re-saved GitHub settings after the initial setup:

1. **First Save** (Token provided):
   - User enters repo URL, username, token, and project path
   - Settings are saved, token is encrypted and stored
   - Repository is cloned successfully ✓
   - Token field is masked as `'••••••••'` in the UI

2. **Subsequent Save** (Token masked):
   - User changes some setting (e.g., repo URL or project path)
   - Token field shows `'••••••••'` (masked)
   - When attempting to clone:
     - Frontend checked if token was masked: `formData.token !== '••••••••'`
     - If masked, it passed `null` as the token
     - Backend `git:clone` handler required a token
     - **ERROR**: "GitHub token is required to clone the repository"
     - Clone would fail, but settings would still save

3. **Why It "Sometimes" Worked**:
   - If the project path already existed AND was a git repository → No clone needed ✓
   - If the project path didn't exist OR wasn't a git repo → Clone attempted with `null` token → FAILED ✗

## Solution Implemented

### Backend Fix (electron/main.cjs)

Modified the `git:clone` IPC handler to automatically retrieve the stored encrypted token when none is provided:

```javascript
ipcMain.handle('git:clone', async (event, targetPath, repoUrl, username, token) => {
  // If no token is provided, try to get it from stored config
  if (!token) {
    console.log('No token provided, attempting to retrieve from stored config...');
    try {
      const { getConfigService } = await import('../src/services/configService.js');
      const configService = getConfigService();
      const storedConfig = configService.getConfigWithToken();
      
      if (storedConfig && storedConfig.token) {
        token = storedConfig.token;
        console.log('Retrieved token from stored config (length: ' + token.length + ')');
      } else {
        return {
          success: false,
          message: 'GitHub token is required to clone the repository. Please provide a valid token.'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'GitHub token is required to clone the repository. Please provide a valid token.'
      };
    }
  }
  
  // Continue with clone operation...
});
```

### Frontend Fix (src/components/Settings.jsx)

Updated the `handleGitHubSetup` function to pass `null` when token is masked, allowing the backend to retrieve it:

```javascript
const handleGitHubSetup = async (configToSave) => {
  // Check if repository already exists
  const pathCheck = await window.electron.fs.checkProjectPath(configToSave.projectPath);
  
  if (pathCheck.exists && pathCheck.hasGitRepo) {
    // Repository already exists, skip cloning
    return { success: true, alreadyExists: true };
  }

  // Get the token (either from form or let backend use stored token)
  // If token is masked, pass null and backend will retrieve the stored token
  const tokenToUse = (formData.token && formData.token !== '••••••••') ? formData.token : null;
  
  console.log('Attempting to clone repository. Token provided:', tokenToUse ? 'YES' : 'NO (will use stored)');

  const cloneResult = await window.electron.cloneRepository(
    configToSave.projectPath,
    configToSave.repoUrl,
    configToSave.username,
    tokenToUse  // Can be null - backend will retrieve stored token
  );
  
  // Handle result...
};
```

## Behavior After Fix

### Scenario 1: First Time Setup
1. User enters all GitHub settings including token
2. Settings are saved and encrypted
3. Repository is cloned to project path ✓
4. Token is masked in UI as `'••••••••'`

### Scenario 2: Re-saving with Existing Repository
1. User modifies settings (e.g., changes repo URL)
2. Token is masked (`'••••••••'`)
3. System checks if project path has a git repository
4. **If yes**: Skip cloning, just save settings ✓
5. **If no**: Retrieve stored token and clone repository ✓

### Scenario 3: Changing Project Path
1. User changes project path to a new location
2. Token is masked (`'••••••••'`)
3. System checks if new path has a git repository
4. New path doesn't exist or isn't a git repo
5. Backend retrieves stored encrypted token
6. Repository is cloned to new location ✓

## Benefits

1. **Consistent Behavior**: Repository cloning now works reliably every time it's needed
2. **Better UX**: Users don't need to re-enter their token for subsequent operations
3. **Security Maintained**: Token remains encrypted in storage
4. **Smart Detection**: Only clones when necessary (path doesn't exist or isn't a git repo)

## Testing Recommendations

1. **Test First Time Setup**:
   - Enter new GitHub settings with token
   - Verify repository is cloned successfully
   - Verify token is masked after save

2. **Test Re-save with Existing Repo**:
   - Change a setting (e.g., username)
   - Save settings
   - Verify no clone attempt is made (repo already exists)

3. **Test Changing Project Path**:
   - Change project path to a new location
   - Save settings
   - Verify repository is cloned to new location using stored token

4. **Test No Stored Token**:
   - Delete config file
   - Try to save settings without entering token
   - Verify appropriate error message is shown

## Files Modified

- `electron/main.cjs` - Added token retrieval fallback to `git:clone` handler
- `src/components/Settings.jsx` - Updated `handleGitHubSetup` to work with masked tokens

## Related Documentation

- [GitHub Settings Implementation](GITHUB_SETTINGS_IMPLEMENTATION.md)
- [GitHub Flow Testing Guide](GITHUB_FLOW_TESTING_GUIDE.md)
- [Configuration Service](../src/services/configService.js)
