# Image Processing API Quick Reference

## Backend API (Electron Main Process)

### processProductImage(imageBuffer, projectPath, productId, imageType, index)
Processes an uploaded image and saves in multiple formats.

**Parameters:**
- `imageBuffer` (Buffer) - Image data as Buffer
- `projectPath` (string) - Project root path
- `productId` (number) - Product ID
- `imageType` (string) - `'primary'` or `'gallery'`
- `index` (number|null) - Gallery index (null for primary)

**Returns:** Promise<string> - Path to JPG file (e.g., `"images/product-23-primary.jpg"`)

**Behavior:**
- Resizes if > 2000x2000px
- Generates 3 formats: JPG (90%), WebP (80%), AVIF (60%)
- Saves to `{projectPath}/images/` folder

---

### generateImageFilename(productId, imageType, index, extension)
Generates standardized filename.

**Returns:** 
- Primary: `"product-{id}-primary.{ext}"`
- Gallery: `"product-{id}-gallery-{index}.{ext}"`

---

## Client API (Renderer Process)

### window.electron.image.processImage(imageData, projectPath, productId, imageType, index)
IPC call to process image.

**Parameters:**
- `imageData` (string) - Base64 dataURL
- `projectPath` (string) - Project root path
- `productId` (number) - Product ID
- `imageType` (string) - `'primary'` or `'gallery'`
- `index` (number|null) - Gallery index

**Returns:** Promise<{success: boolean, path?: string, error?: string}>

---

### window.electron.image.deleteImage(projectPath, imagePath)
IPC call to delete image files.

**Parameters:**
- `projectPath` (string) - Project root path
- `imagePath` (string) - Relative image path

**Returns:** Promise<{success: boolean, error?: string}>

---

## Service Layer (imageService.js)

### processProductImage(file, projectPath, productId, imageType, index)
High-level image processing function.

**Parameters:**
- `file` (File) - Browser File object
- `projectPath` (string) - Project root path
- `productId` (number) - Product ID
- `imageType` (string) - `'primary'` or `'gallery'`
- `index` (number|null) - Gallery index

**Returns:** Promise<string> - Path to saved JPG

**Usage:**
```javascript
const imagePath = await processProductImage(
  file,
  projectPath,
  23,
  'primary',
  null
);
// Returns: "images/product-23-primary.jpg"
```

---

### deleteProductImage(projectPath, imagePath)
Delete image files (all formats).

**Returns:** Promise<boolean> - Success status

---

## Form Integration (ProductForm.jsx)

### State
```javascript
const [pendingImages, setPendingImages] = useState({
  primary: null,    // File object
  gallery: []       // Array of File objects
});
```

### Handlers
```javascript
handlePrimaryImageChange(fileOrPath)
handleGalleryImagesChange(filesOrPaths)
processImagesAndSave(formData)
```

### Flow
1. User uploads → File stored in `pendingImages`
2. User saves → `processImagesAndSave()` called
3. Each File processed → path returned
4. Product saved with paths

---

## Image Specifications

| Property | Value |
|----------|-------|
| Max upload size | 10 MB |
| Min dimensions | 400x400px |
| Max output dimensions | 2000x2000px |
| Input formats | JPEG, PNG, WebP, AVIF |
| Output formats | JPG, WebP, AVIF |
| JPG quality | 90% (progressive) |
| WebP quality | 80% |
| AVIF quality | 60% |

---

## File Naming Pattern

```
Primary Image:
  product-23-primary.jpg
  product-23-primary.webp
  product-23-primary.avif

Gallery Images:
  product-23-gallery-0.jpg
  product-23-gallery-0.webp
  product-23-gallery-0.avif
  
  product-23-gallery-1.jpg
  product-23-gallery-1.webp
  product-23-gallery-1.avif
```

---

## Example Usage

### Upload Primary Image
```javascript
import { processProductImage } from '../services/imageService';

// In component
const handleSave = async (formData) => {
  const projectPath = useSelector(state => state.settings.projectPath);
  
  if (pendingPrimaryImage instanceof File) {
    const imagePath = await processProductImage(
      pendingPrimaryImage,
      projectPath,
      formData.id,
      'primary',
      null
    );
    
    formData.images.primary = imagePath;
    formData.image = imagePath; // Legacy field
  }
  
  await onSave(formData);
};
```

### Upload Gallery Images
```javascript
if (pendingGalleryImages.length > 0) {
  const galleryPaths = await Promise.all(
    pendingGalleryImages.map((file, index) =>
      processProductImage(
        file,
        projectPath,
        formData.id,
        'gallery',
        index
      )
    )
  );
  
  formData.images.gallery = [...existingPaths, ...galleryPaths];
}
```

---

## Error Handling

```javascript
try {
  const path = await processProductImage(file, projectPath, id, 'primary', null);
  console.log('Success:', path);
} catch (error) {
  console.error('Failed to process image:', error.message);
  // Show error to user
}
```

**Common Errors:**
- "No file provided for processing"
- "Failed to process image: [sharp error]"
- "Image processing failed: [error]"

---

## Testing

### Test Primary Image
```javascript
// Create test product
const product = { id: 23, name: 'Test Product', ... };

// Upload image
const file = new File([blob], 'test.jpg', { type: 'image/jpeg' });
const path = await processProductImage(file, projectPath, 23, 'primary', null);

// Verify
console.log(path); // "images/product-23-primary.jpg"
// Check files exist: product-23-primary.jpg, .webp, .avif
```

### Test Gallery Images
```javascript
const files = [file1, file2, file3];
const paths = await Promise.all(
  files.map((file, i) => 
    processProductImage(file, projectPath, 23, 'gallery', i)
  )
);

// Verify
console.log(paths);
// ["images/product-23-gallery-0.jpg", 
//  "images/product-23-gallery-1.jpg",
//  "images/product-23-gallery-2.jpg"]
```

---

## Performance Tips

1. **Parallel Processing:** Use `Promise.all()` for multiple images
2. **Quality Adjustment:** Lower quality values for faster processing
3. **Format Selection:** Remove unused formats to save time
4. **Validation First:** Validate client-side before processing

---

## Directory Structure

```
project/
├── images/
│   ├── product-23-primary.jpg
│   ├── product-23-primary.webp
│   ├── product-23-primary.avif
│   ├── product-23-gallery-0.jpg
│   └── ...
└── products.json
    └── {
          "id": 23,
          "images": {
            "primary": "images/product-23-primary.jpg",
            "gallery": ["images/product-23-gallery-0.jpg", ...]
          }
        }
```
