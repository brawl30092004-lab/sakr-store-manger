# Error Handling & User Feedback Testing Guide

This guide will help you test the global error handling system and toast notifications.

## Overview

The application now includes:
- ✅ **Error Handler Utility** (`src/utils/errorHandler.js`) - Maps technical errors to user-friendly messages
- ✅ **Toast Service** (`src/services/toastService.js`) - Provides success, error, and warning notifications
- ✅ **Error Boundary** (`src/components/ErrorBoundary.jsx`) - Catches fatal React errors
- ✅ **Toast Integration** - All major components show user feedback

---

## Test Scenarios

### 1. GitHub Connection - Offline Test

**Goal:** Verify network error handling when GitHub is unreachable.

**Steps:**
1. Open the application
2. Go to **Settings**
3. Fill in all GitHub configuration fields (username, token, repo URL)
4. **Disconnect your internet** (turn off WiFi or unplug Ethernet)
5. Click **"Test Connection"** button

**Expected Results:**
- ❌ Red error toast appears: "Cannot connect to GitHub. Please check your internet connection."
- The status message in Settings shows connection failed
- No application crash

**Clean Up:**
- Reconnect to the internet

---

### 2. GitHub Authentication - Invalid Token

**Goal:** Test authentication error handling.

**Steps:**
1. Open the application
2. Go to **Settings**
3. Fill in GitHub username and repo URL
4. Enter an **invalid token** (e.g., "invalid_token_12345")
5. Ensure internet is connected
6. Click **"Test Connection"**

**Expected Results:**
- ❌ Red error toast: "GitHub authentication failed. Check your token."
- Status message shows authentication failed
- No application crash

---

### 3. GitHub Publish - Offline Test

**Goal:** Verify error handling when trying to publish without network.

**Steps:**
1. Make a change to a product (edit name or price)
2. Save the product
3. **Disconnect your internet**
4. Click **"Publish to GitHub"** in the status bar

**Expected Results:**
- ❌ Red error toast: "Cannot connect to GitHub. Please check your internet connection."
- Publish button returns to enabled state
- Status bar shows the error
- No application crash

**Clean Up:**
- Reconnect to the internet

---

### 4. Image Upload - Invalid File Type

**Goal:** Test file type validation.

**Steps:**
1. Open or create a product
2. Go to the Primary Image section
3. Try to upload a **PDF file** (.pdf) or **text file** (.txt)
   - Either drag & drop or click to browse

**Expected Results:**
- ❌ Red error toast: "Invalid file type. Please upload a valid image file (JPG, PNG, AVIF, WEBP)."
- Image is not uploaded
- Form validation shows error
- No application crash

---

### 5. Image Upload - File Too Large

**Goal:** Test file size validation.

**Steps:**
1. Open or create a product
2. Find or create an image file **larger than 10 MB**
   - You can use an online tool or Photoshop to create a large image
3. Try to upload this large image as Primary Image

**Expected Results:**
- ❌ Red error toast: "Image file is too large (max 10 MB)."
- Image is not uploaded
- No application crash

---

### 6. Image Upload - Non-Square Warning

**Goal:** Test warning for non-square images.

**Steps:**
1. Open or create a product
2. Upload a **rectangular image** (e.g., 800x600px or 1920x1080px)
   - Must be a valid image format (JPG, PNG, AVIF, WEBP)
   - Must be under 10 MB

**Expected Results:**
- ⚠️ **Orange warning toast**: "Image is not square. Product cards display best with square images."
- Image is still uploaded (this is a warning, not an error)
- Preview shows the image
- No application crash

---

### 7. File System - Permission Denied

**Goal:** Test permission error handling.

**Steps:**
1. Go to **Settings**
2. Click **"Browse"** for Project Path
3. Try to select a **protected system folder** you don't have write access to:
   - **Windows:** `C:\Windows\System32` or `C:\Program Files`
   - **macOS:** `/System` or `/private/var`
   - **Linux:** `/root` or `/sys`
4. Save the settings
5. Try to create or edit a product

**Expected Results:**
- ❌ Red error toast: "Permission denied. Check folder permissions."
- Application shows error but doesn't crash
- User is informed they need to choose a different folder

**Alternative Test (if above doesn't work):**
1. Manually change the `projectPath` in the config file to a protected folder
2. Restart the application
3. Try to load products or save changes

---

### 8. Product Save - Success

**Goal:** Verify success toast notifications.

**Steps:**
1. Create a new product or edit an existing one
2. Fill in all required fields
3. Upload a valid image
4. Click **"Save"**

**Expected Results:**
- ✅ **Green success toast**: "Product saved successfully."
- Product appears in the list
- Form closes or remains open based on button clicked

---

### 9. Settings Save - Success

**Goal:** Verify settings save success notification.

**Steps:**
1. Go to **Settings**
2. Fill in all required fields with valid data
3. Click **"Save Settings"**

**Expected Results:**
- ✅ **Green success toast**: "Settings saved successfully."
- Status message shows success
- Token is masked as `••••••••`

---

### 10. GitHub Publish - Success

**Goal:** Verify publish success notification.

**Steps:**
1. Ensure GitHub is properly configured in Settings
2. Make a change to a product
3. Save the product
4. Ensure **internet is connected**
5. Click **"Publish to GitHub"**

**Expected Results:**
- Loading toast appears: "Publishing to GitHub..."
- ✅ **Green success toast**: "Published to GitHub!"
- Status bar updates to show no pending changes
- GitHub repository receives the commit

---

### 11. Error Boundary - Fatal Error Test

**Goal:** Test React Error Boundary for unhandled errors.

**Steps:**
1. Open browser DevTools (F12)
2. In the Console, type:
   ```javascript
   throw new Error("Test fatal error");
   ```
3. Or, temporarily modify a component to throw an error

**Expected Results:**
- Error Boundary catches the error
- Full-screen error page appears with:
  - ⚠️ Warning icon
  - "Something went wrong" message
  - Technical details (expandable)
  - "Restart Application" button
  - "Copy Error Details" button
- Clicking "Restart Application" reloads the app
- Clicking "Copy Error Details" copies error info to clipboard

---

## Toast Notification Types

### Success (Green - ✅)
- Product saved successfully
- Settings saved successfully
- Published to GitHub
- Connection successful

### Error (Red - ❌)
- Invalid file type
- File too large
- Permission denied
- GitHub authentication failed
- Network errors
- Validation errors

### Warning (Orange - ⚠️)
- Image is not square
- Form validation warnings

### Info (Blue - ℹ️)
- Loading messages
- Status updates

---

## Toast Positions & Behavior

- **Position:** Bottom-right corner
- **Duration:** 
  - Success: 4 seconds
  - Error: 6 seconds (longer to read)
  - Warning: 5 seconds
  - Loading: Until dismissed
- **Dismissal:** Click the toast or wait for auto-dismiss
- **Stacking:** Multiple toasts stack vertically

---

## User-Friendly Error Messages Mapping

| Technical Error | User-Friendly Message |
|----------------|----------------------|
| `ENOENT` | "File not found. Please check the project path." |
| `EACCES` | "Permission denied. Check folder permissions." |
| `Authentication failed` | "GitHub authentication failed. Check your token." |
| `Merge conflict` | "Your changes conflict with remote changes. Please resolve manually or pull changes." |
| `FILE_TOO_LARGE` | "Image file is too large (max 10 MB)." |
| `INVALID_FILE_TYPE` | "Invalid file type. Please upload a valid image file (JPG, PNG, AVIF, WEBP)." |
| Network errors | "Cannot connect to GitHub. Please check your internet connection." |

---

## Testing Checklist

- [ ] GitHub offline test (disconnect internet)
- [ ] GitHub invalid token test
- [ ] GitHub publish offline test
- [ ] Invalid file type upload (.pdf)
- [ ] File too large upload (>10MB)
- [ ] Non-square image warning
- [ ] Permission denied error
- [ ] Product save success
- [ ] Settings save success
- [ ] GitHub publish success
- [ ] Error Boundary fatal error test

---

## Troubleshooting

### Toasts not appearing
1. Check browser console for errors
2. Verify `react-hot-toast` is installed: `npm list react-hot-toast`
3. Ensure `<Toaster />` is in `App.jsx`
4. Check that components import `toastService`

### Error Boundary not catching errors
1. Verify `ErrorBoundary` wraps the app in `main.jsx`
2. Error Boundary only catches errors in child components during rendering
3. Event handlers need manual try-catch

### Error messages not user-friendly
1. Check `errorHandler.js` for the error code mapping
2. Verify services are using `getUserFriendlyError(error)`
3. Check console for the original error message

---

## Notes

- All toasts are dismissible by clicking on them
- Toast styling uses custom colors (green, red, orange, blue)
- Error Boundary has dark mode support
- All error handling is logged to console for debugging
- Network errors are automatically detected and mapped to user-friendly messages

---

## Success Criteria

✅ All 11 test scenarios pass without application crashes  
✅ Error messages are user-friendly and actionable  
✅ Success operations show green confirmation toasts  
✅ Errors show red toasts with helpful messages  
✅ Warnings show orange toasts  
✅ Error Boundary catches fatal errors gracefully  
✅ No technical jargon in user-facing messages  

