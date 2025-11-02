import React, { useEffect, useRef } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import './InlineConfirmation.css';

/**
 * InlineConfirmation Component
 * A non-blocking confirmation UI that appears inline instead of as a modal
 * Doesn't interrupt workflow - users can still interact with other parts of the UI
 * 
 * @param {Object} props
 * @param {string} props.message - The confirmation message to display
 * @param {Function} props.onConfirm - Callback when user confirms
 * @param {Function} props.onCancel - Callback when user cancels
 * @param {string} props.confirmText - Text for confirm button (default: "Confirm")
 * @param {string} props.cancelText - Text for cancel button (default: "Cancel")
 * @param {string} props.variant - Visual variant: 'danger', 'warning', 'info' (default: 'danger')
 * @param {boolean} props.autoFocus - Whether to auto-focus the cancel button (default: true)
 */
const InlineConfirmation = ({
  message,
  onConfirm,
  onCancel,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  autoFocus = true,
}) => {
  const cancelButtonRef = useRef(null);

  // Auto-focus cancel button for keyboard accessibility
  useEffect(() => {
    if (autoFocus && cancelButtonRef.current) {
      cancelButtonRef.current.focus();
    }
  }, [autoFocus]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onCancel]);

  return (
    <div className={`inline-confirmation inline-confirmation-${variant}`}>
      <div className="inline-confirmation-icon">
        <AlertTriangle size={18} />
      </div>
      
      <div className="inline-confirmation-content">
        <p className="inline-confirmation-message">{message}</p>
        
        <div className="inline-confirmation-actions">
          <button
            ref={cancelButtonRef}
            className="inline-btn inline-btn-cancel"
            onClick={onCancel}
            type="button"
          >
            {cancelText}
          </button>
          <button
            className={`inline-btn inline-btn-confirm inline-btn-confirm-${variant}`}
            onClick={onConfirm}
            type="button"
          >
            {confirmText}
          </button>
        </div>
      </div>

      <button
        className="inline-confirmation-close"
        onClick={onCancel}
        type="button"
        aria-label="Close"
      >
        <X size={16} />
      </button>
    </div>
  );
};

export default InlineConfirmation;
