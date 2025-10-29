# Image Deletion & Cleanup - Quick Reference

## Quick Test Guide

### Test 1: Product Deletion (2 minutes)
1. Create product with 1 primary + 3 gallery images → **12 files created**
2. Delete the product → **All 12 files deleted**
3. ✅ Check `images/` folder - no files for that product ID

### Test 2: Image Replacement (2 minutes)
1. Edit product, replace primary image
2. Save product → **Old 3 files deleted, new 3 files created**
3. ✅ Check `images/` folder - only new files exist

---

## File Count Reference

| Images | Formats | Total Files |
|--------|---------|-------------|
| 1 primary | 3 (jpg, webp, avif) | 3 |
| 1 gallery | 3 (jpg, webp, avif) | 3 |
| 1 primary + 3 gallery | 4 × 3 | **12** |

---

## File Naming Patterns

```
Primary:  product-{id}-primary.{jpg|webp|avif}
Gallery:  product-{id}-gallery-{index}.{jpg|webp|avif}
```

**Example (Product ID 23):**
```
product-23-primary.jpg
product-23-primary.webp
product-23-primary.avif
product-23-gallery-0.jpg
product-23-gallery-0.webp
product-23-gallery-0.avif
```

---

## API Quick Reference

### ImageService

```javascript
import { deleteProductImages, deleteProductImage } from './services/imageService.js';

// Delete all images for a product
await deleteProductImages(projectPath, productId, 'all');
// Returns: { success: true, deletedCount: 12 }

// Delete only primary images
await deleteProductImages(projectPath, productId, 'primary');
// Returns: { success: true, deletedCount: 3 }

// Delete only gallery images
await deleteProductImages(projectPath, productId, 'gallery');
// Returns: { success: true, deletedCount: 9 }

// Delete a specific image (all formats)
await deleteProductImage(projectPath, 'images/product-23-primary.jpg');
// Returns: true (deleted 3 files: jpg, webp, avif)
```

---

## When Images Are Deleted

### ✅ Automatically Deleted
- **Product deletion:** All images deleted
- **Primary image replaced:** Old primary deleted
- **Gallery image removed:** Removed gallery deleted
- **Gallery image replaced:** Old gallery deleted

### ❌ NOT Deleted
- Updating product name/price/description
- Adding new gallery images (keeping existing)
- Viewing/browsing products

---

## Troubleshooting

### Files not deleted?
```javascript
// Check console for errors
// Look for: "Error deleting product images"

// Verify in browser console:
window.electron.image.deleteProductImages
// Should be: [Function]
```

### Wrong count of files?
- 1 image = 3 files (jpg, webp, avif)
- Check all three formats exist
- Verify product ID matches

### Performance issues?
- Typical deletion: < 100ms for 12 files
- Check terminal for Electron errors
- Verify disk space and permissions

---

## Where to Find Files

```
your-project/
  images/
    product-1-primary.jpg
    product-1-primary.webp
    product-1-primary.avif
    product-1-gallery-0.jpg
    product-1-gallery-0.webp
    product-1-gallery-0.avif
    ...
```

**Quick check in PowerShell:**
```powershell
# Count all product images
(Get-ChildItem images\product-* | Measure-Object).Count

# Count images for product 23
(Get-ChildItem images\product-23-* | Measure-Object).Count

# List images for product 23
Get-ChildItem images\product-23-*
```

---

## Testing Checklist

- [ ] Delete product with images → All files removed
- [ ] Replace primary image → Old files deleted
- [ ] Remove gallery image → Old files deleted
- [ ] Update product (no image changes) → No deletions
- [ ] Delete product without images → No errors

---

## Documentation Files

- **`IMAGE_DELETION_TESTING_GUIDE.md`** - Complete testing scenarios
- **`IMAGE_DELETION_IMPLEMENTATION.md`** - Technical implementation details
- **`IMAGE_DELETION_QUICK_REFERENCE.md`** - This file

---

## Success Indicators

✅ No orphaned files in `images/` folder  
✅ File count matches expectations (images × 3)  
✅ No console errors during operations  
✅ Smooth UI experience (no delays)  

---

## Common Scenarios

### Scenario: "I deleted a product but files remain"
**Check:**
1. Console errors?
2. File permissions on `images/` folder?
3. Product actually deleted from products.json?

### Scenario: "Image replacement created duplicates"
**Check:**
1. Old files should have different timestamps
2. New files should be larger/smaller (different content)
3. Should be exactly 3 files per image type

### Scenario: "Too many files in images folder"
**Solution:**
- Delete unused products to clean up
- Check for duplicated product IDs
- Look for orphaned files (manual cleanup)

---

**Need help?** See `IMAGE_DELETION_TESTING_GUIDE.md` for detailed test procedures.
