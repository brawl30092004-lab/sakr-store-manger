import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { productSchema } from '../services/productSchema';
import './ProductForm.css';

/**
 * ProductForm Component
 * Add/Edit Product form with validation using react-hook-form and Yup
 */
function ProductForm({ product, onClose, onSave }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    control
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

  // Handle form submission
  const onSubmit = (data) => {
    onSave(data);
  };

  // Handle Save & Close
  const handleSaveAndClose = handleSubmit((data) => {
    onSave(data);
    onClose();
  });

  return (
    <div className="product-form-overlay">
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
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={!isValid}
            >
              Save
            </button>
            <button
              type="button"
              className="btn btn-success"
              onClick={handleSaveAndClose}
              disabled={!isValid}
            >
              Save & Close
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProductForm;
