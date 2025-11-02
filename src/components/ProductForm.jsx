import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle, useMemo, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useSelector } from 'react-redux';
import { X } from 'lucide-react';
import { productSchema } from '../services/productSchema';
import { processProductImage } from '../services/imageService';
import { showSuccess, showError, showWarning, showInfo, ToastMessages } from '../services/toastService';
import { startAutoSave, stopAutoSave, loadDraft, clearDraft, formatDraftTimestamp } from '../services/autoSaveService';
import { useImagePath } from '../hooks/useImagePath';
import ImageUpload from './ImageUpload';
import GalleryUpload from './GalleryUpload';
import './ProductForm.css';
import './ProductFormModern.css';

/**
 * PreviewImage Component
 * Handles rendering of preview images with proper path resolution
 */
const PreviewImage = ({ image, alt, className }) => {
  const resolvedPath = useImagePath(image instanceof File ? null : image);
  
  const imageSrc = useMemo(() => {
    if (!image) return null;
    
    // If it's a File object (newly uploaded), create object URL
    if (image instanceof File) {
      return URL.createObjectURL(image);
    }
    
    // If it's a string path and we have resolved it
    if (typeof image === 'string' && resolvedPath) {
      return resolvedPath;
    }
    
    // Fallback to the original value
    return image;
  }, [image, resolvedPath]);
  
  if (!imageSrc) return null;
  
  return <img src={imageSrc} alt={alt} className={className} />;
};

/**
 * ProductForm Component
 * Add/Edit Product form with validation using react-hook-form and Yup
 */
const ProductForm = forwardRef(({ product, onClose, onSave }, ref) => {
  const projectPath = useSelector((state) => state.settings.projectPath);
  const products = useSelector((state) => state.products.items);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [showDraftPrompt, setShowDraftPrompt] = useState(false);
  const [draftData, setDraftData] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [autoSaveStatus, setAutoSaveStatus] = useState('idle'); // idle, saving, saved
  const [showPreview, setShowPreview] = useState(false);
  
  const autoSaveTimerRef = useRef(null);
  const productIdRef = useRef(product?.id || 'new');
  const previousDiscountRef = useRef(product?.discount || false);
  
  // Discount mode state: 'percentage' or 'fixed'
  const [discountMode, setDiscountMode] = useState('percentage');
  const [discountPercentage, setDiscountPercentage] = useState(0);
  
  const steps = [
    { id: 1, name: 'Basic Info', icon: 'info' },
    { id: 2, name: 'Pricing & Stock', icon: 'dollar' },
    { id: 3, name: 'Images', icon: 'image' },
    { id: 4, name: 'Options', icon: 'flag' }
  ];

  // Store temporary primary image upload (not in form data)
  const [pendingImages, setPendingImages] = useState({
    primary: null // Will store File object for primary image
  });
  
  // Store last crop parameters to apply to gallery images
  const [lastCrop, setLastCrop] = useState(null);

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
    mode: 'onBlur', // Changed from 'onChange' to reduce re-renders - validate on blur instead
    defaultValues: product || {
      id: 0,
      name: '',
      price: 0.00,
      description: '',
      category: '',
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
  const currentPrice = watch('price');
  const currentDiscountedPrice = watch('discountedPrice');

  // Calculate discounted price when percentage changes
  useEffect(() => {
    if (isDiscountActive && discountMode === 'percentage' && currentPrice > 0 && discountPercentage > 0) {
      const calculatedPrice = currentPrice - (currentPrice * discountPercentage / 100);
      setValue('discountedPrice', parseFloat(calculatedPrice.toFixed(2)), { shouldValidate: true });
    }
  }, [discountPercentage, currentPrice, isDiscountActive, discountMode, setValue]);

  // Calculate percentage when discounted price changes (for fixed mode)
  useEffect(() => {
    if (isDiscountActive && discountMode === 'fixed' && currentPrice > 0 && currentDiscountedPrice > 0 && currentDiscountedPrice < currentPrice) {
      const calculatedPercentage = ((currentPrice - currentDiscountedPrice) / currentPrice) * 100;
      setDiscountPercentage(parseFloat(calculatedPercentage.toFixed(2)));
    }
  }, [currentDiscountedPrice, currentPrice, isDiscountActive, discountMode]);

  // When discount is toggled from true to false, set discountedPrice to match regular price
  useEffect(() => {
    const wasDiscountActive = previousDiscountRef.current;
    
    // Only auto-set when discount is TOGGLED OFF (was true, now false)
    if (wasDiscountActive && !isDiscountActive && currentPrice) {
      setValue('discountedPrice', currentPrice, { shouldValidate: false });
      setDiscountPercentage(0);
    }
    
    // Update the ref for next comparison
    previousDiscountRef.current = isDiscountActive;
  }, [isDiscountActive, currentPrice, setValue]);

  // Extract unique categories from existing products - MEMOIZED
  const existingCategories = useMemo(() => {
    if (!products || products.length === 0) {
      return []; // No suggestions if no products exist
    }
    
    const categorySet = new Set(products.map(p => p.category).filter(Boolean));
    
    return Array.from(categorySet).sort();
  }, [products]); // Only recompute when products array changes

  // Check for draft on mount
  useEffect(() => {
    const draft = loadDraft(productIdRef.current);
    if (draft) {
      setDraftData(draft);
      setShowDraftPrompt(true);
    }
  }, []);

  // Start auto-save with debouncing
  useEffect(() => {
    if (!showDraftPrompt) {
      // Debounce auto-save to 3 seconds to reduce frequent saves
      autoSaveTimerRef.current = startAutoSave(productIdRef.current, () => {
        setAutoSaveStatus('saving');
        const formData = getValues();
        setTimeout(() => setAutoSaveStatus('saved'), 500);
        setTimeout(() => setAutoSaveStatus('idle'), 2000);
        return formData;
      }, 3000); // Added 3 second debounce

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

  // Handle primary image upload (store File object temporarily) - MEMOIZED
  const handlePrimaryImageChange = useCallback((fileOrPath) => {
    if (fileOrPath instanceof File) {
      // New file upload - store for processing on save AND update form value for validation
      setPendingImages(prev => ({ ...prev, primary: fileOrPath }));
      setValue('images.primary', fileOrPath, { shouldValidate: true });
    } else {
      // Existing path or dataURL - update form value directly
      setValue('images.primary', fileOrPath, { shouldValidate: true });
    }
  }, [setValue]);

  // Handle gallery image uploads (keep mixed array of paths and Files) - MEMOIZED
  const handleGalleryImagesChange = useCallback((filesOrPaths) => {
    // Keep the complete array (both File objects and paths) in the form
    // We'll separate them during save processing
    setValue('images.gallery', filesOrPaths, { shouldValidate: true });
  }, [setValue]);
  
  // Handle crop completion from primary image - MEMOIZED
  const handlePrimaryCrop = useCallback((cropData) => {
    setLastCrop(cropData);
  }, []);

  // Process images and save product - MEMOIZED
  const processImagesAndSave = useCallback(async (formData) => {
    setIsSaving(true);
    setSaveError(null);

    try {
      // Deep clone to avoid mutating Redux state (which is frozen/read-only)
      const productData = JSON.parse(JSON.stringify(formData));
      const hasPendingPrimaryImage = pendingImages.primary instanceof File;
      const galleryFiles = (formData.images.gallery || []).filter(item => item instanceof File);
      const hasNewImages = hasPendingPrimaryImage || galleryFiles.length > 0;

      // If this is a new product (id === 0) and has new images, we need a two-step save
      if (formData.id === 0 && hasNewImages) {
        // Step 1: Save product with placeholder images to get an ID
        const tempProductData = {
          ...productData,
          images: {
            primary: 'placeholder-will-be-replaced',
            gallery: []
          }
        };
        
        // Save and get the returned products array
        const savedProducts = await onSave(tempProductData);
        
        // Find the newly created product to get its ID
        const newProduct = savedProducts[savedProducts.length - 1];
        const newProductId = newProduct.id;
        
        // Step 2: Process images with the new product ID
        if (hasPendingPrimaryImage) {
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
  }, [pendingImages, projectPath, onSave]);

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
    <div className="product-form-overlay" onClick={onClose}>
      <div className="product-form-container modern-layout" onClick={(e) => e.stopPropagation()}>
        {/* LEFT PANEL - Form Content */}
        <div className="form-panel">
          <div className="product-form-header">
            <div className="header-left">
              <h2>{product?.id ? 'Edit Product' : 'Add New Product'}</h2>
              {autoSaveStatus !== 'idle' && (
                <div className={`auto-save-indicator ${autoSaveStatus}`}>
                  {autoSaveStatus === 'saving' && (
                    <>
                      <div className="saving-spinner"></div>
                      <span>Saving...</span>
                    </>
                  )}
                  {autoSaveStatus === 'saved' && (
                    <>
                      <svg viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                      </svg>
                      <span>Saved</span>
                    </>
                  )}
                </div>
              )}
            </div>
            <button 
              type="button" 
              className="btn-close" 
              onClick={onClose}
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>

        {/* Draft Notification Banner (non-blocking) */}
        {showDraftPrompt && draftData && (
          <div className="draft-notification-banner">
            <div className="draft-notification-content">
              <svg viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
              </svg>
              <div className="draft-notification-text">
                <strong>Draft found</strong>
                <span>Auto-saved {formatDraftTimestamp(draftData.timestamp)}</span>
              </div>
            </div>
            <div className="draft-notification-actions">
              <button
                type="button"
                className="btn btn-sm btn-secondary"
                onClick={handleDiscardDraft}
              >
                Discard
              </button>
              <button
                type="button"
                className="btn btn-sm btn-primary"
                onClick={handleRestoreDraft}
              >
                Restore
              </button>
            </div>
          </div>
        )}

        {/* Step Progress Indicator */}
        <div className="form-steps">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`step ${currentStep === step.id ? 'active' : ''} ${currentStep > step.id ? 'completed' : ''}`}
              onClick={() => setCurrentStep(step.id)}
            >
              <div className="step-indicator">
                {currentStep > step.id ? (
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                ) : (
                  <span>{step.id}</span>
                )}
              </div>
              <span className="step-label">{step.name}</span>
              {index < steps.length - 1 && <div className="step-connector"></div>}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="product-form-wrapper">
          <div className="product-form">
          {/* Step 1: Basic Information Section */}
          {currentStep === 1 && (
          <section className="form-section step-basic-info">
            <div className="step-header">
              <div className="step-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                </svg>
              </div>
              <div className="step-title-group">
                <h3 className="step-title">Basic Information</h3>
                <p className="step-description">Let's start with the essentials of your product</p>
              </div>
            </div>
            
            <div className="modern-form-layout">
              {/* Product Name */}
              <div className="form-field form-field-full">
                <label htmlFor="name" className="modern-label">
                  <span className="label-text">Product Name</span>
                  <span className="label-required">Required</span>
                </label>
                <div className="input-wrapper">
                  <input
                    id="name"
                    type="text"
                    className={`modern-input ${errors.name ? 'input-error' : ''}`}
                    placeholder="e.g., Premium Cotton T-Shirt"
                    {...register('name')}
                  />
                  {errors.name && (
                    <div className="field-error">
                      <svg viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                      </svg>
                      <span>{errors.name.message}</span>
                    </div>
                  )}
                </div>
                <p className="field-hint">A clear, descriptive name helps customers find your product</p>
              </div>

              {/* Category */}
              <div className="form-field">
                <label htmlFor="category" className="modern-label">
                  <span className="label-text">Category</span>
                  <span className="label-required">Required</span>
                </label>
                <div className="input-wrapper">
                  <input
                    id="category"
                    type="text"
                    list="category-suggestions"
                    className={`modern-input ${errors.category ? 'input-error' : ''}`}
                    placeholder="Select or type category"
                    {...register('category')}
                  />
                  <datalist id="category-suggestions">
                    {existingCategories.map((cat) => (
                      <option key={cat} value={cat} />
                    ))}
                  </datalist>
                  {errors.category && (
                    <div className="field-error">
                      <svg viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                      </svg>
                      <span>{errors.category.message}</span>
                    </div>
                  )}
                </div>
                <p className="field-hint">
                  {existingCategories.length > 0 
                    ? 'Choose existing or create new' 
                    : 'This will be your first category'}
                </p>
              </div>

              {/* Description */}
              <div className="form-field form-field-full">
                <label htmlFor="description" className="modern-label">
                  <span className="label-text">Description</span>
                  <span className="label-required">Required</span>
                </label>
                <div className="input-wrapper">
                  <textarea
                    id="description"
                    className={`modern-input modern-textarea ${errors.description ? 'input-error' : ''}`}
                    placeholder="Describe your product features, materials, and benefits..."
                    rows="5"
                    {...register('description')}
                  />
                  {errors.description && (
                    <div className="field-error">
                      <svg viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                      </svg>
                      <span>{errors.description.message}</span>
                    </div>
                  )}
                </div>
                <p className="field-hint">Include key features and what makes this product special</p>
              </div>
            </div>
          </section>
          )}

          {/* Step 2: Pricing & Stock Section */}
          {currentStep === 2 && (
          <section className="form-section step-pricing">
            <div className="step-header">
              <div className="step-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="1" x2="12" y2="23"/>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
              </div>
              <div className="step-title-group">
                <h3 className="step-title">Pricing & Inventory</h3>
                <p className="step-description">Set your pricing strategy and stock levels</p>
              </div>
            </div>
            
            <div className="modern-form-layout">
              {/* Regular Price */}
              <div className="form-field">
                <label htmlFor="price" className="modern-label">
                  <span className="label-text">Regular Price</span>
                  <span className="label-required">Required</span>
                </label>
                <div className="input-wrapper input-with-prefix">
                  <span className="input-prefix">EGP</span>
                  <input
                    id="price"
                    type="number"
                    step="0.01"
                    min="0.01"
                    className={`modern-input ${errors.price ? 'input-error' : ''}`}
                    placeholder="0.00"
                    {...register('price', { valueAsNumber: true })}
                  />
                  {errors.price && (
                    <div className="field-error">
                      <svg viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                      </svg>
                      <span>{errors.price.message}</span>
                    </div>
                  )}
                </div>
                <p className="field-hint">Base price before any discounts</p>
              </div>

              {/* Stock Level */}
              <div className="form-field">
                <label htmlFor="stock" className="modern-label">
                  <span className="label-text">Stock Quantity</span>
                  <span className="label-required">Required</span>
                </label>
                <div className="input-wrapper input-with-suffix">
                  <input
                    id="stock"
                    type="number"
                    step="1"
                    min="0"
                    max="9999"
                    className={`modern-input ${errors.stock ? 'input-error' : ''}`}
                    placeholder="0"
                    {...register('stock', { valueAsNumber: true })}
                  />
                  <span className="input-suffix">units</span>
                  {errors.stock && (
                    <div className="field-error">
                      <svg viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                      </svg>
                      <span>{errors.stock.message}</span>
                    </div>
                  )}
                </div>
                <p className="field-hint">Current available inventory</p>
              </div>

              {/* Discount Toggle */}
              <div className="form-field form-field-full discount-toggle-section">
                <div className="toggle-card">
                  <div className="toggle-content">
                    <div className="toggle-icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="9" cy="21" r="1"/>
                        <circle cx="20" cy="21" r="1"/>
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                        <path d="M12 2L9 8l6 0-3-6z"/>
                      </svg>
                    </div>
                    <div className="toggle-info">
                      <label htmlFor="discount" className="toggle-label">Enable Discount</label>
                      <p className="toggle-description">Offer a special sale price for this product</p>
                    </div>
                  </div>
                  <label className="modern-toggle">
                    <input
                      id="discount"
                      type="checkbox"
                      {...register('discount')}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                </div>
              </div>

              {/* Discount Mode Toggle - Visible when discount is active */}
              {isDiscountActive && (
                <div className="form-field form-field-full form-field-animated">
                  <div className="discount-mode-selector">
                    <label className="modern-label">
                      <span className="label-text">Discount Type</span>
                    </label>
                    <div className="mode-buttons">
                      <button
                        type="button"
                        className={`mode-button ${discountMode === 'percentage' ? 'active' : ''}`}
                        onClick={() => setDiscountMode('percentage')}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10"/>
                          <line x1="15" y1="9" x2="9" y2="15"/>
                          <circle cx="9" cy="9" r="1.5" fill="currentColor"/>
                          <circle cx="15" cy="15" r="1.5" fill="currentColor"/>
                        </svg>
                        <span>Percentage</span>
                      </button>
                      <button
                        type="button"
                        className={`mode-button ${discountMode === 'fixed' ? 'active' : ''}`}
                        onClick={() => setDiscountMode('fixed')}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="12" y1="1" x2="12" y2="23"/>
                          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                        </svg>
                        <span>Fixed Price</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Percentage Input - Visible in percentage mode */}
              {isDiscountActive && discountMode === 'percentage' && (
                <div className="form-field form-field-animated">
                  <label htmlFor="discountPercentage" className="modern-label">
                    <span className="label-text">Discount Percentage</span>
                    <span className="label-required">Required</span>
                  </label>
                  <div className="input-wrapper input-with-suffix">
                    <input
                      id="discountPercentage"
                      type="number"
                      step="0.01"
                      min="0.01"
                      max="99.99"
                      className="modern-input"
                      placeholder="0.00"
                      value={discountPercentage || ''}
                      onChange={(e) => setDiscountPercentage(parseFloat(e.target.value) || 0)}
                    />
                    <span className="input-suffix">%</span>
                  </div>
                  <p className="field-hint">
                    {watch('price') && discountPercentage > 0
                      ? `Sale price will be EGP ${(watch('price') - (watch('price') * discountPercentage / 100)).toFixed(2)}`
                      : 'Enter percentage off (e.g., 20 for 20% off)'}
                  </p>
                </div>
              )}

              {/* Discounted Price - Visible in fixed mode or as read-only in percentage mode */}
              {isDiscountActive && discountMode === 'fixed' && (
                <div className="form-field form-field-animated">
                  <label htmlFor="discountedPrice" className="modern-label">
                    <span className="label-text">Sale Price</span>
                    <span className="label-required">Required</span>
                  </label>
                  <div className="input-wrapper input-with-prefix">
                    <span className="input-prefix">EGP</span>
                    <input
                      id="discountedPrice"
                      type="number"
                      step="0.01"
                      min="0.01"
                      className={`modern-input ${errors.discountedPrice ? 'input-error' : ''}`}
                      placeholder="0.00"
                      {...register('discountedPrice', { valueAsNumber: true })}
                    />
                    {errors.discountedPrice && (
                      <div className="field-error">
                        <svg viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                        </svg>
                        <span>{errors.discountedPrice.message}</span>
                      </div>
                    )}
                  </div>
                  <p className="field-hint">
                    {watch('price') && watch('discountedPrice') && watch('price') > watch('discountedPrice')
                      ? `Save ${discountPercentage.toFixed(2)}% off regular price`
                      : 'Must be less than regular price'}
                  </p>
                </div>
              )}

              {/* Calculated Sale Price Display - Visible in percentage mode */}
              {isDiscountActive && discountMode === 'percentage' && discountPercentage > 0 && (
                <div className="form-field form-field-animated">
                  <label className="modern-label">
                    <span className="label-text">Calculated Sale Price</span>
                    <span className="label-badge">Auto-calculated</span>
                  </label>
                  <div className="calculated-price-display">
                    <div className="price-breakdown">
                      <div className="price-item">
                        <span className="price-label">Original:</span>
                        <span className="price-value original">EGP {watch('price')?.toFixed(2) || '0.00'}</span>
                      </div>
                      <div className="price-divider">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="9 18 15 12 9 6"/>
                        </svg>
                      </div>
                      <div className="price-item">
                        <span className="price-label">Sale Price:</span>
                        <span className="price-value discounted">EGP {watch('discountedPrice')?.toFixed(2) || '0.00'}</span>
                      </div>
                    </div>
                  </div>
                  <p className="field-hint success-hint">
                    <svg viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                    </svg>
                    Customers save EGP {((watch('price') || 0) - (watch('discountedPrice') || 0)).toFixed(2)}
                  </p>
                </div>
              )}
            </div>
          </section>
          )}

          {/* Step 3: Images Section */}
          {currentStep === 3 && (
          <section className="form-section step-images">
            <div className="step-header">
              <div className="step-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
              </div>
              <div className="step-title-group">
                <h3 className="step-title">Product Images</h3>
                <p className="step-description">Upload stunning photos to showcase your product</p>
              </div>
            </div>
            
            <div className="modern-form-layout images-layout">
              {/* Primary Image */}
              <div className="image-upload-section">
                <div className="section-label">
                  <span className="label-text">Primary Image</span>
                  <span className="label-badge">Main photo</span>
                </div>
                <Controller
                  name="images.primary"
                  control={control}
                  render={({ field }) => (
                    <ImageUpload
                      value={field.value}
                      onChange={handlePrimaryImageChange}
                      onCrop={handlePrimaryCrop}
                      error={errors.images?.primary?.message}
                    />
                  )}
                />
                <div className="image-upload-tips">
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                  </svg>
                  <span>This image will be the main photo customers see first</span>
                </div>
              </div>

              {/* Gallery Images */}
              <div className="image-upload-section">
                <div className="section-label">
                  <span className="label-text">Gallery Images</span>
                  <span className="label-badge optional">Optional</span>
                </div>
                <Controller
                  name="images.gallery"
                  control={control}
                  render={({ field }) => (
                    <GalleryUpload
                      value={field.value || []}
                      onChange={handleGalleryImagesChange}
                      lastCrop={lastCrop}
                      error={errors.images?.gallery?.message}
                    />
                  )}
                />
                <div className="image-upload-tips">
                  <svg viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                  </svg>
                  <span>Add multiple angles and details • Drag to reorder • Max 10 images</span>
                </div>
              </div>
            </div>
          </section>
          )}

          {/* Step 4: Product Flags Section */}
          {currentStep === 4 && (
          <section className="form-section step-options">
            <div className="step-header">
              <div className="step-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
                  <line x1="4" y1="22" x2="4" y2="15"/>
                </svg>
              </div>
              <div className="step-title-group">
                <h3 className="step-title">Product Options</h3>
                <p className="step-description">Highlight special features and availability</p>
              </div>
            </div>
            
            <div className="modern-form-layout options-layout">
              {/* Mark as New */}
              <div className="option-card">
                <div className="option-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 6v6l4 2"/>
                  </svg>
                </div>
                <div className="option-content">
                  <label htmlFor="isNew" className="option-label">New Arrival</label>
                  <p className="option-description">Display a "NEW" badge on this product</p>
                </div>
                <label className="modern-toggle">
                  <input
                    id="isNew"
                    type="checkbox"
                    {...register('isNew')}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>

              <div className="options-info-box">
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                </svg>
                <div>
                  <p className="info-box-title">About Product Badges</p>
                  <p className="info-box-text">Badges like "NEW" help draw customer attention to special products. They appear as visual labels on your product cards.</p>
                </div>
              </div>
            </div>
          </section>
          )}
          </div>

          {/* Step Navigation Buttons */}
          <div className="step-navigation">
            {currentStep > 1 && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setCurrentStep(currentStep - 1)}
              >
                ← Previous
              </button>
            )}
            <div className="step-info">
              Step {currentStep} of {steps.length}
            </div>
            {currentStep < steps.length ? (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setCurrentStep(currentStep + 1)}
              >
                Next →
              </button>
            ) : (
              <div></div>
            )}
          </div>

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

        {/* RIGHT PANEL - Live Preview (Always Visible) */}
        <div className="preview-panel">
          <div className="preview-header">
            <h3>Live Preview</h3>
            <span className="preview-badge">Updates in real-time</span>
          </div>
          
          <div className="preview-content">
            <div className="product-preview-card">
              <div className="preview-image-wrapper">
                {watch('images.primary') ? (
                  <PreviewImage 
                    image={watch('images.primary')}
                    alt={watch('name') || 'Product preview'} 
                    className="preview-image"
                  />
                ) : (
                  <div className="preview-image-placeholder">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                      <circle cx="8.5" cy="8.5" r="1.5"/>
                      <polyline points="21 15 16 10 5 21"/>
                    </svg>
                    <span>No image uploaded</span>
                  </div>
                )}
                {watch('isNew') && (
                  <div className="preview-badge-new">NEW</div>
                )}
                {watch('discount') && (
                  <div className="preview-badge-sale">SALE</div>
                )}
              </div>

              <div className="preview-body">
                <div className="preview-category-tag">
                  {watch('category') || 'Uncategorized'}
                </div>
                <h4 className="preview-title">
                  {watch('name') || 'Product Name'}
                </h4>
                <p className="preview-description">
                  {watch('description') || 'Product description will appear here...'}
                </p>
                
                <div className="preview-divider"></div>
                
                <div className="preview-pricing-section">
                  {watch('discount') ? (
                    <div className="preview-pricing-discount">
                      <span className="preview-price-current">
                        EGP {watch('discountedPrice')?.toFixed(2) || '0.00'}
                      </span>
                      <span className="preview-price-original">
                        EGP {watch('price')?.toFixed(2) || '0.00'}
                      </span>
                      <span className="preview-discount-percent">
                        {watch('price') && watch('discountedPrice') 
                          ? `-${Math.round((1 - watch('discountedPrice') / watch('price')) * 100)}%`
                          : ''}
                      </span>
                    </div>
                  ) : (
                    <span className="preview-price-single">
                      EGP {watch('price')?.toFixed(2) || '0.00'}
                    </span>
                  )}
                </div>

                <div className="preview-stock-section">
                  <div className={`preview-stock-indicator ${watch('stock') > 0 ? 'in-stock' : 'out-of-stock'}`}>
                    <div className="stock-dot"></div>
                    <span>
                      {watch('stock') > 0 
                        ? `${watch('stock')} in stock` 
                        : 'Out of stock'
                      }
                    </span>
                  </div>
                </div>

                {watch('images.gallery')?.length > 0 && (
                  <div className="preview-gallery-indicator">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="2"/>
                      <circle cx="8.5" cy="8.5" r="1.5"/>
                      <polyline points="21 15 16 10 5 21"/>
                    </svg>
                    <span>{watch('images.gallery').length} gallery image{watch('images.gallery').length > 1 ? 's' : ''}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="preview-tips">
              <div className="preview-tip">
                <svg viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
                </svg>
                <span>This is how your product will appear in the store</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

ProductForm.displayName = 'ProductForm';

export default ProductForm;
