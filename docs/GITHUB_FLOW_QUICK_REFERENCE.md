# GitHub Flow - Quick Reference

## User Guide

### Setup (First Time)
1. Open Settings
2. Select "GitHub Repository" 
3. Fill in:
   - Repo URL: `https://github.com/username/repo`
   - Username: `your-username`
   - Token: Get from https://github.com/settings/tokens (need 'repo' scope)
   - Path: Choose local folder for clone
4. Click "Save Settings" → Repository clones automatically
5. Done! Start editing products

### Daily Workflow
```
Edit Products → Save → Publish to GitHub
     ↓            ↓              ↓
  Local only  Local only   Syncs to GitHub
```

### Publishing Changes
1. Make changes (add/edit/delete products)
2. Click "Publish to GitHub" button (Ctrl+P)
3. System automatically:
   - Pulls latest from GitHub
   - Commits your changes
   - Pushes to GitHub
4. Done!

---

## Developer Guide

### Key Files Changed
- `src/services/gitService.js` - Added clone functionality, fixed deletions
- `src/services/productService.js` - GitHub mode loads from local clone
- `src/components/Settings.jsx` - Added clone workflow
- `electron/main.js` - Added clone IPC handler
- `electron/preload.js` - Exposed clone API

### Important Functions

**Clone Repository:**
```javascript
await window.electron.cloneRepository(targetPath, repoUrl, username, token)
```

**Publish Changes:**
```javascript
await window.electron.publishToGitHub(commitMessage)
```

**Check Path:**
```javascript
const { exists, isDirectory, hasGitRepo } = await window.electron.fs.checkProjectPath(path)
```

### Git Operations
```javascript
// Commits now use git add -A (includes deletions)
await this.git.add('-A');  // Changed from git.add('.')

// Full publish workflow
publishChanges() {
  1. Pull latest changes
  2. Commit all changes (including deletions)
  3. Push to GitHub
}
```

---

## Repository Requirements

```
repo-root/
├── products.json    ← Must be in root
└── images/          ← Must be in root
    └── *.jpg/webp/avif
```

---

## Quick Troubleshooting

**Clone fails?**
- Check token has 'repo' permission
- Verify internet connection
- Ensure repository URL is correct

**Publish fails?**
- Check internet connection
- Verify token is still valid
- Look for merge conflicts

**Images not syncing?**
- Ensure images/ folder exists in repo root
- Check .gitignore doesn't exclude images

---

## Testing Checklist

- [ ] Clone repository on first setup
- [ ] Add product → Publish → Verify on GitHub
- [ ] Delete product → Publish → Verify deleted on GitHub
- [ ] Edit product → Publish → Verify updated on GitHub
- [ ] Multiple changes → Publish → Exact sync verified

---

## What Changed

### Before
- GitHub mode threw "not implemented" error
- No way to clone repositories
- git add didn't include deletions

### After
- ✅ Full GitHub workflow functional
- ✅ Auto-clone on setup
- ✅ Exact sync (deletions included)
- ✅ Clone-edit-publish workflow
- ✅ Local-first with on-demand sync
