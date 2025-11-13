# Git Sync View Changes - Quick Reference

## Feature Overview
Users can now see detailed information about incoming changes from GitHub before syncing.

## How to Use

### View Incoming Changes
1. Look at the Sync Status Indicator (top-right area)
2. If there are remote changes, you'll see a badge showing count (e.g., "3 new")
3. Click the **"View Changes"** button next to the Sync button
4. Review the dialog showing:
   - Total file count
   - Modified/Added/Deleted files
   - Product changes (if any)
   - File-by-file breakdown

### Pull Changes
1. After reviewing changes in the dialog
2. Click **"Pull X Changes"** button at the bottom
3. Wait for sync to complete
4. Application will reload if products changed

### Cancel
- Click **"Cancel"** button or click outside the dialog to close without syncing

## Visual Indicators

### Badges
- **⬇️ X new** - Green badge showing incoming changes count
- **⬆️ X local** - Orange badge showing unpublished local changes

### Change Types
- **🟡 Modified** - Files that changed on both sides
- **🟢 Added** - New files added on GitHub
- **🔴 Deleted** - Files removed on GitHub

### Button States
- **View Changes** (gray) - No remote changes
- **View Changes** (green) - Remote changes available
- **Sync** (blue) - Normal sync state
- **Get Updates** (green) - Sync with remote changes available

## Components

### RemoteChangesSummaryDialog
- **Location**: `src/components/RemoteChangesSummaryDialog.jsx`
- **Purpose**: Shows detailed incoming changes from GitHub
- **Features**:
  - File statistics
  - Product change list
  - Detailed file breakdown
  - Loading states
  - Empty states

### SyncStatusIndicator
- **Location**: `src/components/SyncStatusIndicator.jsx`
- **Updates**: Added "View Changes" button
- **Features**:
  - Periodic remote checks (every 5 min)
  - Visual badges for changes
  - Sync button with states

## API Methods

### Frontend
```javascript
// Get detailed remote change information
const result = await window.electron.getRemoteChangeDetails();
// Returns: {
//   success: true,
//   hasRemoteChanges: true,
//   behindBy: 3,
//   totalChanges: 5,
//   modified: 2,
//   added: 2,
//   deleted: 1,
//   files: { modified: [...], added: [...], deleted: [...] },
//   productChanges: [...]
// }
```

### Backend (gitService)
```javascript
// Get remote change details
const details = await gitService.getRemoteChangeDetails(branch);
```

## File Structure
```
src/
├── components/
│   ├── RemoteChangesSummaryDialog.jsx (NEW)
│   ├── RemoteChangesSummaryDialog.css (NEW)
│   ├── SyncStatusIndicator.jsx (UPDATED)
│   └── SyncStatusIndicator.css (UPDATED)
├── services/
│   └── gitService.js (UPDATED)
electron/
├── main.cjs (UPDATED)
└── preload.js (UPDATED)
```

## Styling Classes

### RemoteChangesSummaryDialog
- `.remote-changes-backdrop` - Modal overlay
- `.remote-changes-dialog` - Dialog container
- `.remote-changes-header` - Header section
- `.remote-changes-content` - Scrollable content
- `.remote-changes-footer` - Action buttons
- `.changes-stats` - Statistics section
- `.product-changes-section` - Product list
- `.file-group` - File list groups
- `.stat-item.{modified|added|deleted}` - Colored badges

### SyncStatusIndicator
- `.sync-actions` - Button container
- `.view-remote-changes-btn` - View changes button
- `.view-remote-changes-btn.has-changes` - Highlighted state

## Color Palette
- **Primary**: `#2196f3` (Blue) - Sync actions
- **Success**: `#1acb9b` (Green) - Incoming changes
- **Warning**: `#fbbf24` (Yellow) - Modified files
- **Danger**: `#f85149` (Red) - Deleted files
- **Background**: `#161b22` (Dark)
- **Border**: `rgba(240, 246, 252, 0.1)` (Light transparent)

## Responsive Breakpoints
- **Desktop**: Default layout
- **Tablet** (≤768px): Stacked buttons
- **Mobile** (≤480px): Full-width layout

## Integration Points

### With Existing Features
1. **Sync Button**: Works alongside existing sync
2. **Conflict Resolution**: Integrated with conflict dialog
3. **Product Loading**: Triggers reload after sync
4. **Toast Notifications**: Uses existing toast service

### Event Flow
```
User clicks "View Changes"
  ↓
Load remote change details
  ↓
Show RemoteChangesSummaryDialog
  ↓
User reviews changes
  ↓
User clicks "Pull X Changes"
  ↓
Call handleSync()
  ↓
Pull changes with conflict handling
  ↓
Reload products if needed
  ↓
Close dialog
```

## Error Scenarios

### Network Error
- Toast: "Failed to get remote changes"
- Dialog auto-closes
- Sync button remains available

### No Changes
- Dialog shows "You're up to date!"
- No action needed
- Dialog can be closed

### Conflict During Sync
- Dialog closes
- Conflict resolution dialog opens
- User resolves conflicts
- Products reload after resolution

## Performance Notes
- Remote check happens every 5 minutes automatically
- Git fetch is lightweight (refs only)
- Diff calculation is efficient
- No actual file downloads until sync

## Accessibility
- Keyboard navigation supported
- Screen reader friendly
- Clear visual indicators
- Focus management in dialog

## Browser Compatibility
- Electron app (Chromium-based)
- Modern CSS features used
- No legacy browser support needed

## Related Documentation
- `GIT_SYNC_VIEW_CHANGES_IMPLEMENTATION.md` - Full technical details
- `GIT_CONFLICT_RESOLUTION_IMPROVED.md` - Conflict handling
- `FEEDBACK_PATTERNS_GUIDE.md` - Toast notifications
