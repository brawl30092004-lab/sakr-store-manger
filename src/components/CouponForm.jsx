import React, { useState, useEffect, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useSelector } from 'react-redux';
import { X, Tag, Percent, DollarSign, ShoppingCart, List, FileText, ToggleLeft, Sparkles } from 'lucide-react';
import { couponSchema } from '../schemas/couponSchema';
import { getCategoriesFromProducts } from '../services/productValidation';
import { showError } from '../services/toastService';
import './CouponForm.css';

/**
 * CouponForm Component
 * Add/Edit coupon form with validation
 */
const CouponForm = ({ coupon, onClose, onSave }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  
  const products = useSelector((state) => state.products.items);
  const coupons = useSelector((state) => state.coupons.items);

  // Get available categories from products
  const availableCategories = useMemo(() => {
    const productCategories = getCategoriesFromProducts(products);
    return ['All', ...productCategories];
  }, [products]);

  // Form setup with react-hook-form and Yup validation
  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    control,
    setValue,
    reset
  } = useForm({
    resolver: yupResolver(couponSchema),
    mode: 'onBlur',
    defaultValues: coupon || {
      id: 0,
      code: '',
      type: 'percentage',
      amount: 10,
      minSpend: 0,
      category: 'All',
      description: '',
      enabled: true
    }
  });

  const watchType = watch('type');
  const watchAmount = watch('amount');
  const watchCode = watch('code');
  const watchMinSpend = watch('minSpend');
  const watchCategory = watch('category');

  // Generate auto description based on coupon properties
  const generateDescription = () => {
    const type = watchType || 'percentage';
    const amount = watchAmount || 0;
    const minSpend = watchMinSpend || 0;
    const category = watchCategory || 'All';
    
    let description = '';
    
    // Base discount text
    if (type === 'percentage') {
      description = `Get ${amount}% off`;
    } else {
      description = `Save ${amount} EGP`;
    }
    
    // Add category info
    if (category && category !== 'All') {
      description += ` on ${category} products`;
    } else {
      description += ' on your order';
    }
    
    // Add minimum spend requirement
    if (minSpend > 0) {
      description += ` when you spend ${minSpend} EGP or more`;
    }
    
    description += '!';
    
    setValue('description', description);
  };

  // Format coupon code to uppercase
  useEffect(() => {
    if (watchCode) {
      const formatted = watchCode.toUpperCase().replace(/[^A-Z0-9]/g, '');
      if (formatted !== watchCode) {
        setValue('code', formatted);
      }
    }
  }, [watchCode, setValue]);

  // Adjust amount when type changes
  useEffect(() => {
    const currentAmount = watchAmount || 0;
    if (watchType === 'percentage' && currentAmount > 100) {
      setValue('amount', 100);
    } else if (watchType === 'fixed' && currentAmount > 10000) {
      setValue('amount', 10000);
    }
  }, [watchType, watchAmount, setValue]);

  const onSubmit = async (data) => {
    setIsSaving(true);
    setSaveError(null);

    try {
      // Check for duplicate codes (excluding current coupon if editing)
      const currentCouponId = coupon?.id ? Number(coupon.id) : null;
      const duplicateCode = coupons.find(c => 
        c.code.toUpperCase() === data.code.toUpperCase() && 
        Number(c.id) !== currentCouponId
      );

      if (duplicateCode) {
        showError('Coupon code already exists');
        setSaveError('Coupon code already exists');
        setIsSaving(false);
        return;
      }

      // Save coupon
      await onSave(data);
      onClose();
    } catch (error) {
      console.error('Error saving coupon:', error);
      setSaveError(error.message || 'Failed to save coupon');
      showError(error.message || 'Failed to save coupon');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if (!isSaving) {
      onClose();
    }
  };

  return (
    <div className="coupon-form-overlay" onClick={handleClose}>
      <div className="coupon-form-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="coupon-form-header">
          <div className="form-header-content">
            <Tag className="form-header-icon" size={24} />
            <h2>{coupon ? 'Edit Coupon' : 'Add New Coupon'}</h2>
          </div>
          <button className="close-btn" onClick={handleClose} disabled={isSaving}>
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="coupon-form">
          <div className="form-content">
            
            {/* Code */}
            <div className="form-group">
              <label htmlFor="code">
                <Tag size={16} />
                Coupon Code *
              </label>
              <input
                id="code"
                type="text"
                placeholder="e.g., WELCOME10, SUMMER25"
                maxLength={20}
                {...register('code')}
                className={errors.code ? 'error' : ''}
              />
              {errors.code && <span className="error-message">{errors.code.message}</span>}
              <span className="field-hint">4-20 characters, uppercase letters and numbers only</span>
            </div>

            {/* Type and Amount Row */}
            <div className="form-row">
              {/* Type */}
              <div className="form-group">
                <label htmlFor="type">
                  {watchType === 'percentage' ? <Percent size={16} /> : <DollarSign size={16} />}
                  Discount Type *
                </label>
                <select
                  id="type"
                  {...register('type')}
                  className={errors.type ? 'error' : ''}
                >
                  <option value="percentage">Percentage (%)</option>
                  <option value="fixed">Fixed Amount (EGP)</option>
                </select>
                {errors.type && <span className="error-message">{errors.type.message}</span>}
              </div>

              {/* Amount */}
              <div className="form-group">
                <label htmlFor="amount">
                  {watchType === 'percentage' ? <Percent size={16} /> : <DollarSign size={16} />}
                  Amount *
                </label>
                <div className="input-with-unit">
                  <input
                    id="amount"
                    type="number"
                    step={watchType === 'percentage' ? '1' : '0.01'}
                    min="0"
                    max={watchType === 'percentage' ? '100' : '10000'}
                    placeholder={watchType === 'percentage' ? '10' : '50.00'}
                    {...register('amount')}
                    className={errors.amount ? 'error' : ''}
                  />
                  <span className="input-unit">{watchType === 'percentage' ? '%' : 'EGP'}</span>
                </div>
                {errors.amount && <span className="error-message">{errors.amount.message}</span>}
              </div>
            </div>

            {/* Min Spend and Category Row */}
            <div className="form-row">
              {/* Min Spend */}
              <div className="form-group">
                <label htmlFor="minSpend">
                  <ShoppingCart size={16} />
                  Minimum Spend
                </label>
                <div className="input-with-unit">
                  <input
                    id="minSpend"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    {...register('minSpend')}
                    className={errors.minSpend ? 'error' : ''}
                  />
                  <span className="input-unit">EGP</span>
                </div>
                {errors.minSpend && <span className="error-message">{errors.minSpend.message}</span>}
                <span className="field-hint">Minimum cart value required (0 = no minimum)</span>
              </div>

              {/* Category */}
              <div className="form-group">
                <label htmlFor="category">
                  <List size={16} />
                  Category *
                </label>
                <select
                  id="category"
                  {...register('category')}
                  className={errors.category ? 'error' : ''}
                >
                  {availableCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                {errors.category && <span className="error-message">{errors.category.message}</span>}
                <span className="field-hint">Applies to all products or specific category</span>
              </div>
            </div>

            {/* Description */}
            <div className="form-group">
              <div className="label-with-action">
                <label htmlFor="description">
                  <FileText size={16} />
                  Description
                </label>
                <button
                  type="button"
                  className="auto-generate-btn"
                  onClick={generateDescription}
                  title="Auto-generate description based on coupon properties"
                >
                  <Sparkles size={14} />
                  <span>Auto Generate</span>
                </button>
              </div>
              <textarea
                id="description"
                rows={3}
                maxLength={200}
                placeholder="e.g., 10% off orders over 500 EGP"
                {...register('description')}
                className={errors.description ? 'error' : ''}
              />
              {errors.description && <span className="error-message">{errors.description.message}</span>}
              <span className="field-hint">Optional description (max 200 characters)</span>
            </div>

            {/* Enabled Toggle */}
            <div className="form-group">
              <label className="toggle-label">
                <ToggleLeft size={16} />
                <span>Enable Coupon</span>
              </label>
              <Controller
                name="enabled"
                control={control}
                render={({ field }) => (
                  <label className="form-toggle">
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                    />
                    <span className="toggle-label-text">
                      {field.value ? 'Enabled' : 'Disabled'}
                    </span>
                    <span className="toggle-slider"></span>
                  </label>
                )}
              />
              <span className="field-hint">Disabled coupons cannot be used by customers</span>
            </div>

          </div>

          {/* Error Display */}
          {saveError && (
            <div className="form-error-banner">
              <span>{saveError}</span>
            </div>
          )}

          {/* Actions */}
          <div className="form-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={handleClose}
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={isSaving || !isValid}
            >
              {isSaving ? 'Saving...' : coupon ? 'Update Coupon' : 'Add Coupon'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CouponForm;
