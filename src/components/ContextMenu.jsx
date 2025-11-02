import React, { useEffect, useRef, useState } from 'react';
import { Edit, Copy, Trash2, Star, Tag, Package } from 'lucide-react';
import './ContextMenu.css';

/**
 * ContextMenu - Right-click menu for product cards
 * Provides quick access to product actions
 */
function ContextMenu({ 
  x, 
  y, 
  onClose, 
  onEdit, 
  onDuplicate, 
  onDelete,
  onToggleNew,
  productName,
  isNew = false
}) {
  const menuRef = useRef(null);
  const [position, setPosition] = useState({ x, y });

  useEffect(() => {
    // Adjust position if menu would go off screen
    if (menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let adjustedX = x;
      let adjustedY = y;

      if (x + rect.width > viewportWidth) {
        adjustedX = viewportWidth - rect.width - 10;
      }

      if (y + rect.height > viewportHeight) {
        adjustedY = viewportHeight - rect.height - 10;
      }

      setPosition({ x: adjustedX, y: adjustedY });
    }
  }, [x, y]);

  useEffect(() => {
    const handleClick = () => onClose();
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('click', handleClick);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const handleAction = (action) => {
    action();
    onClose();
  };

  return (
    <div
      ref={menuRef}
      className="context-menu"
      style={{ left: `${position.x}px`, top: `${position.y}px` }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="context-menu-header">
        <Package size={14} />
        <span className="context-menu-title">{productName}</span>
      </div>
      
      <div className="context-menu-divider"></div>
      
      <button
        className="context-menu-item"
        onClick={() => handleAction(onEdit)}
      >
        <Edit size={16} />
        <span>Edit Product</span>
        <kbd className="context-menu-kbd">Enter</kbd>
      </button>

      <button
        className="context-menu-item"
        onClick={() => handleAction(onDuplicate)}
      >
        <Copy size={16} />
        <span>Duplicate</span>
        <kbd className="context-menu-kbd">Ctrl+D</kbd>
      </button>

      <button
        className="context-menu-item"
        onClick={() => handleAction(onToggleNew)}
      >
        <Star size={16} />
        <span>{isNew ? 'Remove "New" Badge' : 'Mark as New'}</span>
      </button>

      <div className="context-menu-divider"></div>

      <button
        className="context-menu-item context-menu-item-danger"
        onClick={() => handleAction(onDelete)}
      >
        <Trash2 size={16} />
        <span>Delete</span>
        <kbd className="context-menu-kbd">Del</kbd>
      </button>
    </div>
  );
}

export default ContextMenu;
