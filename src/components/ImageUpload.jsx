import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useImagePath } from '../hooks/useImagePath';
import { validateUploadedImage, fileToDataURL, formatFileSize } from '../services/imageService';
import { showWarning, showSuccess, ToastMessages } from '../services/toastService';
import { checkImageRecommendations, getRecommendationStatusMessage, getRecommendationBadgeType } from '../services/imageRecommendations';
import ImageCropModal, { getCroppedImg } from './ImageCropModal';
import './ImageUpload.css';

/**
 * ImageUpload Component
 * Drag-and-drop or click-to-upload for primary product image
 * Shows preview, file info, replace/remove/crop buttons, and recommendation badges
 * @param {Object} props
 * @param {string|File} props.value - Current image value
 * @param {Function} props.onChange - Callback when image changes
 * @param {string} props.error - Validation error message
 * @param {Function} props.onCrop - Callback when image is cropped, receives {croppedAreaPixels, rotation}
 */
const ImageUpload = React.memo(function ImageUpload({ value, onChange, error, onCrop }) {
  const [preview, setPreview] = useState(value || null);
  const [fileInfo, setFileInfo] = useState(null);
  const [validationError, setValidationError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [imageDimensions, setImageDimensions] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [currentFile, setCurrentFile] = useState(null);
  const fileInputRef = useRef(null);
  
  // Resolve existing image path if it's a relative path
  const resolvedPath = useImagePath(typeof value === 'string' ? value : null);

  // Update preview when value changes (for existing images)
  useEffect(() => {
    if (typeof value === 'string' && value && !value.startsWith('data:')) {
      // It's a file path, use the resolved path
      setPreview(resolvedPath);
      setFileInfo(null); // Clear file info for existing images
      setRecommendations(null); // Clear recommendations for existing images
    } else if (typeof value === 'string' && value.startsWith('data:')) {
      // It's a data URL
      setPreview(value);
    } else if (!value) {
      setPreview(null);
      setFileInfo(null);
      setRecommendations(null);
      setImageDimensions(null);
    }
  }, [value, resolvedPath]);

  // Handle file selection - MEMOIZED
  const handleFileSelect = useCallback(async (file) => {
    if (!file) return;

    setValidationError(null);

    // Validate the image
    const validation = await validateUploadedImage(file);
    
    if (!validation.valid) {
      setValidationError(validation.error);
      return;
    }

    const { width, height } = validation.dimensions;

    // Check recommendations
    const recs = checkImageRecommendations(width, height);
    setRecommendations(recs);
    setImageDimensions({ width, height });

    // Convert to data URL for preview
    try {
      const dataURL = await fileToDataURL(file);
      setPreview(dataURL);
      setCurrentFile(file);
      setFileInfo({
        name: file.name,
        size: formatFileSize(file.size),
        dimensions: `${width}×${height}px`
      });
      
      // Show recommendation message
      if (!recs.isSquare) {
        showWarning('Image is not square. Consider cropping for best results.');
      }
      
      // Show size warning if present
      if (validation.warning) {
        showWarning(validation.warning);
      }
      
      // Pass the File object to parent (not dataURL)
      // The parent will process it through the backend when saving
      onChange(file);
    } catch (error) {
      setValidationError('Failed to process image. Please try again.');
    }
  }, [onChange]);

  // Handle file input change - MEMOIZED
  const handleInputChange = useCallback((e) => {
    const file = e.target.files[0];
    handleFileSelect(file);
  }, [handleFileSelect]);

  // Handle drag and drop - MEMOIZED
  const handleDragEnter = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleFileSelect(file);
    } else {
      setValidationError('Please drop an image file');
    }
  }, [handleFileSelect]);

  // Handle click to open file dialog - MEMOIZED
  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // Handle replace image - MEMOIZED
  const handleReplace = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // Handle remove image - MEMOIZED
  const handleRemove = useCallback(() => {
    setPreview(null);
    setFileInfo(null);
    setValidationError(null);
    setRecommendations(null);
    setImageDimensions(null);
    setCurrentFile(null);
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [onChange]);

  // Handle crop button click - MEMOIZED
  const handleCropClick = useCallback(() => {
    setIsCropModalOpen(true);
  }, []);

  // Handle crop complete - MEMOIZED
  const handleCropComplete = useCallback(async (croppedAreaPixels, rotation = 0) => {
    try {
      const croppedFile = await getCroppedImg(preview, croppedAreaPixels, currentFile?.name || 'cropped-image.jpg', rotation);
      
      // Process the cropped file
      const validation = await validateUploadedImage(croppedFile);
      const dataURL = await fileToDataURL(croppedFile);
      
      const { width, height } = validation.dimensions;
      const recs = checkImageRecommendations(width, height);
      
      setPreview(dataURL);
      setCurrentFile(croppedFile);
      setRecommendations(recs);
      setImageDimensions({ width, height });
      setFileInfo({
        name: croppedFile.name,
        size: formatFileSize(croppedFile.size),
        dimensions: `${width}×${height}px`
      });
      
      // Pass cropped file to parent
      onChange(croppedFile);
      
      // Call onCrop callback with crop parameters
      if (onCrop) {
        onCrop({ croppedAreaPixels, rotation });
      }
      
      setIsCropModalOpen(false);
      showSuccess('Image cropped successfully!');
    } catch (error) {
      console.error('Crop error:', error);
      setValidationError('Failed to crop image. Please try again.');
      setIsCropModalOpen(false);
    }
  }, [preview, currentFile, onChange, onCrop]);

  // Handle crop cancel - MEMOIZED
  const handleCropCancel = useCallback(() => {
    setIsCropModalOpen(false);
  }, []);

  return (
    <div className="image-upload">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        onChange={handleInputChange}
        style={{ display: 'none' }}
      />

      {!preview ? (
        // Upload Area
        <div
          className={`upload-area ${isDragging ? 'dragging' : ''} ${error || validationError ? 'error' : ''}`}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          <div className="upload-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
          </div>
          <p className="upload-text">Drag & drop an image here</p>
          <p className="upload-subtext">or click to browse</p>
          <p className="upload-requirements">
            JPEG, PNG, WebP, AVIF • Max 10 MB
          </p>
          <div className="upload-recommendations">
            <p className="recommendation-title">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <path d="M9 11l3 3L22 4"/>
              </svg>
              Recommended:
            </p>
            <p className="recommendation-details">800×800px to 1200×1200px • Square (1:1 ratio)</p>
          </div>
        </div>
      ) : (
        // Preview Area
        <div className="preview-area">
          <div className="preview-image-container">
            <img src={preview} alt="Primary product" className="preview-image" />
            
            {/* Recommendation Badge */}
            {recommendations && (
              <div className={`recommendation-badge badge-${getRecommendationBadgeType(recommendations)}`}>
                {getRecommendationStatusMessage(recommendations)}
              </div>
            )}
          </div>
          
          {fileInfo && (
            <div className="file-info">
              <p className="file-name" title={fileInfo.name}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                </svg>
                {fileInfo.name}
              </p>
              <p className="file-details">
                {fileInfo.size} • {fileInfo.dimensions}
              </p>
              
              {/* Show recommendations details */}
              {recommendations && recommendations.suggestions.length > 0 && (
                <div className="file-recommendations">
                  {recommendations.suggestions.map((suggestion, index) => (
                    <p key={index} className="recommendation-text">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10"/>
                        <path d="M12 16v-4"/>
                        <path d="M12 8h.01"/>
                      </svg>
                      {suggestion}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="preview-actions">
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleReplace}
            >
              Replace
            </button>
            
            {/* Crop button - always visible */}
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={handleCropClick}
              title="Crop image"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6.13 1L6 16a2 2 0 0 0 2 2h15"/>
                <path d="M1 6.13L16 6a2 2 0 0 1 2 2v15"/>
              </svg>
              Crop
            </button>
            
            <button
              type="button"
              className="btn btn-danger btn-sm"
              onClick={handleRemove}
            >
              Remove
            </button>
          </div>
        </div>
      )}

      {/* Error Messages */}
      {validationError && (
        <div className="image-error-message">{validationError}</div>
      )}
      {error && !validationError && (
        <div className="image-error-message">{error}</div>
      )}

      {/* Crop Modal */}
      <ImageCropModal
        isOpen={isCropModalOpen}
        imageUrl={preview}
        onCropComplete={handleCropComplete}
        onCancel={handleCropCancel}
        imageName={fileInfo?.name}
      />
    </div>
  );
});

export default ImageUpload;
