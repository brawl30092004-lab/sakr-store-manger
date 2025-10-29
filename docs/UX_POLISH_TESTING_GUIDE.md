# UX Polish Testing Guide
## Keyboard Shortcuts & Auto-Save Testing

This document provides comprehensive testing procedures for the newly implemented keyboard shortcuts and auto-save functionality.

---

## ✅ Keyboard Shortcuts Testing

### 1. **Ctrl+N - New Product**

**Test Steps:**
1. Launch the application
2. Press `Ctrl+N`

**Expected Result:**
- The Product Form modal should open
- Form should be empty with default values
- Form title should read "Add New Product"

**Status:** ⬜ Not Tested | ✅ Passed | ❌ Failed

---

### 2. **Ctrl+S - Save Product**

**Test Steps:**
1. Open a product for editing (click Edit on any product)
2. Make a change (e.g., modify the product name)
3. Press `Ctrl+S`

**Expected Result:**
- Form should validate
- If valid, product should save
- Success toast notification should appear
- Form should remain open

**Status:** ⬜ Not Tested | ✅ Passed | ❌ Failed

---

### 3. **Ctrl+P - Publish to GitHub**

**Test Steps:**
1. Press `Ctrl+P` anywhere in the app

**Expected Result:**
- Console should log: "Publish shortcut triggered (Ctrl+P)"
- (Note: Full GitHub publish functionality to be implemented)

**Status:** ⬜ Not Tested | ✅ Passed | ❌ Failed

---

### 4. **Ctrl+F - Focus Search Bar**

**Test Steps:**
1. Click anywhere on the page
2. Press `Ctrl+F`

**Expected Result:**
- Search bar should receive focus
- Cursor should be in the search input field
- Browser's default find behavior should be prevented

**Status:** ⬜ Not Tested | ✅ Passed | ❌ Failed

---

### 5. **Delete - Delete Selected Product**

**Test Steps:**
1. Click on any product card to select it
2. Press the `Delete` key

**Expected Result:**
- Delete confirmation modal should appear
- Modal should ask: "Are you sure you want to delete this product?"
- Modal should have "Cancel" and "Delete" buttons

**Important:** The Delete key should NOT trigger when typing in input fields.

**Status:** ⬜ Not Tested | ✅ Passed | ❌ Failed

---

### 6. **Escape - Close Modal/Form**

**Test Steps:**

**Test 6a: Close Product Form**
1. Open the Product Form (click "New Product" or "Edit")
2. Press `Escape`

**Expected Result:**
- Product Form should close
- No save should occur

**Test 6b: Close Delete Confirmation**
1. Click "Delete" on a product
2. Press `Escape`

**Expected Result:**
- Delete confirmation modal should close
- Product should NOT be deleted

**Test 6c: Close Settings**
1. Click "Settings" in the menu
2. Press `Escape`

**Expected Result:**
- Settings view should close
- Should return to main view

**Status:** ⬜ Not Tested | ✅ Passed | ❌ Failed

---

### 7. **Enter - Submit Form**

**Test Steps:**
1. Open the Product Form
2. Fill in all required fields correctly
3. With focus in any input field (except textarea), press `Enter`

**Expected Result:**
- Form should validate
- If valid, product should save
- Success toast should appear

**Important:** Pressing Enter in a textarea should create a new line, NOT submit the form.

**Status:** ⬜ Not Tested | ✅ Passed | ❌ Failed

---

## ✅ Auto-Save Testing

### 8. **Auto-Save Trigger**

**Test Steps:**
1. Open a product for editing
2. Change the product name
3. Wait for 30 seconds (do not save manually)
4. Open browser DevTools Console

**Expected Result:**
- After 30 seconds, console should log: "Draft saved for product [ID]"
- Draft should be saved to localStorage

**To verify localStorage:**
```javascript
// Run in browser console
Object.keys(localStorage).filter(key => key.startsWith('product_draft_'))
```

**Status:** ⬜ Not Tested | ✅ Passed | ❌ Failed

---

### 9. **Draft Restoration - Unsaved Changes**

**Test Steps:**
1. Open a product for editing
2. Change the product name (e.g., "Test Product Modified")
3. Wait 30+ seconds for auto-save
4. Close the form WITHOUT saving (click Cancel or press Escape)
5. Reopen the same product for editing

**Expected Result:**
- A draft restoration prompt should appear
- Prompt should say: "We found an unsaved draft from [time]"
- Prompt should have "Discard" and "Restore Draft" buttons

**Status:** ⬜ Not Tested | ✅ Passed | ❌ Failed

---

### 10. **Draft Restoration - Restore Action**

**Test Steps:**
1. Follow steps 1-5 from Test 9 above
2. Click "Restore Draft"

**Expected Result:**
- Draft prompt should close
- Form should populate with the modified data
- Product name should show the changed value
- Info toast should appear: "Draft restored successfully"

**Status:** ⬜ Not Tested | ✅ Passed | ❌ Failed

---

### 11. **Draft Restoration - Discard Action**

**Test Steps:**
1. Follow steps 1-5 from Test 9 above
2. Click "Discard"

**Expected Result:**
- Draft prompt should close
- Form should show original product data (not the modified version)
- Info toast should appear: "Draft discarded"
- Draft should be removed from localStorage

**Status:** ⬜ Not Tested | ✅ Passed | ❌ Failed

---

### 12. **Draft Clear on Save**

**Test Steps:**
1. Open a product for editing
2. Change the product name
3. Wait 30+ seconds for auto-save
4. Click "Save" or "Save & Close"
5. Reopen the same product

**Expected Result:**
- Draft should be cleared when save completes
- No draft restoration prompt should appear
- Form should load with the saved data

**Status:** ⬜ Not Tested | ✅ Passed | ❌ Failed

---

### 13. **New Product Auto-Save**

**Test Steps:**
1. Click "New Product" (or press Ctrl+N)
2. Fill in some fields
3. Wait 30+ seconds
4. Close the form WITHOUT saving
5. Click "New Product" again

**Expected Result:**
- Draft restoration prompt should appear
- Draft should be for product ID "new"
- Restoring should populate the form with the previously entered data

**Status:** ⬜ Not Tested | ✅ Passed | ❌ Failed

---

## 🔄 Integration Tests

### 14. **Combined Shortcuts - Quick Workflow**

**Test Steps:**
1. Press `Ctrl+N` to create new product
2. Fill in required fields
3. Press `Ctrl+S` to save
4. Press `Escape` to close form
5. Press `Ctrl+F` to search
6. Type a search term
7. Click on a product to select it
8. Press `Delete`
9. Press `Escape` to cancel deletion

**Expected Result:**
- All shortcuts should work seamlessly in sequence
- No conflicts or errors

**Status:** ⬜ Not Tested | ✅ Passed | ❌ Failed

---

### 15. **Auto-Save During Typing**

**Test Steps:**
1. Open product form
2. Type continuously in the description field
3. Keep typing for over 30 seconds

**Expected Result:**
- Auto-save should trigger at 30-second mark
- Typing should NOT be interrupted
- No performance issues or lag

**Status:** ⬜ Not Tested | ✅ Passed | ❌ Failed

---

## 🐛 Edge Cases

### 16. **Multiple Form Opens**

**Test Steps:**
1. Open a product
2. Make changes
3. Close form
4. Open a different product
5. Close form
6. Reopen first product

**Expected Result:**
- Should show draft for the first product only
- Drafts should not mix between products

**Status:** ⬜ Not Tested | ✅ Passed | ❌ Failed

---

### 17. **Shortcuts in Input Fields**

**Test Steps:**
1. Open product form
2. Click in the Name field
3. Type "Ctrl" (as text)
4. Press actual Ctrl+N, Ctrl+S combinations

**Expected Result:**
- Ctrl+S should still save (global shortcut works in forms)
- Ctrl+N should be prevented
- Delete key should type normally in text fields

**Status:** ⬜ Not Tested | ✅ Passed | ❌ Failed

---

## 📊 Test Summary

| Test # | Test Name | Status | Notes |
|--------|-----------|--------|-------|
| 1 | Ctrl+N - New Product | ⬜ | |
| 2 | Ctrl+S - Save | ⬜ | |
| 3 | Ctrl+P - Publish | ⬜ | |
| 4 | Ctrl+F - Search Focus | ⬜ | |
| 5 | Delete - Delete Product | ⬜ | |
| 6 | Escape - Close Modal | ⬜ | |
| 7 | Enter - Submit Form | ⬜ | |
| 8 | Auto-Save Trigger | ⬜ | |
| 9 | Draft Restoration Prompt | ⬜ | |
| 10 | Draft Restore Action | ⬜ | |
| 11 | Draft Discard Action | ⬜ | |
| 12 | Draft Clear on Save | ⬜ | |
| 13 | New Product Auto-Save | ⬜ | |
| 14 | Combined Shortcuts | ⬜ | |
| 15 | Auto-Save During Typing | ⬜ | |
| 16 | Multiple Form Opens | ⬜ | |
| 17 | Shortcuts in Input Fields | ⬜ | |

---

## 🚀 Quick Start Testing

To quickly verify the implementation:

1. **Start the app:**
   ```bash
   npm run dev
   ```

2. **Test keyboard shortcuts:**
   - Press `Ctrl+N` → Should open new product form
   - Press `Ctrl+F` → Should focus search bar
   - Open a form and press `Ctrl+S` → Should save

3. **Test auto-save:**
   - Open product form
   - Make changes
   - Wait 35 seconds
   - Check console for "Draft saved" message
   - Close form and reopen → Should see draft prompt

---

## ✨ Features Overview

### Implemented Keyboard Shortcuts:
- ✅ `Ctrl+N` - New Product
- ✅ `Ctrl+S` - Save Product
- ✅ `Ctrl+P` - Publish to GitHub (placeholder)
- ✅ `Ctrl+F` - Focus Search
- ✅ `Delete` - Delete Product (with confirmation)
- ✅ `Escape` - Close Modal/Form
- ✅ `Enter` - Submit Form

### Implemented Auto-Save Features:
- ✅ Auto-save every 30 seconds
- ✅ Draft restoration prompt
- ✅ Restore draft functionality
- ✅ Discard draft functionality
- ✅ Clear draft on save
- ✅ Timestamp display for drafts
- ✅ Support for both new and existing products

---

## 📝 Notes

- Auto-save interval is set to 30 seconds (configurable in `autoSaveService.js`)
- Drafts are stored in browser localStorage
- Keyboard shortcuts prevent default browser behavior where appropriate
- Form validation still applies when using shortcuts
- All shortcuts respect the current view context (main vs settings)

---

**Testing Date:** _______________  
**Tester Name:** _______________  
**Build Version:** _______________
