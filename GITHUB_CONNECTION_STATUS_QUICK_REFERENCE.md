# GitHub Connection & Status - Quick Reference

## Quick Test Steps

### Test Connection
1. Open **Settings**
2. Enter GitHub configuration:
   - Repository URL: `https://github.com/yourusername/yourrepo`
   - Username: Your GitHub username
   - Token: Your Personal Access Token
   - Project Path: Browse to your local git folder
3. Click **"Test Connection"**
4. Verify success or error message

### Test Status Monitoring
1. Make a change to `products.json` (add a space)
2. Save the file
3. Wait up to 5 seconds
4. Check **Status Bar** (bottom of window):
   - Should show: "Unsaved changes: 1 file"
   - Yellow indicator should pulse
   - **Publish to GitHub** button should be enabled

## API Reference

### window.electron.testConnection(config)
Tests GitHub connection with provided credentials.

**Parameters:**
```javascript
{
  repoUrl: string,    // GitHub repository URL
  username: string,   // GitHub username
  token: string,      // GitHub Personal Access Token
  projectPath: string // Local git repository path
}
```

**Returns:**
```javascript
{
  success: boolean,
  message: string,
  data?: {
    name: string,
    fullName: string,
    private: boolean,
    defaultBranch: string
  }
}
```

### window.electron.getGitStatus()
Gets current git repository status.

**Returns:**
```javascript
{
  success: boolean,
  hasChanges: boolean,
  isClean: boolean,
  totalChanges: number,
  modified: number,
  created: number,
  deleted: number,
  renamed: number,
  files: {
    modified: string[],
    created: string[],
    deleted: string[],
    renamed: string[]
  },
  current: string,
  tracking: string,
  ahead: number,
  behind: number
}
```

## GitService Methods

### testConnection()
Makes authenticated GitHub API request to verify credentials.

```javascript
const gitService = new GitService(projectPath, config);
const result = await gitService.testConnection();

// result.success: true/false
// result.message: user-friendly message
// result.data: repository info (on success)
```

### getStatus()
Gets detailed repository status using simple-git.

```javascript
const gitService = new GitService(projectPath, config);
const status = await gitService.getStatus();

// status.hasChanges: true if there are uncommitted changes
// status.totalChanges: total number of changed files
// status.modified: count of modified files
// status.created: count of added files
// status.deleted: count of deleted files
```

## StatusBar Component

### Usage
```jsx
import StatusBar from './components/StatusBar';

function App() {
  return (
    <div className="app">
      {/* Your content */}
      <StatusBar />
    </div>
  );
}
```

### Features
- Automatic status updates every 5 seconds
- Visual indicators (green = ready, yellow = changes)
- Detailed change information
- Smart publish button (enabled only with changes)

### Status Display Format
- No changes: **"Ready"**
- With changes: **"Unsaved changes: X files • Y modified • Z added"**

## Error Messages

### Connection Test Errors
| Code | Message |
|------|---------|
| 200 | Connection successful! Repository: {name} |
| 401 | Invalid token. Please check your Personal Access Token. |
| 404 | Repository not found. Please check the repository URL or ensure you have access. |
| 403 | Access forbidden: {details} |
| Network | Network error. Please check your internet connection. |

### Status Check Errors
| Scenario | Behavior |
|----------|----------|
| No config | Shows "Ready" state |
| Not a git repo | Returns error, shows "Ready" |
| Git error | Logs error, shows "Ready" |

## Configuration File

Settings are stored in encrypted format at:
- **Windows**: `%APPDATA%/sakr-store-manager/github-config.json`
- **macOS**: `~/Library/Application Support/sakr-store-manager/github-config.json`
- **Linux**: `~/.config/sakr-store-manager/github-config.json`

## Testing Checklist

- [ ] Test connection with valid credentials → Success
- [ ] Test connection with invalid token → Error 401
- [ ] Test connection with wrong repo → Error 404
- [ ] Make file change → Status bar updates within 5s
- [ ] Multiple file changes → Shows correct counts
- [ ] No changes → "Ready" state, button disabled
- [ ] Network offline → Graceful error handling

## Troubleshooting

### "Invalid token" error
- Verify token has 'repo' permissions
- Check token hasn't expired
- Ensure no extra spaces in token

### "Repository not found" error
- Verify repository URL format
- Check you have access to the repository
- For private repos, ensure token has correct permissions

### Status bar not updating
- Check console for errors
- Verify project path is a git repository
- Ensure Settings are saved
- Try manual file change to trigger update

### Publish button always disabled
- Verify there are uncommitted changes
- Check git status in terminal: `git status`
- Ensure project path is correct in Settings

## Code Examples

### Manual Status Check
```javascript
// In any component
const checkStatus = async () => {
  const status = await window.electron.getGitStatus();
  if (status.success && status.hasChanges) {
    console.log(`${status.totalChanges} files changed`);
  }
};
```

### Manual Connection Test
```javascript
const testConnection = async () => {
  const result = await window.electron.testConnection({
    repoUrl: 'https://github.com/user/repo',
    username: 'user',
    token: 'ghp_xxxxxxxxxxxx',
    projectPath: '/path/to/repo'
  });
  
  if (result.success) {
    console.log('Connected:', result.data.fullName);
  } else {
    console.error('Error:', result.message);
  }
};
```

## Performance Notes

- Status checks run every **5 seconds** (configurable)
- Each check is **non-blocking**
- Minimal performance impact
- Uses efficient `simple-git` library
- Caches status between checks

## Next Steps

After implementing this feature, you can:
1. Implement the actual **Publish** functionality
2. Add **commit message** input
3. Implement **pull** before push
4. Add **branch selection**
5. Show **commit history**
