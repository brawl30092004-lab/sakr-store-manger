import React, { useState, useRef, useEffect } from 'react';
import { useImagePath } from '../hooks/useImagePath';
import { validateUploadedImage, fileToDataURL, formatFileSize } from '../services/imageService';
import { showWarning, ToastMessages } from '../services/toastService';
import './ImageUpload.css';

/**
 * ImageUpload Component
 * Drag-and-drop or click-to-upload for primary product image
 * Shows preview, file info, and replace/remove buttons
 */
function ImageUpload({ value, onChange, error }) {
  const [preview, setPreview] = useState(value || null);
  const [fileInfo, setFileInfo] = useState(null);
  const [validationError, setValidationError] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  
  // Resolve existing image path if it's a relative path
  const resolvedPath = useImagePath(typeof value === 'string' ? value : null);

  // Update preview when value changes (for existing images)
  useEffect(() => {
    if (typeof value === 'string' && value && !value.startsWith('data:')) {
      // It's a file path, use the resolved path
      setPreview(resolvedPath);
      setFileInfo(null); // Clear file info for existing images
    } else if (typeof value === 'string' && value.startsWith('data:')) {
      // It's a data URL
      setPreview(value);
    } else if (!value) {
      setPreview(null);
      setFileInfo(null);
    }
  }, [value, resolvedPath]);

  // Handle file selection
  const handleFileSelect = async (file) => {
    if (!file) return;

    setValidationError(null);

    // Validate the image
    const validation = await validateUploadedImage(file);
    
    if (!validation.valid) {
      setValidationError(validation.error);
      return;
    }

    // Convert to data URL for preview
    try {
      const dataURL = await fileToDataURL(file);
      setPreview(dataURL);
      setFileInfo({
        name: file.name,
        size: formatFileSize(file.size),
        dimensions: `${validation.dimensions.width}x${validation.dimensions.height}px`
      });
      
      // Check if image is square and warn if not
      if (validation.dimensions.width !== validation.dimensions.height) {
        showWarning(ToastMessages.IMAGE_NOT_SQUARE);
      }
      
      // Pass the File object to parent (not dataURL)
      // The parent will process it through the backend when saving
      onChange(file);
    } catch (error) {
      setValidationError('Failed to process image. Please try again.');
    }
  };

  // Handle file input change
  const handleInputChange = (e) => {
    const file = e.target.files[0];
    handleFileSelect(file);
  };

  // Handle drag and drop
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleFileSelect(file);
    } else {
      setValidationError('Please drop an image file');
    }
  };

  // Handle click to open file dialog
  const handleClick = () => {
    fileInputRef.current?.click();
  };

  // Handle replace image
  const handleReplace = () => {
    fileInputRef.current?.click();
  };

  // Handle remove image
  const handleRemove = () => {
    setPreview(null);
    setFileInfo(null);
    setValidationError(null);
    onChange('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

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
            JPEG, PNG, WebP, AVIF • Max 10 MB • Min 400x400px
          </p>
        </div>
      ) : (
        // Preview Area
        <div className="preview-area">
          <div className="preview-image-container">
            <img src={preview} alt="Primary product" className="preview-image" />
          </div>
          
          {fileInfo && (
            <div className="file-info">
              <p className="file-name" title={fileInfo.name}>
                📄 {fileInfo.name}
              </p>
              <p className="file-details">
                {fileInfo.size} • {fileInfo.dimensions}
              </p>
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
    </div>
  );
}

export default ImageUpload;
