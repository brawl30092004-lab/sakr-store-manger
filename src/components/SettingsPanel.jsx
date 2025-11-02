import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import Settings from './Settings';
import './SettingsPanel.css';

/**
 * SettingsPanel - Slide-out panel for settings
 * Prevents disorientation by overlaying instead of replacing main view
 */
function SettingsPanel({ isOpen, onClose }) {
  const panelRef = useRef(null);
  const overlayRef = useRef(null);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when panel is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  // Handle click outside
  const handleOverlayClick = (e) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      ref={overlayRef}
      className="settings-panel-overlay"
      onClick={handleOverlayClick}
    >
      <div 
        ref={panelRef}
        className={`settings-panel ${isOpen ? 'settings-panel-open' : ''}`}
      >
        <div className="settings-panel-header">
          <h2>Settings</h2>
          <button 
            className="settings-panel-close"
            onClick={onClose}
            aria-label="Close settings"
          >
            <X size={20} />
          </button>
        </div>
        <div className="settings-panel-content">
          <Settings onBackToMain={onClose} isPanel={true} />
        </div>
      </div>
    </div>
  );
}

export default SettingsPanel;
