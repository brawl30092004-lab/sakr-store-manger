# Image Deletion & Cleanup - Testing Guide

## Overview
This guide walks you through testing the image deletion and cleanup functionality to ensure that deleted or replaced images are properly removed from the file system.

## Prerequisites
- Application is running in development mode
- You have access to the `images/` folder to verify file presence
- You have test images ready to upload (any JPG, PNG, WebP, or AVIF files)

---

## Test 1: Product Deletion with Image Cleanup

**Goal:** Verify that all image files are deleted when a product is deleted.

### Steps:

1. **Create a New Product with Images**
   - Click "Add New Product" in the application
   - Fill in the required fields:
     - Name: `Test Product for Deletion`
     - Category: Any category
     - Price: Any valid price
   - Upload a **primary image**
   - Upload **3 gallery images**
   - Click "Save"

2. **Verify Image Files Created**
   - Navigate to the `images/` folder in your project directory
   - You should see **12 image files** created for this product:
     - 3 primary image files: `product-X-primary.jpg`, `product-X-primary.webp`, `product-X-primary.avif`
     - 9 gallery image files: 
       - `product-X-gallery-0.jpg`, `product-X-gallery-0.webp`, `product-X-gallery-0.avif`
       - `product-X-gallery-1.jpg`, `product-X-gallery-1.webp`, `product-X-gallery-1.avif`
       - `product-X-gallery-2.jpg`, `product-X-gallery-2.webp`, `product-X-gallery-2.avif`
   - (Where `X` is the product ID)
   - **Note the product ID** for verification

3. **Delete the Product**
   - Find the product in the product list
   - Click the "Delete" button
   - Confirm the deletion

4. **Verify Image Files Deleted**
   - Navigate back to the `images/` folder
   - **All 12 image files** for this product should be **completely removed**
   - Search for `product-X-` (where X is the product ID) to confirm no files remain

### Expected Results:
✅ Product is deleted from the product list  
✅ All 12 image files are removed from the `images/` folder  
✅ No orphaned image files remain  

### Common Issues:
- ❌ **Files still exist:** Check console for errors in `deleteProductImages` function
- ❌ **Only some files deleted:** Verify all three formats (jpg, webp, avif) are being deleted
- ❌ **Wrong files deleted:** Ensure the product ID is correct

---

## Test 2: Primary Image Replacement

**Goal:** Verify that old primary image files are deleted when replaced with a new image.

### Steps:

1. **Create or Select a Product**
   - Either create a new product or use an existing one
   - Upload a **primary image**
   - Click "Save"

2. **Note the Original Primary Image Files**
   - Navigate to the `images/` folder
   - Find the primary image files: `product-X-primary.jpg`, `product-X-primary.webp`, `product-X-primary.avif`
   - **Note the file sizes or timestamps** for verification

3. **Replace the Primary Image**
   - Edit the product
   - Click on the primary image upload area
   - Upload a **different image** (different content/size)
   - Click "Save"

4. **Verify Image Files Replaced**
   - Navigate to the `images/` folder
   - The primary image files should exist: `product-X-primary.jpg`, etc.
   - **Verify the new files are different** (check file size or timestamp)
   - The old image files should be **completely replaced** (not duplicated)

### Expected Results:
✅ New primary image is saved and visible in the UI  
✅ Old primary image files (3 formats) are deleted  
✅ New primary image files (3 formats) are created  
✅ Only one set of primary images exists (no duplicates)  

### Common Issues:
- ❌ **Old files remain:** Check if `updateProduct` is detecting image changes correctly
- ❌ **Both old and new files exist:** Verify `deleteProductImage` is being called before saving
- ❌ **No new files created:** Check image processing in `processProductImage`

---

## Test 3: Gallery Image Replacement

**Goal:** Verify that old gallery images are deleted when replaced or removed.

### Steps:

1. **Create a Product with Gallery Images**
   - Create or edit a product
   - Upload **3 gallery images**
   - Click "Save"

2. **Note the Gallery Image Files**
   - Navigate to the `images/` folder
   - Note the gallery files: `product-X-gallery-0.*`, `product-X-gallery-1.*`, `product-X-gallery-2.*`

3. **Remove One Gallery Image**
   - Edit the product
   - Delete one of the gallery images (e.g., the second one)
   - Click "Save"

4. **Verify Removed Image Files Deleted**
   - Navigate to the `images/` folder
   - The deleted gallery image files should be **removed** (all 3 formats)
   - The remaining gallery images should still exist

### Expected Results:
✅ Removed gallery image is deleted from UI  
✅ Removed gallery image files (3 formats) are deleted from disk  
✅ Remaining gallery images still exist and are accessible  

---

## Test 4: Bulk Gallery Image Changes

**Goal:** Verify handling of multiple simultaneous gallery image changes.

### Steps:

1. **Create a Product with 3 Gallery Images**
   - Upload 3 distinct gallery images
   - Click "Save"

2. **Replace All Gallery Images**
   - Edit the product
   - Remove all 3 gallery images
   - Upload 3 **new** gallery images
   - Click "Save"

3. **Verify Complete Replacement**
   - Navigate to the `images/` folder
   - The old gallery image files (9 total) should be **deleted**
   - The new gallery image files (9 total) should be **created**
   - Total gallery files should still be 9 (3 images × 3 formats)

### Expected Results:
✅ All old gallery images are deleted (9 files)  
✅ All new gallery images are created (9 files)  
✅ No orphaned files from old images  

---

## Test 5: Edge Case - Updating Product Without Image Changes

**Goal:** Verify that images are NOT deleted when updating other product fields.

### Steps:

1. **Create a Product with Images**
   - Upload primary and gallery images
   - Click "Save"

2. **Update Non-Image Fields**
   - Edit the product
   - Change the **name**, **price**, or **description**
   - Do NOT modify any images
   - Click "Save"

3. **Verify Images Unchanged**
   - Navigate to the `images/` folder
   - All image files should **still exist** with the **same timestamps**
   - No files should be deleted or recreated

### Expected Results:
✅ Product details are updated  
✅ All image files remain unchanged  
✅ No unnecessary file operations  

---

## Test 6: Edge Case - Deleting Product Without Images

**Goal:** Verify that deletion works correctly for products without images.

### Steps:

1. **Create a Product Without Images**
   - Create a new product
   - Do NOT upload any images
   - Click "Save"

2. **Delete the Product**
   - Delete the product from the list

3. **Verify No Errors**
   - Check the browser console for errors
   - Deletion should complete successfully

### Expected Results:
✅ Product is deleted without errors  
✅ No console errors related to image deletion  
✅ Application remains functional  

---

## Verification Checklist

Use this checklist to confirm all functionality is working:

- [ ] **Test 1:** Product deletion removes all 12 image files
- [ ] **Test 2:** Primary image replacement deletes old files
- [ ] **Test 3:** Gallery image removal deletes correct files
- [ ] **Test 4:** Bulk gallery replacement handles all changes
- [ ] **Test 5:** Non-image updates don't affect image files
- [ ] **Test 6:** Deletion works for products without images

---

## Debugging Tips

### Check Browser Console
- Open Developer Tools (F12)
- Check for errors in the Console tab
- Look for messages from `deleteProductImages` or `deleteProductImage`

### Check Terminal/Electron Logs
- Look for errors in the terminal running the Electron app
- Check for file system errors or permission issues

### Verify File System
- Manually inspect the `images/` folder
- Count files before and after operations
- Check file timestamps to verify recreation

### Common Console Commands

```javascript
// In browser console, check if the API is available:
window.electron.image.deleteProductImages

// Check current products:
// (In Redux DevTools or by inspecting state)
```

---

## Implementation Details

### Functions Involved

1. **`imageService.deleteProductImages(projectPath, productId, imageType)`**
   - Deletes all images for a product
   - `imageType` can be `'all'`, `'primary'`, or `'gallery'`

2. **`imageService.deleteProductImage(projectPath, imagePath)`**
   - Deletes a specific image (all 3 formats)

3. **`productService.deleteProduct(id)`**
   - Calls `deleteProductImages(projectPath, id, 'all')`

4. **`productService.updateProduct(id, updates)`**
   - Compares old and new image paths
   - Deletes removed images using `deleteProductImage`

### File Naming Convention

- **Primary:** `product-{id}-primary.{jpg|webp|avif}`
- **Gallery:** `product-{id}-gallery-{index}.{jpg|webp|avif}`

### Expected File Count Per Image
- Each image generates **3 files** (JPG, WebP, AVIF)
- Product with 1 primary + 3 gallery = **12 files total**

---

## Success Criteria

All tests pass when:
- ✅ Deleted products have all their images removed
- ✅ Replaced images have old files deleted
- ✅ No orphaned image files remain in the `images/` folder
- ✅ No console errors during deletion operations
- ✅ Application remains stable and functional
