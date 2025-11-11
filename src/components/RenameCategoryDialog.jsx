import React, { useState, useEffect, useRef } from 'react';
import { X, Tag, AlertCircle } from 'lucide-react';
import { validateProductCategory } from '../services/productValidation';
import './RenameCategoryDialog.css';

/**
 * RenameCategoryDialog Component
 * Modal dialog for renaming a category for all products
 */
function RenameCategoryDialog({ isOpen, onClose, onConfirm, currentCategory, productCount }) {
  const [newCategoryName, setNewCategoryName] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const inputRef = useRef(null);

  // Reset and focus when dialog opens
  useEffect(() => {
    if (isOpen) {
      setNewCategoryName(currentCategory || '');
      setError('');
      setIsSubmitting(false);
      // Focus input after a brief delay to ensure modal is rendered
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.select();
        }
      }, 100);
    }
  }, [isOpen, currentCategory]);

  // Handle input change with validation
  const handleInputChange = (e) => {
    const value = e.target.value;
    setNewCategoryName(value);
    
    // Clear error when user starts typing
    if (error) {
      setError('');
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const trimmedName = newCategoryName.trim();
    
    // Validate the new category name
    const validation = validateProductCategory(trimmedName);
    if (!validation.valid) {
      setError(validation.error);
      return;
    }
    
    // Check if the name is the same as current
    if (trimmedName === currentCategory) {
      setError('New category name must be different from the current name');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await onConfirm(trimmedName);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to rename category');
      setIsSubmitting(false);
    }
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="rename-category-overlay" onClick={onClose}>
      <div 
        className="rename-category-dialog" 
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <div className="rename-category-header">
          <div className="rename-category-title">
            <Tag size={20} />
            <span>Rename Category</span>
          </div>
          <button 
            className="rename-category-close"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        <div className="rename-category-body">
          <div className="rename-category-info">
            <AlertCircle size={16} />
            <span>
              This will rename the category for <strong>{productCount}</strong> product{productCount !== 1 ? 's' : ''}
            </span>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="rename-category-field">
              <label htmlFor="new-category-name" className="rename-category-label">
                Current Category: <strong>{currentCategory}</strong>
              </label>
              <input
                ref={inputRef}
                id="new-category-name"
                type="text"
                className={`rename-category-input ${error ? 'input-error' : ''}`}
                placeholder="Enter new category name"
                value={newCategoryName}
                onChange={handleInputChange}
                disabled={isSubmitting}
                maxLength={50}
                required
              />
              {error && (
                <div className="rename-category-error">
                  <AlertCircle size={14} />
                  <span>{error}</span>
                </div>
              )}
              <div className="rename-category-hint">
                Category names must be 2-50 characters long
              </div>
            </div>

            <div className="rename-category-actions">
              <button
                type="button"
                className="rename-category-btn rename-category-btn-cancel"
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rename-category-btn rename-category-btn-confirm"
                disabled={isSubmitting || !newCategoryName.trim()}
              >
                {isSubmitting ? 'Renaming...' : 'Rename Category'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default RenameCategoryDialog;
