import React, { useState, useMemo, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Search, Plus, Tag, Filter } from 'lucide-react';
import { addCoupon, updateCoupon, deleteCoupon, duplicateCoupon, toggleCouponStatus } from '../store/slices/couponsSlice';
import CouponCard from './CouponCard';
import CouponForm from './CouponForm';
import InlineConfirmation from './InlineConfirmation';
import { showSuccess, showError } from '../services/toastService';
import { showUndoNotification } from '../services/undoService';
import './CouponGrid.css';

/**
 * CouponGrid Component
 * Main view for displaying and managing coupons
 */
const CouponGrid = React.forwardRef((props, ref) => {
  const dispatch = useDispatch();
  const { items: coupons, loading, error } = useSelector((state) => state.coupons);
  const products = useSelector((state) => state.products.items);
  
  const [searchText, setSearchText] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'enabled', 'disabled'
  const [typeFilter, setTypeFilter] = useState('all'); // 'all', 'percentage', 'fixed'

  // Calculate filter counts
  const filterCounts = useMemo(() => {
    const enabled = coupons.filter(c => c.enabled).length;
    const disabled = coupons.filter(c => !c.enabled).length;
    const percentage = coupons.filter(c => c.type === 'percentage').length;
    const fixed = coupons.filter(c => c.type === 'fixed').length;
    
    return { enabled, disabled, percentage, fixed };
  }, [coupons]);

  // Filter coupons based on search and filters
  const filteredCoupons = useMemo(() => {
    let result = [...coupons];

    // Status filter
    if (statusFilter === 'enabled') {
      result = result.filter(c => c.enabled);
    } else if (statusFilter === 'disabled') {
      result = result.filter(c => !c.enabled);
    }

    // Type filter
    if (typeFilter === 'percentage') {
      result = result.filter(c => c.type === 'percentage');
    } else if (typeFilter === 'fixed') {
      result = result.filter(c => c.type === 'fixed');
    }

    // Search filter
    if (searchText.trim()) {
      const searchLower = searchText.toLowerCase();
      result = result.filter(c =>
        c.code.toLowerCase().includes(searchLower) ||
        c.category.toLowerCase().includes(searchLower) ||
        (c.description && c.description.toLowerCase().includes(searchLower))
      );
    }

    return result;
  }, [coupons, statusFilter, typeFilter, searchText]);

  // Handle new coupon
  const handleNewCoupon = useCallback(() => {
    setEditingCoupon(null);
    setIsFormOpen(true);
  }, []);

  // Expose methods to parent via ref
  React.useImperativeHandle(ref, () => ({
    handleNewCoupon
  }));

  // Handle edit coupon
  const handleEditCoupon = useCallback((coupon) => {
    setEditingCoupon(coupon);
    setIsFormOpen(true);
  }, []);

  // Handle close form
  const handleCloseForm = useCallback(() => {
    setIsFormOpen(false);
    setEditingCoupon(null);
  }, []);

  // Handle save coupon
  const handleSaveCoupon = useCallback(async (couponData) => {
    try {
      if (editingCoupon) {
        // Update existing coupon
        await dispatch(updateCoupon({
          id: editingCoupon.id,
          updates: couponData
        })).unwrap();
        showSuccess(`Coupon "${couponData.code}" updated successfully`);
      } else {
        // Add new coupon
        await dispatch(addCoupon(couponData)).unwrap();
        showSuccess(`Coupon "${couponData.code}" added successfully`);
      }
    } catch (error) {
      showError(error.message || 'Failed to save coupon');
      throw error;
    }
  }, [editingCoupon, dispatch]);

  // Handle delete click
  const handleDeleteClick = useCallback((id) => {
    setDeleteConfirmId(id);
  }, []);

  // Handle delete confirm
  const handleDeleteConfirm = useCallback(async () => {
    if (deleteConfirmId) {
      const couponToDelete = coupons.find(c => c.id === deleteConfirmId);
      
      try {
        await dispatch(deleteCoupon(deleteConfirmId)).unwrap();
        
        // Show undo notification
        showUndoNotification(
          {
            type: 'DELETE_COUPON',
            description: `Deleted coupon "${couponToDelete.code}"`,
            data: couponToDelete,
          },
          async () => {
            // Undo function - restore the coupon
            await dispatch(addCoupon(couponToDelete)).unwrap();
            showSuccess('Coupon restored');
          }
        );
      } catch (error) {
        showError(error.message || 'Failed to delete coupon');
      } finally {
        setDeleteConfirmId(null);
      }
    }
  }, [deleteConfirmId, coupons, dispatch]);

  // Handle delete cancel
  const handleDeleteCancel = useCallback(() => {
    setDeleteConfirmId(null);
  }, []);

  // Handle duplicate coupon
  const handleDuplicateCoupon = useCallback(async (id) => {
    try {
      await dispatch(duplicateCoupon(id)).unwrap();
      showSuccess('Coupon duplicated successfully');
    } catch (error) {
      showError(error.message || 'Failed to duplicate coupon');
    }
  }, [dispatch]);

  // Handle toggle status
  const handleToggleStatus = useCallback(async (id) => {
    try {
      const coupon = coupons.find(c => c.id === id);
      await dispatch(toggleCouponStatus(id)).unwrap();
      const newStatus = !coupon.enabled;
      showSuccess(`Coupon "${coupon.code}" ${newStatus ? 'enabled' : 'disabled'}`);
    } catch (error) {
      showError(error.message || 'Failed to toggle coupon status');
    }
  }, [dispatch, coupons]);

  if (loading && coupons.length === 0) {
    return (
      <div className="coupon-grid">
        <div className="loading-message">
          <Tag className="loading-icon" size={24} />
          <span>Loading coupons...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="coupon-grid">
        <div className="error-message">
          <span>{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="coupon-grid">
      {/* Toolbar */}
      <div className="coupon-toolbar">
        {/* Filters */}
        <div className="filter-chips">
          {/* Status Filters */}
          <button
            className={`filter-chip ${statusFilter === 'all' ? 'active' : ''}`}
            onClick={() => setStatusFilter('all')}
          >
            <Tag size={16} />
            <span className="filter-chip-label">All</span>
            <span className="filter-chip-count">{coupons.length}</span>
          </button>
          <button
            className={`filter-chip ${statusFilter === 'enabled' ? 'active' : ''}`}
            onClick={() => setStatusFilter('enabled')}
          >
            <span className="filter-chip-label">Enabled</span>
            <span className="filter-chip-count">{filterCounts.enabled}</span>
          </button>
          <button
            className={`filter-chip ${statusFilter === 'disabled' ? 'active' : ''}`}
            onClick={() => setStatusFilter('disabled')}
          >
            <span className="filter-chip-label">Disabled</span>
            <span className="filter-chip-count">{filterCounts.disabled}</span>
          </button>
          
          {/* Type Filters */}
          <div className="filter-divider"></div>
          <button
            className={`filter-chip ${typeFilter === 'percentage' ? 'active' : ''}`}
            onClick={() => setTypeFilter(typeFilter === 'percentage' ? 'all' : 'percentage')}
          >
            <span className="filter-chip-label">% Discount</span>
            <span className="filter-chip-count">{filterCounts.percentage}</span>
          </button>
          <button
            className={`filter-chip ${typeFilter === 'fixed' ? 'active' : ''}`}
            onClick={() => setTypeFilter(typeFilter === 'fixed' ? 'all' : 'fixed')}
          >
            <span className="filter-chip-label">Fixed Amount</span>
            <span className="filter-chip-count">{filterCounts.fixed}</span>
          </button>
        </div>

        {/* Search */}
        <div className="toolbar-search">
          <Search className="toolbar-search-icon" size={18} />
          <input
            type="text"
            placeholder="Search coupons..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="toolbar-search-input"
          />
        </div>
      </div>

      {/* Coupon List */}
      {filteredCoupons.length === 0 ? (
        <div className="no-coupons">
          <Tag size={48} />
          <h3>No coupons found</h3>
          <p>
            {searchText || statusFilter !== 'all' || typeFilter !== 'all'
              ? 'Try adjusting your filters or search'
              : 'Get started by creating your first coupon'}
          </p>
          {!searchText && statusFilter === 'all' && typeFilter === 'all' && (
            <button className="btn-new-coupon" onClick={handleNewCoupon}>
              <Plus size={20} />
              Add First Coupon
            </button>
          )}
        </div>
      ) : (
        <div className="coupon-list">
          {filteredCoupons.map((coupon) => (
            <div key={coupon.id}>
              {deleteConfirmId === coupon.id ? (
                <InlineConfirmation
                  message={`Delete coupon "${coupon.code}"?`}
                  onConfirm={handleDeleteConfirm}
                  onCancel={handleDeleteCancel}
                />
              ) : (
                <CouponCard
                  coupon={coupon}
                  onEdit={handleEditCoupon}
                  onDelete={handleDeleteClick}
                  onDuplicate={handleDuplicateCoupon}
                  onToggleStatus={handleToggleStatus}
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Coupon Form Modal */}
      {isFormOpen && (
        <CouponForm
          coupon={editingCoupon}
          onClose={handleCloseForm}
          onSave={handleSaveCoupon}
        />
      )}
    </div>
  );
});

CouponGrid.displayName = 'CouponGrid';

export default CouponGrid;
