# Icon Creation Instructions

## Current Status
A placeholder SVG icon has been created at `build/icon.svg`. For production, you need to create proper icon files.

## Required Icon Files

### Windows (.ico)
- **File**: `build/icon.ico`
- **Sizes**: Should contain multiple sizes (16x16, 32x32, 48x48, 64x64, 128x128, 256x256)
- **Format**: ICO file format

### macOS (.icns)
- **File**: `build/icon.icns`
- **Sizes**: Multiple sizes from 16x16 to 1024x1024
- **Format**: ICNS file format

### Linux (.png)
- **File**: `build/icon.png`
- **Size**: 512x512 pixels
- **Format**: PNG with transparency

## How to Create Icons

### Option 1: Use Online Tools
1. Use the `icon.svg` as a base
2. Convert using online tools:
   - [CloudConvert](https://cloudconvert.com/) - Convert SVG to ICO/ICNS/PNG
   - [ICO Convert](https://icoconvert.com/) - Specialized ICO converter
   - [Convertio](https://convertio.co/) - Multi-format converter

### Option 2: Use Electron Icon Maker
```bash
npm install -g electron-icon-maker
electron-icon-maker --input=build/icon.svg --output=build
```

### Option 3: Use Design Software
- **Adobe Illustrator/Photoshop**: Export to required formats
- **Figma**: Export at different sizes
- **Inkscape** (Free): Export SVG to PNG at various sizes, then convert

## Automated Conversion (Recommended)

Install `electron-icon-maker`:
```bash
npm install -g electron-icon-maker
```

Then run:
```bash
electron-icon-maker --input=build/icon.svg --output=build
```

This will automatically generate all required icon files (icon.ico, icon.icns, icon.png).

## Manual ICO Creation

If you need to create .ico manually:

### Windows
1. Install ImageMagick: `choco install imagemagick`
2. Convert:
```bash
magick convert icon.svg -define icon:auto-resize=256,128,64,48,32,16 icon.ico
```

### Using Online Tools
1. Export SVG to PNG at 256x256
2. Upload to https://icoconvert.com/
3. Select "Custom sizes" and choose: 16, 32, 48, 64, 128, 256
4. Download the generated .ico file

## Verification

After creating icons, verify they work:
- Windows: Right-click the .ico file → Preview
- macOS: Open .icns with Preview app
- Linux: View .png with any image viewer

## Design Guidelines

For best results:
- Keep the design simple and recognizable at small sizes
- Use solid colors that work well at 16x16 pixels
- Avoid thin lines that disappear when scaled down
- Test the icon at all sizes before building
- Consider both light and dark backgrounds
