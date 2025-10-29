import React, { useState, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { validateUploadedImage, fileToDataURL, validateGalleryCount } from '../services/imageService';
import './GalleryUpload.css';

/**
 * GalleryUpload Component
 * Manages multiple gallery images with drag-to-reorder, add, and remove functionality
 */
function GalleryUpload({ value = [], onChange, error }) {
  const [validationError, setValidationError] = useState(null);
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [imagePreviews, setImagePreviews] = useState({});
  const [resolvedPaths, setResolvedPaths] = useState({});
  const fileInputRef = useRef(null);
  const projectPath = useSelector(state => state.settings.projectPath);

  // Generate previews for File objects and resolve paths for existing images
  useEffect(() => {
    const processImages = async () => {
      const newPreviews = {};
      const newResolvedPaths = {};
      
      for (let i = 0; i < value.length; i++) {
        const item = value[i];
        
        if (item instanceof File && !imagePreviews[i]) {
          // Generate preview for new File objects
          try {
            const dataURL = await fileToDataURL(item);
            newPreviews[i] = dataURL;
          } catch (error) {
            console.error('Failed to generate preview:', error);
          }
        } else if (typeof item === 'string' && !item.startsWith('data:') && !item.startsWith('local-image://') && !item.startsWith('file://')) {
          // Resolve path for existing images
          if (projectPath && window.electron?.fs?.getImagePath) {
            try {
              const absolutePath = await window.electron.fs.getImagePath(projectPath, item);
              newResolvedPaths[i] = absolutePath;
            } catch (error) {
              console.error('Failed to resolve image path:', error);
            }
          }
        }
      }
      
      if (Object.keys(newPreviews).length > 0) {
        setImagePreviews(prev => ({ ...prev, ...newPreviews }));
      }
      if (Object.keys(newResolvedPaths).length > 0) {
        setResolvedPaths(prev => ({ ...prev, ...newResolvedPaths }));
      }
    };
    
    processImages();
  }, [value, projectPath]);

  // Get display URL for an item (either File object or string path)
  const getDisplayUrl = (item, index) => {
    if (typeof item === 'string') {
      if (item.startsWith('data:') || item.startsWith('local-image://') || item.startsWith('file://')) {
        return item; // Data URL or already resolved path
      }
      return resolvedPaths[index] || item; // Use resolved path or fallback to original
    } else if (item instanceof File) {
      return imagePreviews[index] || ''; // Preview from File object
    }
    return '';
  };

  // Handle file selection
  const handleFilesSelect = async (files) => {
    if (!files || files.length === 0) return;

    setValidationError(null);

    // Check gallery count
    const countValidation = validateGalleryCount(value.length, files.length);
    if (!countValidation.valid) {
      setValidationError(countValidation.error);
      return;
    }

    const newFiles = [];
    
    // Validate each file
    for (const file of files) {
      const validation = await validateUploadedImage(file);
      
      if (!validation.valid) {
        setValidationError(validation.error);
        return;
      }

      // Store the File object (not dataURL)
      // The parent will process it through the backend when saving
      newFiles.push(file);
    }

    // Add new File objects to gallery
    const updatedGallery = [...value, ...newFiles];
    onChange(updatedGallery);
  };

  // Handle file input change
  const handleInputChange = (e) => {
    const files = Array.from(e.target.files);
    handleFilesSelect(files);
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle add button click
  const handleAddClick = () => {
    // Check if we can add more
    const countValidation = validateGalleryCount(value.length, 1);
    if (!countValidation.valid) {
      setValidationError(countValidation.error);
      return;
    }
    
    fileInputRef.current?.click();
  };

  // Handle remove image
  const handleRemove = (index) => {
    const updatedGallery = value.filter((_, i) => i !== index);
    onChange(updatedGallery);
    setValidationError(null);
  };

  // Drag and drop for reordering
  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === index) return;

    const items = [...value];
    const draggedItem = items[draggedIndex];
    
    // Remove from old position
    items.splice(draggedIndex, 1);
    // Insert at new position
    items.splice(index, 0, draggedItem);
    
    onChange(items);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div className="gallery-upload">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        multiple
        onChange={handleInputChange}
        style={{ display: 'none' }}
      />

      <div className="gallery-grid">
        {/* Existing gallery images */}
        {value.map((item, index) => {
          const displayUrl = getDisplayUrl(item, index);
          
          return (
            <div
              key={index}
              className={`gallery-item ${draggedIndex === index ? 'dragging' : ''}`}
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
            >
              {displayUrl && (
                <img src={displayUrl} alt={`Gallery ${index + 1}`} className="gallery-thumbnail" />
              )}
              <button
                type="button"
                className="gallery-remove"
                onClick={() => handleRemove(index)}
                title="Remove image"
              >
                ✕
              </button>
              <div className="gallery-drag-handle" title="Drag to reorder">⋮⋮</div>
            </div>
          );
        })}

        {/* Add button */}
        {value.length < 10 && (
          <div className="gallery-add-button" onClick={handleAddClick}>
            <div className="add-icon">+</div>
            <p className="add-text">Add Image</p>
          </div>
        )}
      </div>

      {/* Gallery info */}
      <div className="gallery-info">
        <p className="gallery-count">
          {value.length} / 10 images
        </p>
        {value.length > 1 && (
          <p className="gallery-hint">💡 Drag images to reorder</p>
        )}
      </div>

      {/* Error Messages */}
      {validationError && (
        <div className="gallery-error-message">{validationError}</div>
      )}
      {error && !validationError && (
        <div className="gallery-error-message">{error}</div>
      )}
    </div>
  );
}

export default GalleryUpload;
