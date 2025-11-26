import React from 'react';
import { Edit, Trash2, Copy, Tag, Percent, DollarSign } from 'lucide-react';
import './CouponCard.css';

/**
 * CouponCard Component
 * Displays a single coupon with actions (edit, delete, duplicate, toggle status)
 */
const CouponCard = ({ coupon, onEdit, onDelete, onDuplicate, onToggleStatus }) => {
  const handleToggleStatus = (e) => {
    e.stopPropagation();
    e.preventDefault();
    onToggleStatus(coupon.id);
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    onEdit(coupon);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(coupon.id);
  };

  const handleDuplicate = (e) => {
    e.stopPropagation();
    onDuplicate(coupon.id);
  };

  // Format discount display
  const getDiscountDisplay = () => {
    if (coupon.type === 'percentage') {
      return `${coupon.amount}% off`;
    } else {
      return `${coupon.amount} EGP off`;
    }
  };

  // Debug: Log enabled state
  console.log(`CouponCard ${coupon.code}: enabled=${coupon.enabled}, type=${typeof coupon.enabled}, String=${String(coupon.enabled)}`);

  return (
    <div className={`coupon-card ${!coupon.enabled ? 'disabled' : ''}`}>
      {/* Status Indicator */}
      <div className="coupon-status-indicator">
        <div className={`status-dot ${coupon.enabled ? 'active' : 'inactive'}`}></div>
      </div>

      {/* Header: Code and Toggle */}
      <div className="coupon-header">
        <div className="coupon-code-wrapper">
          <Tag className="coupon-icon" size={18} />
          <h3 className="coupon-code">{coupon.code}</h3>
        </div>
        <div className="coupon-toggle" onClick={handleToggleStatus}>
          <span className="toggle-slider" data-checked={String(coupon.enabled)}></span>
        </div>
      </div>

      {/* Discount Info */}
      <div className="coupon-discount">
        <div className="discount-icon-wrapper">
          {coupon.type === 'percentage' ? (
            <Percent className="discount-icon" size={20} />
          ) : (
            <DollarSign className="discount-icon" size={20} />
          )}
        </div>
        <span className="discount-amount">{getDiscountDisplay()}</span>
      </div>

      {/* Details */}
      <div className="coupon-details">
        <div className="detail-item">
          <span className="detail-label">Min Spend:</span>
          <span className="detail-value">{coupon.minSpend > 0 ? `${coupon.minSpend} EGP` : 'None'}</span>
        </div>
        <div className="detail-item">
          <span className="detail-label">Category:</span>
          <span className="detail-value">{coupon.category}</span>
        </div>
      </div>

      {/* Description */}
      {coupon.description && (
        <div className="coupon-description">
          <p>{coupon.description}</p>
        </div>
      )}

      {/* Actions */}
      <div className="coupon-actions">
        <button
          className="coupon-action-btn edit"
          onClick={handleEdit}
          title="Edit Coupon"
        >
          <Edit size={16} />
          <span>Edit</span>
        </button>
        <button
          className="coupon-action-btn duplicate"
          onClick={handleDuplicate}
          title="Duplicate Coupon"
        >
          <Copy size={16} />
          <span>Duplicate</span>
        </button>
        <button
          className="coupon-action-btn delete"
          onClick={handleDelete}
          title="Delete Coupon"
        >
          <Trash2 size={16} />
          <span>Delete</span>
        </button>
      </div>
    </div>
  );
};

export default CouponCard;
