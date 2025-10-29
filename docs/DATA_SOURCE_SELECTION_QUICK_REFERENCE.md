# Data Source Selection - Quick Reference Guide

## Quick Start

### Accessing Data Source Settings
1. Click **Settings** in the top menu (or click the File menu)
2. The **Data Source** selector appears at the top of the settings page

## Using Local Files Mode (Default)

### To Load Products from Local Files:
1. In Settings, ensure **"Local Files"** is selected (📁 icon)
2. Click the **Browse** button under "Local Project Path"
3. Navigate to the folder containing your `products.json` file
4. Select the folder
5. Products will load automatically

### Features Available:
- ✅ Load products.json from any local directory
- ✅ Load images from local directory
- ✅ Full CRUD operations (Create, Read, Update, Delete)
- ✅ Image upload and processing
- ✅ Auto-save drafts
- ✅ Export to GitHub
- ✅ All keyboard shortcuts

## Using GitHub Repository Mode (Coming Soon)

### To Enable GitHub Mode:
1. In Settings, select **"GitHub Repository"** (🐙 icon)
2. You'll see a "Coming Soon" badge
3. An information message explains the feature is not yet implemented

### Current Behavior:
- ⚠️ Attempting to load products shows error: "GitHub data source is not yet implemented. Please use Local Files mode."
- 💡 You can still configure GitHub settings for future use
- 🔄 Switch back to "Local Files" to continue working

### When Implemented (Future):
- Load products.json directly from GitHub repository
- Load images from GitHub
- Push changes back to GitHub
- Automatic sync with remote repository

## Switching Between Sources

### To Switch from Local to GitHub:
1. Go to Settings
2. Click the **"GitHub Repository"** option
3. App will attempt to reload products from GitHub
4. If GitHub is not yet ready, you'll see an error message

### To Switch from GitHub to Local:
1. Go to Settings
2. Click the **"Local Files"** option
3. App will reload products from your local directory
4. Normal operations resume

### Important Notes:
- ⚡ **Automatic Reload**: Products reload automatically when you switch sources
- 💾 **Save First**: Save any unsaved changes before switching sources
- 🔄 **State Preserved**: Your local changes remain in memory until reload

## Visual Guide

### Data Source Selector Appearance:

```
┌─────────────────────────────────────────────────────┐
│  Data Source                                        │
│  Choose where to load your products.json from:      │
│                                                      │
│  ┌──────────────────┐  ┌──────────────────────┐    │
│  │ 📁               │  │ 🐙                   │    │
│  │ Local Files      │  │ GitHub Repository    │    │
│  │ Browse and select│  │ Load from GitHub     │    │
│  │ from local system│  │ Coming Soon          │    │
│  └──────────────────┘  └──────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

### Active State:
- **Blue border** around selected option
- **Blue background** highlight
- **Information message** below showing current mode

## Troubleshooting

### "GitHub data source is not yet implemented" Error
**Solution:** Switch back to "Local Files" mode
1. Go to Settings
2. Select "Local Files"
3. Continue working normally

### Products Not Loading After Switch
**Solution:** Check your project path
1. Verify the correct folder is selected
2. Ensure `products.json` exists in that folder
3. Check console for detailed error messages

### Changes Lost After Switching
**Prevention:** 
1. Always save changes before switching sources
2. Use Ctrl+S or click "Save & Close" in product form
3. Check status bar for "Unsaved Changes" indicator

## Keyboard Shortcuts

All existing shortcuts work in both modes:
- `Ctrl+N` - New Product
- `Ctrl+S` - Save Changes
- `Ctrl+F` - Focus Search
- `Delete` - Delete Selected Product
- `Escape` - Close Form/Settings

## Tips & Best Practices

### When Using Local Files:
- 📁 Keep products.json and images folder in the same directory
- 💾 Regularly backup your products.json file
- 🖼️ Use relative paths for images (e.g., "images/product-1.jpg")

### Preparing for GitHub Mode:
- ⚙️ Configure GitHub settings in advance
- 🔑 Generate a Personal Access Token with 'repo' permissions
- 📝 Note your repository URL
- ✅ Test connection using "Test Connection" button

### Performance:
- 🚀 Local mode: Instant loading
- 🌐 GitHub mode (future): Depends on network speed
- 💡 Consider using local mode for rapid development

## Quick Reference Table

| Feature | Local Files | GitHub (Coming Soon) |
|---------|-------------|----------------------|
| Load products.json | ✅ Available | ⏳ Coming Soon |
| Load images | ✅ Available | ⏳ Coming Soon |
| Save changes | ✅ Available | ⏳ Coming Soon |
| Create products | ✅ Available | ⏳ Coming Soon |
| Update products | ✅ Available | ⏳ Coming Soon |
| Delete products | ✅ Available | ⏳ Coming Soon |
| Image upload | ✅ Available | ⏳ Coming Soon |
| Network required | ❌ No | ✅ Yes |
| Setup complexity | Low | Medium |

---

## Need Help?

**For Local Files issues:** Check that your products.json file is valid JSON and properly formatted.

**For GitHub setup:** Visit the GitHub Configuration section in Settings to prepare for future GitHub integration.

**Console Errors:** Open Developer Tools (F12) → Console tab for detailed error messages.
