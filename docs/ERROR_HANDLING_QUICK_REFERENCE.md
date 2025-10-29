# Error Handling & User Feedback - Quick Reference

## Files Created

### 1. Error Handler Utility
**File:** `src/utils/errorHandler.js`

**Key Functions:**
```javascript
getUserFriendlyError(error)     // Converts technical errors to user-friendly messages
createError(code, message)      // Creates standardized error objects
isNetworkError(error)           // Checks if error is network-related
isAuthError(error)              // Checks if error is authentication-related
isPermissionError(error)        // Checks if error is permission-related
```

**Error Mappings:**
- `ENOENT` → "File not found. Please check the project path."
- `EACCES` → "Permission denied. Check folder permissions."
- `AUTHENTICATION_FAILED` → "GitHub authentication failed. Check your token."
- `FILE_TOO_LARGE` → "Image file is too large (max 10 MB)."
- `INVALID_FILE_TYPE` → "Invalid file type. Please upload a valid image file..."
- Network errors → "Cannot connect to GitHub. Please check your internet connection."

---

### 2. Toast Service
**File:** `src/services/toastService.js`

**Key Functions:**
```javascript
showSuccess(message, options)   // Green success toast
showError(error, options)       // Red error toast (auto-converts error)
showWarning(message, options)   // Orange warning toast
showInfo(message, options)      // Blue info toast
showLoading(message, options)   // Loading spinner toast
dismissToast(toastId)           // Dismiss specific toast
dismissAll()                    // Dismiss all toasts
```

**Pre-configured Messages:**
```javascript
ToastMessages.PRODUCT_SAVED
ToastMessages.GITHUB_PUBLISHED
ToastMessages.SETTINGS_SAVED
ToastMessages.IMAGE_UPLOADED
ToastMessages.IMAGE_NOT_SQUARE
// ... and more
```

---

### 3. Error Boundary Component
**Files:** 
- `src/components/ErrorBoundary.jsx`
- `src/components/ErrorBoundary.css`

**Features:**
- Catches fatal React errors
- Shows user-friendly error screen
- "Restart Application" button
- "Copy Error Details" button
- Dark mode support
- Technical details expandable

---

## Usage Examples

### Show Success Toast
```javascript
import { showSuccess, ToastMessages } from '../services/toastService';

// Simple
showSuccess('Operation completed!');

// With predefined message
showSuccess(ToastMessages.PRODUCT_SAVED);
```

### Show Error Toast
```javascript
import { showError } from '../services/toastService';

try {
  // ... some operation
} catch (error) {
  // Automatically converts to user-friendly message
  showError(error);
}
```

### Show Warning Toast
```javascript
import { showWarning, ToastMessages } from '../services/toastService';

if (width !== height) {
  showWarning(ToastMessages.IMAGE_NOT_SQUARE);
}
```

### Loading Toast with Async Operation
```javascript
import { showLoading, dismissToast, showSuccess, showError } from '../services/toastService';

const toastId = showLoading('Publishing to GitHub...');

try {
  await publishToGitHub();
  dismissToast(toastId);
  showSuccess('Published to GitHub!');
} catch (error) {
  dismissToast(toastId);
  showError(error);
}
```

### Promise-based Toast
```javascript
import { showPromise } from '../services/toastService';

showPromise(
  saveProduct(data),
  {
    loading: 'Saving product...',
    success: 'Product saved successfully!',
    error: (err) => `Failed to save: ${err.message}`
  }
);
```

---

## Component Integration

### Updated Components

1. **App.jsx**
   - Added `<Toaster />` component

2. **main.jsx**
   - Wrapped app with `<ErrorBoundary>`

3. **ProductForm.jsx**
   - Success toast on save
   - Error toast on save failure

4. **ImageUpload.jsx**
   - Warning toast for non-square images
   - Error toast for invalid files

5. **Settings.jsx**
   - Success toast on save
   - Error toast on connection failure
   - Success toast on successful connection test

6. **StatusBar.jsx**
   - Loading toast during publish
   - Success toast on publish success
   - Error toast on publish failure

---

## Configuration

### Toast Default Options
```javascript
{
  duration: 4000,              // 4 seconds (6s for errors)
  position: 'bottom-right',    // Toast position
  style: {
    borderRadius: '8px',
    fontSize: '14px',
  }
}
```

### Customize Toast
```javascript
showSuccess('Saved!', {
  duration: 6000,
  position: 'top-center',
  style: { fontSize: '16px' }
});
```

---

## Error Types Handled

### File System Errors
- `ENOENT` - File not found
- `EACCES` - Permission denied
- `EPERM` - Operation not permitted
- `EISDIR` - Expected file, found directory
- `EEXIST` - File already exists

### Network Errors
- `ENOTFOUND` - DNS lookup failed
- `ECONNREFUSED` - Connection refused
- `ECONNRESET` - Connection reset
- `ETIMEDOUT` - Operation timed out

### GitHub Errors
- Authentication failures
- Authorization errors (403)
- Repository not found (404)
- Rate limiting
- Merge conflicts

### Image Errors
- File too large (>10MB)
- Invalid file type
- Image load failed
- Processing failed

---

## Testing Quick Commands

### Test Success Toast
```javascript
// In browser console
import { showSuccess } from './src/services/toastService.js';
showSuccess('Test success!');
```

### Test Error Toast
```javascript
import { showError } from './src/services/toastService.js';
showError(new Error('Test error'));
```

### Test Error Boundary
```javascript
// In browser console
throw new Error("Test fatal error");
```

---

## Color Scheme

| Type | Color | Icon | Duration |
|------|-------|------|----------|
| Success | Green (#10b981) | ✅ | 4s |
| Error | Red (#ef4444) | ❌ | 6s |
| Warning | Orange (#f59e0b) | ⚠️ | 5s |
| Info | Blue (#3b82f6) | ℹ️ | 4s |

---

## Best Practices

### ✅ Do's
- Use `showError(error)` - it auto-converts to user-friendly message
- Use predefined `ToastMessages` constants
- Show loading toast for long operations
- Dismiss loading toasts when complete
- Log errors to console for debugging

### ❌ Don'ts
- Don't show technical error messages to users
- Don't forget to dismiss loading toasts
- Don't show multiple toasts for the same error
- Don't use alerts or console.log for user feedback

---

## Package Dependencies

```json
{
  "react-hot-toast": "^2.4.1"
}
```

**Install:**
```bash
npm install react-hot-toast
```

---

## Accessibility

- All toasts are dismissible
- Error messages are descriptive
- Color is not the only indicator (uses icons too)
- Error Boundary provides clear recovery path
- Keyboard accessible (can dismiss with Esc)

---

## Future Enhancements

- [ ] Add sound effects for errors/success
- [ ] Add toast history/log
- [ ] Add undo functionality
- [ ] Add toast preferences in settings
- [ ] Add error reporting to external service
- [ ] Add retry mechanism for failed operations

---

## Support

For issues or questions:
1. Check the console for detailed error logs
2. Review `ERROR_HANDLING_TESTING_GUIDE.md` for test scenarios
3. Verify all toast service imports are correct
4. Ensure Error Boundary is wrapping the app

