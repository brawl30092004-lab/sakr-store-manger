import React, { useState, useCallback, useEffect } from 'react';
import Cropper from 'react-easy-crop';
import './ImageCropModal.css';

/**
 * ImageCropModal Component
 * Advanced modal for cropping images with zoom, pan, and rotation controls
 * Supports multiple aspect ratios with 1:1 (square) as default
 */
const ImageCropModal = ({ isOpen, imageUrl, onCropComplete, onCancel, imageName = 'image' }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [aspectRatio, setAspectRatio] = useState(1); // 1:1 square by default
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setRotation(0);
      setAspectRatio(1);
      setCroppedAreaPixels(null);
      setIsSaving(false);
    }
  }, [isOpen]);

  // Handle crop completion
  const onCropCompleteInternal = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  // Handle save button
  const handleSave = useCallback(async () => {
    if (croppedAreaPixels && onCropComplete && !isSaving) {
      setIsSaving(true);
      try {
        await onCropComplete(croppedAreaPixels, rotation);
      } catch (error) {
        console.error('Error saving crop:', error);
        setIsSaving(false);
      }
    }
  }, [croppedAreaPixels, rotation, onCropComplete, isSaving]);

  // Handle cancel
  const handleCancel = useCallback(() => {
    if (onCancel && !isSaving) {
      onCancel();
    }
  }, [onCancel, isSaving]);

  // Handle reset
  const handleReset = useCallback(() => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
  }, []);

  // Handle keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      // ESC to cancel
      if (e.key === 'Escape' && !isSaving) {
        handleCancel();
      }
      // Enter to save
      if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        handleSave();
      }
      // Arrow keys for fine-tuning crop position
      if (e.key.startsWith('Arrow')) {
        e.preventDefault();
        const step = e.shiftKey ? 10 : 1;
        setCrop(prev => {
          switch (e.key) {
            case 'ArrowUp': return { ...prev, y: prev.y - step };
            case 'ArrowDown': return { ...prev, y: prev.y + step };
            case 'ArrowLeft': return { ...prev, x: prev.x - step };
            case 'ArrowRight': return { ...prev, x: prev.x + step };
            default: return prev;
          }
        });
      }
      // + / - for zoom
      if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        setZoom(prev => Math.min(3, prev + 0.1));
      }
      if (e.key === '-' || e.key === '_') {
        e.preventDefault();
        setZoom(prev => Math.max(1, prev - 0.1));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSaving, handleCancel, handleSave]);

  if (!isOpen) return null;

  return (
    <div className="crop-modal-overlay" onClick={handleCancel}>
      <div className="crop-modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="crop-modal-header">
          <div>
            <h3>Crop Image</h3>
            <p className="crop-modal-subtitle">Adjust, zoom, and rotate to get the perfect crop</p>
          </div>
          <button 
            className="crop-modal-close" 
            onClick={handleCancel} 
            disabled={isSaving}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="crop-modal-body">
          <div className="crop-area-container">
            <Cropper
              image={imageUrl}
              crop={crop}
              zoom={zoom}
              rotation={rotation}
              aspect={aspectRatio}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onRotationChange={setRotation}
              onCropComplete={onCropCompleteInternal}
              objectFit="contain"
              cropShape="rect"
              showGrid={true}
              restrictPosition={true}
            />
          </div>

          <div className="crop-controls">
            {/* Aspect Ratio Presets */}
            <div className="crop-control-section">
              <label className="crop-section-label">Aspect Ratio</label>
              <div className="aspect-ratio-buttons">
                <button 
                  className={`aspect-btn ${aspectRatio === 1 ? 'active' : ''}`}
                  onClick={() => setAspectRatio(1)}
                  type="button"
                >
                  <span className="aspect-icon">□</span>
                  <span>1:1</span>
                  <span className="aspect-label">Square</span>
                </button>
                <button 
                  className={`aspect-btn ${aspectRatio === 4/3 ? 'active' : ''}`}
                  onClick={() => setAspectRatio(4/3)}
                  type="button"
                >
                  <span className="aspect-icon">▭</span>
                  <span>4:3</span>
                  <span className="aspect-label">Standard</span>
                </button>
                <button 
                  className={`aspect-btn ${aspectRatio === 16/9 ? 'active' : ''}`}
                  onClick={() => setAspectRatio(16/9)}
                  type="button"
                >
                  <span className="aspect-icon">▬</span>
                  <span>16:9</span>
                  <span className="aspect-label">Wide</span>
                </button>
                <button 
                  className={`aspect-btn ${aspectRatio === null ? 'active' : ''}`}
                  onClick={() => setAspectRatio(undefined)}
                  type="button"
                >
                  <span className="aspect-icon">⊡</span>
                  <span>Free</span>
                  <span className="aspect-label">Any</span>
                </button>
              </div>
            </div>

            {/* Zoom Control */}
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
                step={0.05}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="crop-slider"
              />
              <span className="crop-value">{zoom.toFixed(2)}x</span>
            </div>

            {/* Rotation Control */}
            <div className="crop-control-group">
              <label htmlFor="rotation-slider" className="crop-control-label">
                <span className="crop-icon">🔄</span>
                Rotate
              </label>
              <input
                id="rotation-slider"
                type="range"
                min={0}
                max={360}
                step={1}
                value={rotation}
                onChange={(e) => setRotation(Number(e.target.value))}
                className="crop-slider"
              />
              <span className="crop-value">{rotation}°</span>
            </div>

            {/* Quick Actions */}
            <div className="crop-quick-actions">
              <button 
                type="button" 
                className="quick-action-btn"
                onClick={handleReset}
                title="Reset all adjustments"
              >
                <span className="action-icon">↺</span>
                Reset
              </button>
              <button 
                type="button" 
                className="quick-action-btn"
                onClick={() => setRotation(prev => (prev - 90 + 360) % 360)}
                title="Rotate 90° left"
              >
                <span className="action-icon">↶</span>
                Rotate Left
              </button>
              <button 
                type="button" 
                className="quick-action-btn"
                onClick={() => setRotation(prev => (prev + 90) % 360)}
                title="Rotate 90° right"
              >
                <span className="action-icon">↷</span>
                Rotate Right
              </button>
            </div>

            {/* Info & Tips */}
            <div className="crop-info">
              <p className="crop-info-text">
                <span className="info-icon">💡</span>
                <strong>Tips:</strong> Use arrow keys to fine-tune position • +/- to zoom • Enter to save • ESC to cancel
              </p>
              {aspectRatio === 1 && (
                <p className="crop-recommendation">
                  📐 Square aspect ratio (1:1) - Perfect for product images
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="crop-modal-footer">
          <button 
            type="button" 
            className="btn btn-secondary" 
            onClick={handleCancel}
            disabled={isSaving}
          >
            Cancel
          </button>
          <button 
            type="button" 
            className="btn btn-primary" 
            onClick={handleSave}
            disabled={isSaving || !croppedAreaPixels}
          >
            {isSaving ? (
              <>
                <span className="spinner"></span>
                Applying...
              </>
            ) : (
              <>
                <span className="save-icon">✓</span>
                Apply Crop
              </>
            )}
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
 * @param {number} rotation - Rotation angle in degrees
 * @param {string} fileName - Output file name
 * @returns {Promise<File>} - Cropped image as File object
 */
export async function getCroppedImg(imageSrc, pixelCrop, fileName = 'cropped-image.jpg', rotation = 0) {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Could not get canvas context');
  }

  const rotRad = (rotation * Math.PI) / 180;

  // Calculate bounding box of the rotated image
  const { width: bBoxWidth, height: bBoxHeight } = rotateSize(
    image.width,
    image.height,
    rotation
  );

  // Set canvas size to match the bounding box
  canvas.width = bBoxWidth;
  canvas.height = bBoxHeight;

  // Translate canvas context to a central location to allow rotating around the center
  ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
  ctx.rotate(rotRad);
  ctx.translate(-image.width / 2, -image.height / 2);

  // Draw rotated image
  ctx.drawImage(image, 0, 0);

  // Extract the cropped area from the rotated image
  const croppedCanvas = document.createElement('canvas');
  const croppedCtx = croppedCanvas.getContext('2d');

  if (!croppedCtx) {
    throw new Error('Could not get cropped canvas context');
  }

  // Set the size of the cropped canvas
  croppedCanvas.width = pixelCrop.width;
  croppedCanvas.height = pixelCrop.height;

  // Draw the cropped image
  croppedCtx.drawImage(
    canvas,
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
    croppedCanvas.toBlob(
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
 * Helper function to calculate rotated size
 */
function rotateSize(width, height, rotation) {
  const rotRad = (rotation * Math.PI) / 180;

  return {
    width: Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height: Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
  };
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
