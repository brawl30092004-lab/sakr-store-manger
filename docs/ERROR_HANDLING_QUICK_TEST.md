# Quick Test Instructions

## Start the Application

```bash
npm run dev
```

The app will open in Electron.

---

## Quick Tests (2 minutes)

### 1. Test Invalid File Upload (30 seconds)
1. Create or open a product
2. Try to upload a `.txt` or `.pdf` file as an image
3. **Expected:** Red toast appears: "Invalid file type..."

### 2. Test Non-Square Image Warning (30 seconds)
1. Open a product
2. Upload a rectangular image (e.g., from Google Images: "landscape photo")
3. **Expected:** Orange warning toast: "Image is not square..."

### 3. Test Product Save Success (30 seconds)
1. Edit a product name
2. Click Save
3. **Expected:** Green success toast: "Product saved successfully."

### 4. Test Settings Save (30 seconds)
1. Go to Settings (top menu)
2. Change any field
3. Click Save Settings
4. **Expected:** Green success toast: "Settings saved successfully."

---

## Network Tests (3 minutes)

### 5. Test GitHub Offline Error
1. Disconnect from internet (turn off WiFi)
2. Go to Settings
3. Fill in GitHub fields
4. Click "Test Connection"
5. **Expected:** Red error toast: "Cannot connect to GitHub..."
6. Reconnect to internet

---

## Fatal Error Test (1 minute)

### 6. Test Error Boundary
1. Open browser DevTools (F12)
2. Go to Console tab
3. Type: `throw new Error("Test")`
4. Press Enter
5. **Expected:** Full-screen error page with "Something went wrong"
6. Click "Restart Application"

---

## All Tests Pass? ✅

You should see:
- ✅ Red toasts for errors
- ✅ Orange toasts for warnings
- ✅ Green toasts for success
- ✅ Error Boundary catches fatal errors
- ✅ No application crashes
- ✅ No technical error messages shown

---

## Detailed Testing

For comprehensive testing, see:
- `ERROR_HANDLING_TESTING_GUIDE.md` - 11 detailed test scenarios

For usage reference, see:
- `ERROR_HANDLING_QUICK_REFERENCE.md` - Function reference and examples

For implementation details, see:
- `ERROR_HANDLING_IMPLEMENTATION_SUMMARY.md` - Complete technical overview

