import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useSelector } from 'react-redux';
import { productSchema } from '../services/productSchema';
import { processProductImage } from '../services/imageService';
import { showSuccess, showError, showWarning, showInfo, ToastMessages } from '../services/toastService';
import { startAutoSave, stopAutoSave, loadDraft, clearDraft, formatDraftTimestamp } from '../services/autoSaveService';
import ImageUpload from './ImageUpload';
import GalleryUpload from './GalleryUpload';
import './ProductForm.css';

/**
 * ProductForm Component
 * Add/Edit Product form with validation using react-hook-form and Yup
 */
const ProductForm = forwardRef(({ product, onClose, onSave }, ref) => {
  const projectPath = useSelector((state) => state.settings.projectPath);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [showDraftPrompt, setShowDraftPrompt] = useState(false);
  const [draftData, setDraftData] = useState(null);
  
  const autoSaveTimerRef = useRef(null);
  const productIdRef = useRef(product?.id || 'new');

  // Store temporary primary image upload (not in form data)
  const [pendingImages, setPendingImages] = useState({
    primary: null // Will store File object for primary image
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    control,
    setValue,
    getValues,
    reset
  } = useForm({
    resolver: yupResolver(productSchema),
    mode: 'onChange', // Validate on change for real-time feedback
    defaultValues: product || {
      id: 0,
      name: '',
      price: 0.00,
      description: '',
      category: 'Apparel',
      discount: false,
      discountedPrice: 0.00,
      stock: 0,
      isNew: true,
      images: {
        primary: '',
        gallery: []
      }
    }
  });

  // Watch the discount field to conditionally show discountedPrice
  const isDiscountActive = watch('discount');

  // Check for draft on mount
  useEffect(() => {
    const draft = loadDraft(productIdRef.current);
    if (draft) {
      setDraftData(draft);
      setShowDraftPrompt(true);
    }
  }, []);

  // Start auto-save
  useEffect(() => {
    if (!showDraftPrompt) {
      autoSaveTimerRef.current = startAutoSave(productIdRef.current, () => {
        const formData = getValues();
        return formData;
      });

      return () => {
        if (autoSaveTimerRef.current) {
          stopAutoSave(autoSaveTimerRef.current);
        }
      };
    }
  }, [showDraftPrompt, getValues]);

  // Handle draft restoration
  const handleRestoreDraft = () => {
    if (draftData?.data) {
      reset(draftData.data);
      showInfo('Draft restored successfully');
    }
    setShowDraftPrompt(false);
  };

  const handleDiscardDraft = () => {
    clearDraft(productIdRef.current);
    setShowDraftPrompt(false);
    showInfo('Draft discarded');
  };

  // Handle primary image upload (store File object temporarily)
  const handlePrimaryImageChange = (fileOrPath) => {
    if (fileOrPath instanceof File) {
      // New file upload - store for processing on save
      setPendingImages(prev => ({ ...prev, primary: fileOrPath }));
    } else {
      // Existing path or dataURL - update form value directly
      setValue('images.primary', fileOrPath, { shouldValidate: true });
    }
  };

  // Handle gallery image uploads (keep mixed array of paths and Files)
  const handleGalleryImagesChange = (filesOrPaths) => {
    console.log('Gallery changed, new value:', filesOrPaths);
    console.log('Files in gallery:', filesOrPaths.filter(item => item instanceof File).length);
    console.log('Paths in gallery:', filesOrPaths.filter(item => typeof item === 'string').length);
    
    // Keep the complete array (both File objects and paths) in the form
    // We'll separate them during save processing
    setValue('images.gallery', filesOrPaths, { shouldValidate: true });
  };

  // Process images and save product
  const processImagesAndSave = async (formData) => {
    setIsSaving(true);
    setSaveError(null);

    try {
      const productData = { ...formData };
      const hasPendingPrimaryImage = pendingImages.primary instanceof File;
      const galleryFiles = (productData.images.gallery || []).filter(item => item instanceof File);
      const hasNewImages = hasPendingPrimaryImage || galleryFiles.length > 0;

      // If this is a new product (id === 0) and has new images, we need a two-step save
      if (formData.id === 0 && hasNewImages) {
        console.log('New product with images - saving in two steps');
        
        // Step 1: Save product without images to get an ID
        const tempProductData = {
          ...productData,
          images: {
            primary: '',
            gallery: []
          }
        };
        
        // Save and get the returned products array
        const savedProducts = await onSave(tempProductData);
        
        // Find the newly created product to get its ID
        const newProduct = savedProducts[savedProducts.length - 1];
        const newProductId = newProduct.id;
        console.log('Product saved with ID:', newProductId);
        
        // Step 2: Process images with the new product ID
        if (hasPendingPrimaryImage) {
          console.log('Processing primary image with ID:', newProductId);
          const primaryPath = await processProductImage(
            pendingImages.primary,
            projectPath,
            newProductId,
            'primary',
            null
          );
          productData.images.primary = primaryPath;
          productData.image = primaryPath;
        }

        if (galleryFiles.length > 0) {
          console.log('Processing gallery images with ID:', newProductId);
          const existingPaths = (productData.images.gallery || []).filter(item => typeof item === 'string');
          const startIndex = existingPaths.length;
          
          const newGalleryPaths = await Promise.all(
            galleryFiles.map((file, index) =>
              processProductImage(
                file,
                projectPath,
                newProductId,
                'gallery',
                startIndex + index
              )
            )
          );
          
          productData.images.gallery = [...existingPaths, ...newGalleryPaths];
        }

        // Step 3: Update the product with image paths
        productData.id = newProductId;
        await onSave(productData);
      } else {
        // Existing product or no new images - process normally
        
        // Process primary image if there's a new upload
        if (hasPendingPrimaryImage) {
          console.log('Processing primary image...');
          const primaryPath = await processProductImage(
            pendingImages.primary,
            projectPath,
            formData.id,
            'primary',
            null
          );
          productData.images.primary = primaryPath;
          productData.image = primaryPath; // Also set legacy image field
        }

        // Process gallery images if there are any
        if (galleryFiles.length > 0) {
          console.log('Processing gallery images...');
          const existingPaths = (productData.images.gallery || []).filter(item => typeof item === 'string');
          const startIndex = existingPaths.length;
          
          const newGalleryPaths = await Promise.all(
            galleryFiles.map((file, index) =>
              processProductImage(
                file,
                projectPath,
                formData.id,
                'gallery',
                startIndex + index
              )
            )
          );
          
          productData.images.gallery = [...existingPaths, ...newGalleryPaths];
        } else {
          // No new files, just keep existing paths
          const existingPaths = (productData.images.gallery || []).filter(item => typeof item === 'string');
          productData.images.gallery = existingPaths;
        }

        // Save the product with processed image paths
        await onSave(productData);
      }

      // Clear pending images and draft
      setPendingImages({ primary: null });
      clearDraft(productIdRef.current);
      
      // Show success message
      showSuccess(ToastMessages.PRODUCT_SAVED);
    } catch (error) {
      console.error('Error processing images or saving product:', error);
      const errorMessage = error.message || 'Failed to save product. Please try again.';
      setSaveError(errorMessage);
      showError(error);
    } finally {
      setIsSaving(false);
    }
  };

  // Handle form submission
  const onSubmit = async (data) => {
    await processImagesAndSave(data);
  };

  // Handle Save & Close
  const handleSaveAndClose = handleSubmit(async (data) => {
    await processImagesAndSave(data);
    if (!saveError) {
      onClose();
    }
  });

  // Expose methods to parent via ref
  useImperativeHandle(ref, () => ({
    handleSave: () => {
      handleSubmit(onSubmit)();
    },
    handleEnter: () => {
      if (isValid) {
        handleSubmit(onSubmit)();
      }
    }
  }));

  return (
    <div className="product-form-overlay">
      {/* Draft Restoration Prompt */}
      {showDraftPrompt && draftData && (
        <div className="draft-prompt-overlay">
          <div className="draft-prompt-modal">
            <h3>Unsaved Draft Found</h3>
            <p>We found an unsaved draft from {formatDraftTimestamp(draftData.timestamp)}.</p>
            <p>Would you like to restore it?</p>
            <div className="draft-prompt-actions">
              <button 
                type="button"
                className="btn btn-secondary"
                onClick={handleDiscardDraft}
              >
                Discard
              </button>
              <button 
                type="button"
                className="btn btn-primary"
                onClick={handleRestoreDraft}
              >
                Restore Draft
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="product-form-container">
        <div className="product-form-header">
          <h2>{product?.id ? 'Edit Product' : 'Add New Product'}</h2>
          <button 
            type="button" 
            className="btn-close" 
            onClick={onClose}
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="product-form">
          {/* Basic Information Section */}
          <section className="form-section">
            <h3 className="section-title">Basic Information</h3>
            
            {/* Product Name */}
            <div className="form-group">
              <label htmlFor="name" className="form-label">
                Product Name <span className="required">*</span>
              </label>
              <input
                id="name"
                type="text"
                className={`form-input ${errors.name ? 'input-error' : ''}`}
                placeholder="Enter product name (min 3 characters)"
                {...register('name')}
              />
              {errors.name && (
                <span className="error-message">{errors.name.message}</span>
              )}
            </div>

            {/* Category */}
            <div className="form-group">
              <label htmlFor="category" className="form-label">
                Category <span className="required">*</span>
              </label>
              <select
                id="category"
                className={`form-input form-select ${errors.category ? 'input-error' : ''}`}
                {...register('category')}
              >
                <option value="Apparel">Apparel</option>
                <option value="Electronics">Electronics</option>
                <option value="Home & Garden">Home & Garden</option>
                <option value="Sports">Sports</option>
                <option value="Books">Books</option>
                <option value="Toys">Toys</option>
                <option value="Other">Other</option>
              </select>
              {errors.category && (
                <span className="error-message">{errors.category.message}</span>
              )}
            </div>

            {/* Description */}
            <div className="form-group">
              <label htmlFor="description" className="form-label">
                Description <span className="required">*</span>
              </label>
              <textarea
                id="description"
                className={`form-input form-textarea ${errors.description ? 'input-error' : ''}`}
                placeholder="Enter product description (min 10 characters)"
                rows="4"
                {...register('description')}
              />
              {errors.description && (
                <span className="error-message">{errors.description.message}</span>
              )}
            </div>
          </section>

          {/* Pricing & Stock Section */}
          <section className="form-section">
            <h3 className="section-title">Pricing & Stock</h3>
            
            {/* Regular Price */}
            <div className="form-group">
              <label htmlFor="price" className="form-label">
                Regular Price (EGP) <span className="required">*</span>
              </label>
              <input
                id="price"
                type="number"
                step="0.01"
                min="0.01"
                className={`form-input ${errors.price ? 'input-error' : ''}`}
                placeholder="0.00"
                {...register('price', { valueAsNumber: true })}
              />
              {errors.price && (
                <span className="error-message">{errors.price.message}</span>
              )}
            </div>

            {/* Stock Level */}
            <div className="form-group">
              <label htmlFor="stock" className="form-label">
                Stock Level <span className="required">*</span>
              </label>
              <input
                id="stock"
                type="number"
                step="1"
                min="0"
                max="9999"
                className={`form-input ${errors.stock ? 'input-error' : ''}`}
                placeholder="0"
                {...register('stock', { valueAsNumber: true })}
              />
              {errors.stock && (
                <span className="error-message">{errors.stock.message}</span>
              )}
            </div>

            {/* Discount Toggle */}
            <div className="form-group form-group-checkbox">
              <label className="form-checkbox-label">
                <input
                  type="checkbox"
                  className="form-checkbox"
                  {...register('discount')}
                />
                <span className="checkbox-text">Product is on discount</span>
              </label>
            </div>

            {/* Discounted Price - Conditionally Visible */}
            {isDiscountActive && (
              <div className="form-group form-group-animated">
                <label htmlFor="discountedPrice" className="form-label">
                  Discounted Price (EGP) <span className="required">*</span>
                </label>
                <input
                  id="discountedPrice"
                  type="number"
                  step="0.01"
                  min="0.01"
                  className={`form-input ${errors.discountedPrice ? 'input-error' : ''}`}
                  placeholder="0.00"
                  {...register('discountedPrice', { valueAsNumber: true })}
                />
                {errors.discountedPrice && (
                  <span className="error-message">{errors.discountedPrice.message}</span>
                )}
              </div>
            )}
          </section>

          {/* Images Section */}
          <section className="form-section">
            <h3 className="section-title">Images</h3>
            
            {/* Primary Image */}
            <div className="form-group">
              <label className="form-label">
                Primary Image
              </label>
              <Controller
                name="images.primary"
                control={control}
                render={({ field }) => (
                  <ImageUpload
                    value={field.value}
                    onChange={handlePrimaryImageChange}
                    error={errors.images?.primary?.message}
                  />
                )}
              />
            </div>

            {/* Gallery Images */}
            <div className="form-group">
              <label className="form-label">
                Gallery Images
                <span className="form-label-hint"> (Optional, up to 10)</span>
              </label>
              <Controller
                name="images.gallery"
                control={control}
                render={({ field }) => (
                  <GalleryUpload
                    value={field.value || []}
                    onChange={handleGalleryImagesChange}
                    error={errors.images?.gallery?.message}
                  />
                )}
              />
            </div>
          </section>

          {/* Product Flags Section */}
          <section className="form-section">
            <h3 className="section-title">Product Flags</h3>
            
            {/* Mark as New */}
            <div className="form-group form-group-checkbox">
              <label className="form-checkbox-label">
                <input
                  type="checkbox"
                  className="form-checkbox"
                  {...register('isNew')}
                />
                <span className="checkbox-text">Mark as New</span>
              </label>
            </div>
          </section>

          {/* Action Buttons */}
          <div className="form-actions">
            {saveError && (
              <div className="error-message" style={{ marginBottom: '10px', textAlign: 'center' }}>
                {saveError}
              </div>
            )}
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!isValid || isSaving}
            >
              {isSaving ? 'Processing...' : 'Save'}
            </button>
            <button
              type="button"
              className="btn btn-success"
              onClick={handleSaveAndClose}
              disabled={!isValid || isSaving}
            >
              {isSaving ? 'Processing...' : 'Save & Close'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
});

ProductForm.displayName = 'ProductForm';

export default ProductForm;
