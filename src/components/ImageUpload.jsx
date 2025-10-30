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
 */
const ImageUpload = React.memo(function ImageUpload({ value, onChange, error }) {
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
  const handleCropComplete = useCallback(async (croppedAreaPixels) => {
    try {
      const croppedFile = await getCroppedImg(preview, croppedAreaPixels, currentFile?.name || 'cropped-image.jpg');
      
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
      setIsCropModalOpen(false);
      showSuccess('Image cropped successfully!');
    } catch (error) {
      console.error('Crop error:', error);
      setValidationError('Failed to crop image. Please try again.');
      setIsCropModalOpen(false);
    }
  }, [preview, currentFile, onChange]);

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
          <div className="upload-icon">📸</div>
          <p className="upload-text">Drag & drop an image here</p>
          <p className="upload-subtext">or click to browse</p>
          <p className="upload-requirements">
            JPEG, PNG, WebP, AVIF • Max 10 MB
          </p>
          <div className="upload-recommendations">
            <p className="recommendation-title">📐 Recommended:</p>
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
                📄 {fileInfo.name}
              </p>
              <p className="file-details">
                {fileInfo.size} • {fileInfo.dimensions}
              </p>
              
              {/* Show recommendations details */}
              {recommendations && recommendations.suggestions.length > 0 && (
                <div className="file-recommendations">
                  {recommendations.suggestions.map((suggestion, index) => (
                    <p key={index} className="recommendation-text">
                      💡 {suggestion}
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
            
            {/* Show crop button if image is not square */}
            {recommendations && !recommendations.isSquare && (
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={handleCropClick}
                title="Crop to recommended 1:1 ratio"
              >
                ✂️ Crop
              </button>
            )}
            
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
