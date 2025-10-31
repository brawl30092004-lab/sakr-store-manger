import React from 'react';
import ImageCropModal from './ImageCropModal';

/**
 * GalleryImageCropModal
 * Wrapper for cropping a single gallery image
 */
const GalleryImageCropModal = ({ isOpen, imageUrl, imageName, onCropComplete, onCancel }) => {
  return (
    <ImageCropModal
      isOpen={isOpen}
      imageUrl={imageUrl}
      imageName={imageName}
      onCropComplete={onCropComplete}
      onCancel={onCancel}
    />
  );
};

export default GalleryImageCropModal;
