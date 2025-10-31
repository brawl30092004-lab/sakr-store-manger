import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { validateUploadedImage, fileToDataURL, validateGalleryCount } from '../services/imageService';
import { showSuccess, showError } from '../services/toastService';
import GalleryImageCropModal from './GalleryImageCropModal';
import { useClickAway } from 'react-use';
import './GalleryUpload.css';

/**
 * GalleryUpload Component
 * Manages multiple gallery images with drag-to-reorder, add, remove, and crop functionality
 * @param {Object} props
 * @param {Array} props.value - Array of images (File objects or paths)
 * @param {Function} props.onChange - Callback when images change
 * @param {Object} props.error - Validation error
 * @param {Object} props.lastCrop - Last crop parameters from primary image {croppedAreaPixels, rotation}
 */
const GalleryUpload = React.memo(function GalleryUpload({ value = [], onChange, error, lastCrop = null }) {
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

  // Get display URL for an item (either File object or string path) - MEMOIZED
  const getDisplayUrl = useCallback((item, index) => {
    if (typeof item === 'string') {
      if (item.startsWith('data:') || item.startsWith('local-image://') || item.startsWith('file://')) {
        return item; // Data URL or already resolved path
      }
      return resolvedPaths[index] || item; // Use resolved path or fallback to original
    } else if (item instanceof File) {
      return imagePreviews[index] || ''; // Preview from File object
    }
    return '';
  }, [imagePreviews, resolvedPaths]);

  // Handle file selection - MEMOIZED
  const handleFilesSelect = useCallback(async (files) => {
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
  }, [value, onChange]);

  // Handle file input change - MEMOIZED
  const handleInputChange = useCallback((e) => {
    const files = Array.from(e.target.files);
    handleFilesSelect(files);
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [handleFilesSelect]);

  // Handle add button click - MEMOIZED
  const handleAddClick = useCallback(() => {
    // Check if we can add more
    const countValidation = validateGalleryCount(value.length, 1);
    if (!countValidation.valid) {
      setValidationError(countValidation.error);
      return;
    }
    
    fileInputRef.current?.click();
  }, [value.length]);

  // Handle remove image - MEMOIZED
  const handleRemove = useCallback((index) => {
    const updatedGallery = value.filter((_, i) => i !== index);
    onChange(updatedGallery);
    setValidationError(null);
  }, [value, onChange]);

  // Drag and drop for reordering - MEMOIZED
  const handleDragStart = useCallback((e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragOver = useCallback((e, index) => {
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
  }, [draggedIndex, value, onChange]);

  const handleDragEnd = useCallback(() => {
    setDraggedIndex(null);
  }, []);

  // Gallery image crop modal state
  const [cropModalIndex, setCropModalIndex] = useState(null);
  const [cropModalUrl, setCropModalUrl] = useState('');
  const [cropModalName, setCropModalName] = useState('');

  // Context menu state
  const [contextMenu, setContextMenu] = useState({ visible: false, x: 0, y: 0, index: null });
  const contextMenuRef = useRef(null);
  useClickAway(contextMenuRef, () => setContextMenu({ ...contextMenu, visible: false }));

  // Open crop modal for a gallery image
  const openCropModal = useCallback((index) => {
    const item = value[index];
    const displayUrl = getDisplayUrl(item, index);
    setCropModalIndex(index);
    setCropModalUrl(displayUrl);
    setCropModalName(item instanceof File ? item.name : `gallery-${index + 1}.jpg`);
    setContextMenu({ ...contextMenu, visible: false });
  }, [value, getDisplayUrl, contextMenu]);

  // Handle right-click on gallery image
  const handleGalleryContextMenu = useCallback((e, index) => {
    e.preventDefault();
    setContextMenu({ visible: true, x: e.clientX, y: e.clientY, index });
  }, []);

  // Handle crop complete for gallery image
  const handleGalleryCropComplete = useCallback(async (croppedAreaPixels, rotation) => {
    try {
      const item = value[cropModalIndex];
      const displayUrl = getDisplayUrl(item, cropModalIndex);
      if (!displayUrl) {
        showError('Unable to load image for cropping.');
        setCropModalIndex(null);
        return;
      }
      // Dynamically import getCroppedImg to avoid circular dependency
      const { getCroppedImg } = await import('./ImageCropModal');
      const croppedFile = await getCroppedImg(
        displayUrl,
        croppedAreaPixels,
        item instanceof File ? item.name : `gallery-${cropModalIndex + 1}.jpg`,
        rotation || 0
      );
      const updatedGallery = [...value];
      updatedGallery[cropModalIndex] = croppedFile;
      onChange(updatedGallery);
      // Update preview
      const dataURL = await fileToDataURL(croppedFile);
      setImagePreviews(prev => ({ ...prev, [cropModalIndex]: dataURL }));
      showSuccess(`Image ${cropModalIndex + 1} cropped successfully!`);
    } catch (error) {
      console.error('Crop error:', error);
      showError('Failed to crop image. Please try again.');
    }
    setCropModalIndex(null);
  }, [value, cropModalIndex, getDisplayUrl, onChange]);

  // Handle crop modal cancel
  const handleCropModalCancel = useCallback(() => {
    setCropModalIndex(null);
  }, []);

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
              onContextMenu={(e) => handleGalleryContextMenu(e, index)}
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

        {/* Add button - always visible */}
        <div className="gallery-add-button" onClick={handleAddClick}>
          <div className="add-icon">+</div>
          <p className="add-text">Add Image</p>
        </div>
      </div>

      {/* Gallery info */}
      <div className="gallery-info">
        <p className="gallery-count">
          {value.length} {value.length === 1 ? 'image' : 'images'}
        </p>
        {value.length > 1 && (
          <p className="gallery-hint">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7 16V4M7 4L3 8M7 4l4 4M17 8v12M17 20l4-4M17 20l-4-4"/>
            </svg>
            Drag images to reorder
          </p>
        )}
      </div>

      {/* Error Messages */}
      {validationError && (
        <div className="gallery-error-message">{validationError}</div>
      )}
      {error && !validationError && (
        <div className="gallery-error-message">{error}</div>
      )}
      {/* Context menu for gallery image */}
      {contextMenu.visible && (
        <div
          ref={contextMenuRef}
          className="gallery-context-menu"
          style={{ position: 'fixed', top: contextMenu.y, left: contextMenu.x, zIndex: 10000 }}
        >
          <button
            className="gallery-context-menu-item"
            onClick={() => openCropModal(contextMenu.index)}
          >
            Crop
          </button>
        </div>
      )}
      {/* Gallery image crop modal */}
      <GalleryImageCropModal
        isOpen={cropModalIndex !== null}
        imageUrl={cropModalUrl}
        imageName={cropModalName}
        onCropComplete={handleGalleryCropComplete}
        onCancel={handleCropModalCancel}
      />
    </div>
  );
});

export default GalleryUpload;
