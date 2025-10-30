import React, { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import './ImageCropModal.css';

/**
 * ImageCropModal Component
 * Modal for cropping images with zoom and pan controls
 * Enforces 1:1 aspect ratio for product images
 */
const ImageCropModal = ({ isOpen, imageUrl, onCropComplete, onCancel, imageName = 'image' }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  // Handle crop completion
  const onCropCompleteInternal = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  // Handle save button
  const handleSave = useCallback(() => {
    if (croppedAreaPixels && onCropComplete) {
      onCropComplete(croppedAreaPixels);
    }
  }, [croppedAreaPixels, onCropComplete]);

  // Handle cancel
  const handleCancel = useCallback(() => {
    if (onCancel) {
      onCancel();
    }
  }, [onCancel]);

  if (!isOpen) return null;

  return (
    <div className="crop-modal-overlay" onClick={handleCancel}>
      <div className="crop-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="crop-modal-header">
          <h3>Crop Image to Recommended Size</h3>
          <button className="crop-modal-close" onClick={handleCancel} aria-label="Close">
            ✕
          </button>
        </div>

        <div className="crop-modal-body">
          <div className="crop-area-container">
            <Cropper
              image={imageUrl}
              crop={crop}
              zoom={zoom}
              aspect={1}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropCompleteInternal}
              objectFit="contain"
              cropShape="rect"
              showGrid={true}
            />
          </div>

          <div className="crop-controls">
            <div className="crop-control-group">
              <label htmlFor="zoom-slider" className="crop-control-label">
                <span className="crop-icon">🔍</span>
                Zoom
              </label>
              <input
                id="zoom-slider"
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="crop-slider"
              />
              <span className="crop-value">{zoom.toFixed(1)}x</span>
            </div>

            <div className="crop-info">
              <p className="crop-info-text">
                <span className="info-icon">ℹ️</span>
                Drag to reposition • Pinch or scroll to zoom
              </p>
              <p className="crop-recommendation">
                📐 Cropping to 1:1 ratio (square) for optimal display
              </p>
            </div>
          </div>
        </div>

        <div className="crop-modal-footer">
          <button type="button" className="btn btn-secondary" onClick={handleCancel}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary" onClick={handleSave}>
            Apply Crop
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageCropModal;

/**
 * Helper function to create cropped image
 * @param {string} imageSrc - Source image URL
 * @param {Object} pixelCrop - Crop area in pixels
 * @param {number} pixelCrop.x - X coordinate
 * @param {number} pixelCrop.y - Y coordinate
 * @param {number} pixelCrop.width - Crop width
 * @param {number} pixelCrop.height - Crop height
 * @returns {Promise<File>} - Cropped image as File object
 */
export async function getCroppedImg(imageSrc, pixelCrop, fileName = 'cropped-image.jpg') {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Could not get canvas context');
  }

  // Set canvas size to match crop area
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  // Draw the cropped image
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  // Convert canvas to blob
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Canvas is empty'));
          return;
        }
        // Create File from Blob
        const file = new File([blob], fileName, {
          type: 'image/jpeg',
          lastModified: Date.now(),
        });
        resolve(file);
      },
      'image/jpeg',
      0.95 // Quality
    );
  });
}

/**
 * Helper function to create image element from URL
 * @param {string} url - Image URL
 * @returns {Promise<HTMLImageElement>}
 */
function createImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.setAttribute('crossOrigin', 'anonymous'); // Handle CORS
    image.src = url;
  });
}
