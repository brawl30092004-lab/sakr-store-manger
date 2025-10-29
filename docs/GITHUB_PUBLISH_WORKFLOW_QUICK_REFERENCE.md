# GitHub Publish Workflow - Quick Reference

## Quick Start

### Publishing Changes

1. Make changes to products/images
2. Status bar shows "Unsaved changes: X files"
3. Click **"Publish to GitHub"** button
4. Wait for success notification
5. Status bar returns to "Ready"

---

## GitService Methods

### `publishChanges(commitMessage)`
Complete publish workflow (pull → commit → push)

```javascript
const result = await gitService.publishChanges();
// or with custom message:
const result = await gitService.publishChanges('Add winter collection');
```

**Returns:**
- `success`: boolean
- `message`: string
- `commitMessage`: auto-generated or custom
- `branch`: current branch
- `duration`: time in seconds

---

### `pullLatestChanges(branch)`
Fetch and pull remote changes

```javascript
const result = await gitService.pullLatestChanges();
```

**Returns:**
- `success`: boolean
- `message`: string
- `changes`: number of files changed
- `conflicts`: array (if any)

---

### `commitChanges(message)`
Stage and commit all changes

```javascript
const result = await gitService.commitChanges();
```

**Auto-generates message:**
`"Update products via Store Manager: Added X, Modified Y, Deleted Z"`

**Returns:**
- `success`: boolean
- `commit`: commit hash
- `commitMessage`: the message used

---

### `pushToGitHub(branch, username, token)`
Push commits with authentication

```javascript
const result = await gitService.pushToGitHub();
```

**Returns:**
- `success`: boolean
- `branch`: pushed branch
- `remoteUrl`: GitHub repo URL

---

## UI Integration

### From Renderer Process

```javascript
// Publish with auto-generated message
const result = await window.electron.publishToGitHub();

// Publish with custom message
const result = await window.electron.publishToGitHub('Custom commit message');

if (result.success) {
  console.log('Published successfully!');
} else {
  console.error('Failed:', result.message);
}
```

---

## Status Bar States

| State | Indicator | Message | Button |
|-------|-----------|---------|--------|
| Ready | 🟢 Green | "Ready" | Disabled |
| Changes | 🟡 Yellow | "Unsaved changes: X files" | Enabled |
| Publishing | 🟡 Yellow | "Publishing..." | Disabled + Spinner |
| Error | 🔴 Red | "Error: ..." | Enabled |

---

## Common Error Messages

| Error | Meaning | Solution |
|-------|---------|----------|
| "Merge conflicts detected" | Local and remote changes conflict | Resolve conflicts manually |
| "Authentication failed" | Invalid token/username | Update credentials in Settings |
| "No changes to commit" | Repository is clean | Make changes first |
| "Network error" | No internet | Check connection |
| "Access forbidden" | Token lacks permissions | Generate new token with `repo` scope |

---

## Auto-Generated Commit Messages

**Format:**
```
Update products via Store Manager: [changes]
```

**Examples:**
- `Added 2 file(s)` - Only new files
- `Modified 3 file(s)` - Only modified files
- `Deleted 1 file(s)` - Only deleted files
- `Added 2 file(s), Modified 3 file(s), Deleted 1 file(s)` - Mixed changes

---

## Workflow Steps

```
1. Pull Latest Changes
   ↓ (fetch + merge)
   
2. Commit Changes
   ↓ (stage all + commit)
   
3. Push to GitHub
   ↓ (authenticate + push)
   
✓ Success
```

**If any step fails, workflow stops and reports error.**

---

## Security Notes

✅ **Token is encrypted** in storage  
✅ **Token is decrypted** only when needed  
✅ **Remote URL** temporarily includes credentials  
✅ **Original URL** restored immediately after push  
✅ **No credentials** persisted in git config  

---

## Testing Checklist

- [ ] Add product → Publish → Verify on GitHub
- [ ] Edit product → Publish → Verify on GitHub
- [ ] Delete product → Publish → Verify on GitHub
- [ ] Add images → Publish → Verify on GitHub
- [ ] Delete images → Publish → Verify on GitHub
- [ ] Test with invalid token → Verify error message
- [ ] Test with no internet → Verify error message
- [ ] Simulate conflict → Verify conflict detection

---

## Configuration Requirements

**GitHub Settings must include:**
- ✅ Username
- ✅ Personal Access Token (with `repo` scope)
- ✅ Repository URL
- ✅ Local project path

**Test connection before publishing!**

---

## Code Examples

### Basic Usage

```javascript
// In renderer process
async function publishMyChanges() {
  try {
    const result = await window.electron.publishToGitHub();
    
    if (result.success) {
      alert(`✓ Published in ${result.duration}s`);
    } else {
      alert(`✗ Failed: ${result.message}`);
    }
  } catch (error) {
    alert(`✗ Error: ${error.message}`);
  }
}
```

### Advanced Usage

```javascript
// In main process
import GitService from './services/gitService.js';

const gitService = new GitService(projectPath, {
  username: 'your-username',
  token: 'ghp_xxxxx',
  repoUrl: 'https://github.com/user/repo'
});

// Individual steps
const pull = await gitService.pullLatestChanges('main');
if (pull.success) {
  const commit = await gitService.commitChanges('My message');
  if (commit.success) {
    const push = await gitService.pushToGitHub('main');
  }
}

// Or all at once
const result = await gitService.publishChanges('My message');
```

---

## Performance

| Operation | Typical Time |
|-----------|--------------|
| Pull | 1-3 seconds |
| Commit | <1 second |
| Push | 2-5 seconds |
| **Total** | **3-10 seconds** |

*Times vary based on file size and network speed*

---

## Files Modified

### GitService
- ✅ `src/services/gitService.js` - Core workflow implementation

### IPC Layer
- ✅ `electron/main.js` - Handler for `git:publish`
- ✅ `electron/preload.js` - Exposed `publishToGitHub()`

### UI Components
- ✅ `src/components/StatusBar.jsx` - Publish button and states
- ✅ `src/components/StatusBar.css` - Styling and animations

---

## Troubleshooting Quick Fixes

### Button Disabled
→ No changes detected or already publishing  
→ Make changes to enable button

### Stuck on "Publishing..."
→ Refresh application  
→ Check console for errors

### "Authentication failed"
→ Regenerate GitHub token  
→ Test connection in Settings

### "Merge conflicts"
→ Resolve conflicts manually:
```bash
cd your-project
git pull origin main
# resolve conflicts
git add .
git commit -m "Resolved conflicts"
```
→ Try publish again

---

## Best Practices

1. **Test connection** before making changes
2. **Publish frequently** to avoid large commits
3. **Review status** before publishing
4. **Check GitHub** after successful publish
5. **Keep token secure** and rotate regularly

---

## Related Documentation

- `GITHUB_PUBLISH_WORKFLOW_IMPLEMENTATION.md` - Detailed implementation guide
- `GITHUB_SETTINGS_IMPLEMENTATION.md` - Configuration setup
- `GITHUB_CONNECTION_STATUS_IMPLEMENTATION.md` - Connection testing

---

## Support

**If publish fails:**
1. Check error message in alert
2. Verify GitHub configuration in Settings
3. Test connection using "Test Connection" button
4. Check console for detailed logs
5. Review repository state in git client

**Common solutions:**
- Regenerate token with correct scopes
- Verify internet connection
- Resolve merge conflicts manually
- Update repository URL format
