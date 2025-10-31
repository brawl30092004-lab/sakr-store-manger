# Product Form New Features - Quick Reference

> **Last Updated**: October 31, 2025  
> **See Full Documentation**: [PRODUCT_FORM_ENHANCEMENTS.md](./PRODUCT_FORM_ENHANCEMENTS.md)

---

## 🚀 What's New - At a Glance

| Feature | What Changed | Benefit |
|---------|--------------|---------|
| 📏 **Image Preview** | 320×320px (was 200×200px) | Better visibility |
| ✂️ **Crop Button** | Always visible (was conditional) | More accessible |
| 🖱️ **Right-Click Crop** | NEW FEATURE | Batch consistency |
| 🔄 **Free Aspect Ratio** | Now works correctly | More flexibility |
| 📜 **Horizontal Scroll** | Removed from crop modal | Cleaner UI |
| ⚠️ **Size Validation** | Warning (was error) | Less restrictive |
| 🖼️ **Gallery Limit** | Unlimited (was 10) | No restrictions |
| 🎛️ **Toggle Switches** | Modern design | Better UX |

---

## 💡 Quick Tips

### Right-Click Crop Workflow
```
1. Upload primary image
2. Click "Crop" button
3. Adjust crop (zoom, rotate, aspect ratio)
4. Click "Apply Crop"
5. Upload gallery images
6. Right-click any gallery image
7. Same crop applied instantly! ✨
```

### Keyboard Shortcuts in Crop Modal
- `ESC` - Cancel
- `Enter` - Apply
- `Arrow Keys` - Fine-tune position
- `Shift + Arrow` - Move 10px
- `+/-` - Zoom in/out

### Image Best Practices
- **Recommended**: 800×800px or larger
- **Minimum**: 400×400px (warning if smaller)
- **Format**: JPEG, PNG, WebP, or AVIF
- **Max Size**: 10 MB per image

---

## 🎨 Toggle Switch Behavior

| State | Appearance |
|-------|------------|
| Unchecked | Gray background, gray thumb |
| Checked | Blue gradient, white thumb |
| Hover | Lighter/darker shade |
| Active | Thumb expands |

---

## 📊 Current Limits

- ✅ Primary Image: 1 (required)
- ✅ Gallery Images: **Unlimited** (was 10)
- ✅ File Size: 10 MB max
- ✅ Min Size: 400×400px (warning only)

---

## 🐛 Common Issues

**"No crop data available"**
→ Crop the primary image first before right-clicking gallery images

**Small image warning**
→ Image < 400×400px. Upload larger if possible, or proceed anyway

**Toggle not working**
→ Update browser to latest version (needs `:has()` CSS support)

---

## 📖 Related Docs

- [Full Enhancement Details](./PRODUCT_FORM_ENHANCEMENTS.md)
- [Image Crop Improvements](./IMAGE_CROP_IMPROVEMENTS.md)
- [Product Form Part 1](./PRODUCT_FORM_QUICK_REFERENCE.md)

