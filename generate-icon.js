const fs = require('fs');
const path = require('path');

// Simple script to create a basic ICO file structure
// This creates a minimal 256x256 icon in BMP format wrapped in ICO header

const width = 256;
const height = 256;
const bpp = 32; // bits per pixel (RGBA)

// Create a simple blue store icon as BMP data
function createBitmap() {
  const bytesPerPixel = 4; // RGBA
  const rowSize = width * bytesPerPixel;
  const pixelDataSize = rowSize * height;
  
  // BMP data (bottom-up, BGRA format)
  const pixels = Buffer.alloc(pixelDataSize);
  
  // Fill with a simple pattern (blue background with white store shape)
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const offset = (y * width + x) * bytesPerPixel;
      
      // Background - blue (#2563eb)
      let b = 0xeb, g = 0x63, r = 0x25, a = 0xff;
      
      // Simple store shape (white)
      const centerX = width / 2;
      const centerY = height / 2;
      const storeWidth = 192;
      const storeHeight = 160;
      
      // Awning (top)
      if (y >= centerY - 80 && y <= centerY - 40 && 
          x >= centerX - 96 && x <= centerX + 96) {
        b = g = r = 0xff; // White
      }
      
      // Store front
      if (y >= centerY - 40 && y <= centerY + 80 && 
          x >= centerX - 96 && x <= centerX + 96) {
        b = g = r = 0xf0; // Light gray
      }
      
      // Door
      if (y >= centerY - 10 && y <= centerY + 80 && 
          x >= centerX - 26 && x <= centerX + 26) {
        b = 0xfd; g = 0xc5; r = 0x93; // Light blue
      }
      
      // Windows
      if ((y >= centerY - 60 && y <= centerY - 20) && 
          ((x >= centerX - 86 && x <= centerX - 51) || 
           (x >= centerX + 51 && x <= centerX + 86))) {
        b = 0xfe; g = 0xdb; r = 0xbf; // Very light blue
      }
      
      pixels[offset] = b;     // Blue
      pixels[offset + 1] = g; // Green
      pixels[offset + 2] = r; // Red
      pixels[offset + 3] = a; // Alpha
    }
  }
  
  return pixels;
}

// Create ICO file format
function createICO() {
  const pixels = createBitmap();
  
  // ICO Header (6 bytes)
  const icoHeader = Buffer.alloc(6);
  icoHeader.writeUInt16LE(0, 0);      // Reserved (must be 0)
  icoHeader.writeUInt16LE(1, 2);      // Type (1 = ICO)
  icoHeader.writeUInt16LE(1, 4);      // Number of images
  
  // Image Directory Entry (16 bytes)
  const dirEntry = Buffer.alloc(16);
  dirEntry.writeUInt8(width === 256 ? 0 : width, 0);   // Width (0 means 256)
  dirEntry.writeUInt8(height === 256 ? 0 : height, 1); // Height (0 means 256)
  dirEntry.writeUInt8(0, 2);           // Color palette (0 = no palette)
  dirEntry.writeUInt8(0, 3);           // Reserved
  dirEntry.writeUInt16LE(1, 4);        // Color planes
  dirEntry.writeUInt16LE(32, 6);       // Bits per pixel
  
  const imageDataSize = 40 + pixels.length; // BITMAPINFOHEADER + pixel data
  dirEntry.writeUInt32LE(imageDataSize, 8); // Size of image data
  dirEntry.writeUInt32LE(22, 12);      // Offset to image data (6 + 16)
  
  // BITMAPINFOHEADER (40 bytes)
  const bmpHeader = Buffer.alloc(40);
  bmpHeader.writeUInt32LE(40, 0);           // Header size
  bmpHeader.writeInt32LE(width, 4);         // Width
  bmpHeader.writeInt32LE(height * 2, 8);    // Height (doubled for XOR + AND masks)
  bmpHeader.writeUInt16LE(1, 12);           // Planes
  bmpHeader.writeUInt16LE(32, 14);          // Bits per pixel
  bmpHeader.writeUInt32LE(0, 16);           // Compression (0 = none)
  bmpHeader.writeUInt32LE(pixels.length, 20); // Image size
  bmpHeader.writeInt32LE(0, 24);            // X pixels per meter
  bmpHeader.writeInt32LE(0, 28);            // Y pixels per meter
  bmpHeader.writeUInt32LE(0, 32);           // Colors used
  bmpHeader.writeUInt32LE(0, 36);           // Important colors
  
  // Combine all parts
  return Buffer.concat([icoHeader, dirEntry, bmpHeader, pixels]);
}

// Write the ICO file
const icoData = createICO();
const outputPath = path.join(__dirname, 'build', 'icon.ico');
fs.writeFileSync(outputPath, icoData);

console.log(`✓ Created icon.ico (${width}x${height}, ${icoData.length} bytes)`);
console.log(`  Location: ${outputPath}`);
