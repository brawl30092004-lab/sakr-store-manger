# GitHub Flow Implementation - Complete Guide

## Overview
The GitHub flow has been fully implemented, allowing users to work with their product data stored in a GitHub repository. The implementation follows a clone-edit-publish workflow where all edits are done locally and synced to GitHub on demand.

---

## Implementation Date
November 1, 2025

---

## How It Works

### User Flow

#### 1. **Select GitHub Mode**
- User opens Settings
- Selects "GitHub Repository" in Data Source Selector
- A setup notice appears explaining the requirements

#### 2. **Configure GitHub Settings**
User must provide:
- **Repository URL**: `https://github.com/username/repository-name`
- **GitHub Username**: Their GitHub account username
- **Personal Access Token**: Token with 'repo' permissions
- **Local Project Path**: Where to clone/store the repository locally

#### 3. **Save and Clone**
When user clicks "Save Settings":
- System checks if the local path already has a git repository
- If not, it clones the repository from GitHub to the local path
- The clone includes `products.json` and `images/` folder from the root of the repo
- Progress feedback is shown during cloning

#### 4. **Work Locally**
- User edits products (add, update, delete)
- Changes are saved to the local clone immediately
- No automatic GitHub sync occurs
- Deleted product images are removed from local `images/` folder

#### 5. **Publish to GitHub**
When user clicks "Publish to GitHub":
- Step 1: Pulls latest changes from GitHub (merge remote changes)
- Step 2: Commits all local changes (uses `git add -A` to include deletions)
- Step 3: Pushes to GitHub with authentication
- Final result: GitHub repo is an exact replica of local copy

---

## Key Features

### ✅ Repository Cloning
- Automatically clones the repository when first setting up GitHub mode
- Uses authenticated HTTPS clone with Personal Access Token
- Validates repository existence before cloning

### ✅ Local Git Operations
- All work is done on a local clone of the repository
- `products.json` is at the root of the repository
- `images/` folder is at the root of the repository
- File operations use standard Electron IPC (same as local mode)

### ✅ Smart Sync
- Pull before commit to avoid conflicts
- Stage ALL changes including deletions (`git add -A`)
- Auto-generates commit messages based on changes
- Temporary credential injection for secure push

### ✅ Image Management
- Images saved to `images/` folder in local clone
- Deleted images are removed from local copy
- On publish, deletions sync to GitHub
- GitHub repo mirrors local state exactly

### ✅ Security
- GitHub tokens are encrypted in config
- Credentials temporarily added to remote URL during push
- Original remote URL restored after push
- No credentials persisted in git config

---

## Technical Implementation

### Files Modified

#### 1. **GitService** (`src/services/gitService.js`)
**Added:**
- `static async cloneRepository(targetPath, repoUrl, username, token)`
  - Clones a GitHub repository to local directory
  - Uses authenticated HTTPS URL
  - Returns success/error result

**Updated:**
- `async commitChanges(message)` - Changed from `git add .` to `git add -A`
  - Now properly stages deleted files
  - Ensures exact sync with GitHub

#### 2. **ProductService** (`src/services/productService.js`)
**Updated:**
- `async loadProductsFromGitHub()`
  - Changed from throwing error to loading from local clone
  - Uses same file system operations as local mode
  - Works with cloned repository directory

#### 3. **Settings Component** (`src/components/Settings.jsx`)
**Added:**
- `isCloning` state for clone operation feedback
- `handleGitHubSetup()` function
  - Checks if repository exists
  - Clones if needed
  - Validates setup

**Updated:**
- `handleSave()` - Calls GitHub setup before saving in GitHub mode
- Button states show "Cloning Repository..." during clone
- Help text adapts based on data source mode
- Setup notice displayed when GitHub mode selected without config

#### 4. **DataSourceSelector** (`src/components/DataSourceSelector.jsx`)
**Removed:**
- "Coming Soon" badge from GitHub option
- Placeholder text

**Updated:**
- Info message explains GitHub clone-and-sync workflow

#### 5. **Electron Main Process** (`electron/main.js`)
**Added:**
- `git:clone` IPC handler
  - Receives clone parameters from renderer
  - Calls GitService.cloneRepository()
  - Returns result to UI

**Updated:**
- `fs:checkProjectPath` handler
  - Now also checks if path is a git repository
  - Returns `hasGitRepo` flag

#### 6. **Preload Script** (`electron/preload.js`)
**Added:**
- `cloneRepository(targetPath, repoUrl, username, token)` API
  - Exposes clone functionality to renderer process

---

## Repository Structure

When using GitHub mode, the repository must have this structure:

```
repository-root/
├── .git/                  # Git repository metadata
├── products.json          # Product data (root level)
├── images/                # Product images (root level)
│   ├── product-1-primary.jpg
│   ├── product-1-primary.webp
│   ├── product-1-primary.avif
│   ├── product-2-primary.jpg
│   └── ...
└── (other files)          # Other repo files (ignored by app)
```

**Important:**
- `products.json` must be in the root (not in subfolders)
- `images/` folder must be in the root (not in subfolders)
- The app only works with these two items
- Other files in the repo are unaffected

---

## Workflow Examples

### First Time Setup

```
1. User selects "GitHub Repository" mode
2. User enters:
   - Repo URL: https://github.com/user/store-data
   - Username: user
   - Token: ghp_xxxxxxxxxxxx
   - Path: C:\Users\User\Documents\store-data
3. User clicks "Save Settings"
4. System clones repository to C:\Users\User\Documents\store-data
5. User can now work with products
```

### Making Changes

```
1. User adds/edits/deletes products
2. Changes saved to local clone immediately
3. Images added to local images/ folder
4. Deleted product images removed from local images/ folder
5. All changes are local only (not yet on GitHub)
```

### Publishing Changes

```
1. User clicks "Publish to GitHub" button
2. System pulls latest from GitHub
3. System commits all changes:
   - Modified products.json
   - New images
   - Deleted images
4. System pushes to GitHub
5. GitHub repo now matches local copy exactly
```

### Deleting Products with Images

```
1. User deletes Product #5
2. Local system:
   - Removes product from products.json
   - Deletes images/product-5-primary.* files
   - Deletes images/product-5-gallery-*.* files
3. User clicks "Publish to GitHub"
4. System:
   - Stages deletions (git add -A)
   - Commits: "Update products via Store Manager: Deleted 4 file(s)"
   - Pushes to GitHub
5. GitHub repo:
   - Product #5 removed from products.json
   - All Product #5 images deleted
```

---

## Error Handling

### Clone Errors
- Invalid repository URL → Shows error message
- Authentication failure → Shows "Invalid token" message
- Network error → Shows "Check internet connection" message
- Path already exists → Validates if it's a git repo, skips clone if valid

### Publish Errors
- Merge conflicts → Reports conflict files, asks user to resolve manually
- No internet → Shows network error
- Authentication failure → Shows token validation error
- No changes → Shows "Already up to date" message

---

## Testing Guide

### Test 1: First Setup
1. Select GitHub mode in Settings
2. Enter valid GitHub credentials
3. Choose empty local folder
4. Save settings
5. ✅ Repository should be cloned
6. ✅ products.json should be visible
7. ✅ images/ folder should be visible

### Test 2: Add Product
1. Add a new product with image
2. Save changes
3. ✅ Product appears in list
4. ✅ Image saved to local images/ folder
5. Click "Publish to GitHub"
6. ✅ Check GitHub repo - new product and images should be there

### Test 3: Delete Product
1. Delete a product that has images
2. Save changes
3. ✅ Product removed from list
4. ✅ Images deleted from local images/ folder
5. Click "Publish to GitHub"
6. ✅ Check GitHub repo - product and images should be deleted

### Test 4: Edit Product
1. Edit product details (name, price, etc.)
2. Save changes
3. Click "Publish to GitHub"
4. ✅ Check GitHub repo - changes should be reflected

### Test 5: Exact Sync
1. Make multiple changes:
   - Add 2 products
   - Delete 1 product
   - Edit 1 product
   - Add images to gallery
2. Click "Publish to GitHub"
3. ✅ Check GitHub repo - should exactly match local state

---

## API Reference

### Electron IPC

```javascript
// Clone a repository
window.electron.cloneRepository(targetPath, repoUrl, username, token)
// Returns: { success: boolean, message: string, path?: string, error?: string }

// Check project path
window.electron.fs.checkProjectPath(projectPath)
// Returns: { exists: boolean, isDirectory: boolean, hasGitRepo: boolean, error: string|null }

// Publish changes
window.electron.publishToGitHub(commitMessage?)
// Returns: { success: boolean, message: string, results: {...} }
```

### GitService Methods

```javascript
// Static clone method
GitService.cloneRepository(targetPath, repoUrl, username, token)

// Instance methods
gitService.commitChanges(message?) // Stages with git add -A
gitService.pullLatestChanges(branch?)
gitService.pushToGitHub(branch?, username?, token?)
gitService.publishChanges(commitMessage?) // Full workflow
```

---

## Configuration

### GitHub Token Permissions
Required scopes:
- ✅ `repo` - Full control of private repositories

Generate at: https://github.com/settings/tokens

### Local Storage
Settings stored in app config (encrypted):
- `repoUrl`
- `username`
- `token` (encrypted)
- `projectPath`

---

## Troubleshooting

### Repository Won't Clone
- Check internet connection
- Verify repository URL is correct
- Ensure token has 'repo' permissions
- Check local path is writable

### Can't Publish Changes
- Ensure git repository exists in local path
- Check GitHub credentials are valid
- Verify internet connection
- Check for merge conflicts

### Images Not Syncing
- Verify images/ folder exists in repository root
- Check file permissions
- Ensure git is tracking the images folder
- Verify .gitignore doesn't exclude images

---

## Future Enhancements

Potential improvements:
- Branch selection support
- Conflict resolution UI
- Offline mode with queue
- Multiple repository support
- Pull request creation
- Sync status indicator

---

## Summary

The GitHub flow is now **fully functional** and provides:
✅ Easy setup with guided wizard
✅ Automatic repository cloning
✅ Local editing with no auto-sync
✅ One-click publish to GitHub
✅ Exact sync (deletions included)
✅ Secure token handling
✅ Error handling and feedback

Users can confidently use GitHub mode to manage their product catalog with full version control and cloud backup.
