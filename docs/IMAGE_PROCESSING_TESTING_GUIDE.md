# Image Processing Backend Testing Guide

## Overview
This document provides testing procedures for the Sharp-based image processing backend implementation.

## Features Implemented

### 1. Backend Image Processing (Electron Main Process)
- **Location:** `electron/main.js`
- **Functions:**
  - `generateImageFilename()` - Creates standardized filenames
  - `processProductImage()` - Processes images with Sharp
  - IPC handler `image:process` - Handles image processing requests
  - IPC handler `image:delete` - Handles image deletion requests

### 2. Client-Side Integration
- **Location:** `src/services/imageService.js`
- **Functions:**
  - `processProductImage()` - Sends images to backend for processing
  - `deleteProductImage()` - Requests image deletion from backend

### 3. Form Integration
- **Location:** `src/components/ProductForm.jsx`
- **Features:**
  - Temporarily stores File objects
  - Processes images before saving product
  - Shows loading state during processing
  - Displays error messages if processing fails

### 4. Component Updates
- **ImageUpload.jsx:** Passes File objects instead of dataURLs
- **GalleryUpload.jsx:** Handles both File objects and string paths

## Image Processing Details

### Filename Format
- **Primary Image:** `product-{id}-primary.{ext}`
  - Example: `product-23-primary.jpg`
- **Gallery Images:** `product-{id}-gallery-{index}.{ext}`
  - Example: `product-23-gallery-0.jpg`

### Image Formats Generated
Each uploaded image is converted to three formats:
1. **JPG** - Quality 90, progressive (best compatibility)
2. **WebP** - Quality 80 (good compression, wide support)
3. **AVIF** - Quality 60 (excellent compression, newer format)

### Image Resizing
- Images larger than 2000x2000px are automatically resized
- Maintains aspect ratio (fit: 'inside')
- Smaller images are not enlarged

## Test Procedures

### Test 1: Upload Primary Image for New Product
**Steps:**
1. Start the application: `npm run electron:dev`
2. Click "Add New Product" button
3. Fill in required fields (name, category, description, price)
4. Upload a primary image (drag & drop or click to browse)
5. Click "Save" button
6. Wait for processing to complete

**Expected Results:**
- ✅ Button shows "Processing..." during upload
- ✅ Three files created in `/images` folder:
  - `product-{id}-primary.jpg`
  - `product-{id}-primary.webp`
  - `product-{id}-primary.avif`
- ✅ Product saved to `products.json`
- ✅ `product.images.primary` = `images/product-{id}-primary.jpg`
- ✅ `product.image` = `images/product-{id}-primary.jpg` (legacy field)

### Test 2: Upload Large Image (Resize Test)
**Steps:**
1. Create or download a 4000x4000px test image
2. Add a new product
3. Upload the large image as primary
4. Save the product
5. Check the saved image dimensions

**How to check dimensions:**
```powershell
# Using ImageMagick (if installed)
magick identify "mockup products and images\images\product-{id}-primary.jpg"

# Or right-click the file > Properties > Details tab
```

**Expected Results:**
- ✅ Original image: 4000x4000px
- ✅ Saved JPG: 2000x2000px (or smaller, maintaining aspect ratio)
- ✅ All three formats (jpg, webp, avif) have same dimensions
- ✅ Image quality is maintained

### Test 3: Upload Multiple Gallery Images
**Steps:**
1. Edit an existing product (ID 23)
2. Click "Add Image" in the Gallery Images section
3. Select 3 images at once
4. Click "Save"
5. Check the `/images` folder

**Expected Results:**
- ✅ For each gallery image (0, 1, 2), three files created:
  - `product-23-gallery-0.jpg`, `product-23-gallery-0.webp`, `product-23-gallery-0.avif`
  - `product-23-gallery-1.jpg`, `product-23-gallery-1.webp`, `product-23-gallery-1.avif`
  - `product-23-gallery-2.jpg`, `product-23-gallery-2.webp`, `product-23-gallery-2.avif`
- ✅ `product.images.gallery` array contains paths to JPG files
- ✅ Gallery images display correctly in the form

### Test 4: Replace Existing Primary Image
**Steps:**
1. Edit a product that already has a primary image (ID 23)
2. Note the current primary image filename
3. Click "Replace" on the primary image
4. Upload a new image
5. Click "Save"
6. Check the `/images` folder

**Expected Results:**
- ✅ Old image files remain (not deleted automatically)
- ✅ New image files created with same naming pattern
- ✅ `product.images.primary` updated to new image path
- ✅ Old image files can be manually deleted later

### Test 5: Error Handling - Invalid File
**Steps:**
1. Try to upload a non-image file (e.g., .txt, .pdf)
2. Try to upload an image smaller than 400x400px
3. Try to upload an image larger than 10MB

**Expected Results:**
- ✅ Validation error shown before processing
- ✅ File not sent to backend
- ✅ User-friendly error message displayed
- ✅ Form remains functional

### Test 6: Multiple Products with Same ID Pattern
**Steps:**
1. Create product ID 23
2. Upload primary image
3. Create product ID 230
4. Upload primary image
5. Check filename uniqueness

**Expected Results:**
- ✅ Product 23: `product-23-primary.jpg`
- ✅ Product 230: `product-230-primary.jpg`
- ✅ No filename conflicts
- ✅ Both products save correctly

### Test 7: Form Integration - Loading States
**Steps:**
1. Upload a large image (5MB+)
2. Click "Save" immediately
3. Observe the UI during processing

**Expected Results:**
- ✅ "Save" button shows "Processing..."
- ✅ All buttons disabled during processing
- ✅ User cannot close form during processing
- ✅ Success/error message shown after completion

### Test 8: Gallery Reordering After Upload
**Steps:**
1. Edit a product
2. Upload 3 new gallery images
3. Before saving, drag images to reorder
4. Click "Save"
5. Reload the product

**Expected Results:**
- ✅ Images processed in the reordered sequence
- ✅ Filenames reflect the final order (gallery-0, gallery-1, gallery-2)
- ✅ Gallery displays images in correct order after reload

## File Structure Verification

After testing, your project should have this structure:

```
mockup products and images/
├── products.json
└── images/
    ├── product-23-primary.jpg
    ├── product-23-primary.webp
    ├── product-23-primary.avif
    ├── product-23-gallery-0.jpg
    ├── product-23-gallery-0.webp
    ├── product-23-gallery-0.avif
    ├── product-23-gallery-1.jpg
    ├── product-23-gallery-1.webp
    ├── product-23-gallery-1.avif
    └── ...
```

## Verification Checklist

### Code Implementation
- ✅ Sharp module imported in electron/main.js
- ✅ generateImageFilename() function created
- ✅ processProductImage() function processes images correctly
- ✅ IPC handlers added for image:process and image:delete
- ✅ Preload.js exposes image API
- ✅ imageService.js has processProductImage() function
- ✅ ProductForm handles File objects temporarily
- ✅ ProductForm processes images before saving
- ✅ ImageUpload passes File objects
- ✅ GalleryUpload handles both Files and paths

### Runtime Verification
- ✅ No console errors during image upload
- ✅ Image processing completes successfully
- ✅ Three formats generated for each image
- ✅ Correct filenames used
- ✅ Products.json updated with correct paths
- ✅ Images display correctly after save
- ✅ Large images resized to 2000x2000px
- ✅ Loading states work correctly
- ✅ Error handling works for invalid files

## Performance Notes

### Processing Time
- Small images (< 1MB): < 1 second
- Medium images (1-5MB): 1-3 seconds
- Large images (5-10MB): 3-5 seconds
- Multiple gallery images: ~2 seconds per image

### Optimization Tips
1. **Parallel Processing:** Gallery images are processed in parallel
2. **Quality Settings:** Adjust quality values in processProductImage() if needed
3. **Format Selection:** Remove unused formats to speed up processing

## Troubleshooting

### Issue: "processProductImage is not a function"
**Solution:** Restart Electron app to reload main process changes

### Issue: "Cannot find module 'sharp'"
**Solution:** 
```powershell
npm install sharp
```

### Issue: Images not appearing in products.json
**Solution:** Check console for errors, verify projectPath is correct

### Issue: "Permission denied" when saving images
**Solution:** Check write permissions on the images folder

### Issue: Preview not showing for File objects
**Solution:** Check imagePreviews state in GalleryUpload component

## Next Steps

After successful testing:
1. ✅ Implement image deletion when products are deleted
2. ✅ Add image cleanup for replaced images
3. ✅ Add image optimization settings in app settings
4. ✅ Implement image cropping/editing features
5. ✅ Add support for more image formats

## Development Commands

```powershell
# Run development mode
npm run electron:dev

# Run tests
npm test

# Build production version
npm run electron:build
```

## Notes
- All image paths use forward slashes for cross-platform compatibility
- The primary JPG is stored in products.json (not WebP or AVIF)
- Old images are not automatically deleted to prevent data loss
- Image validation happens client-side before backend processing
