import React from 'react';
import { ChevronRight } from 'lucide-react';
import './Breadcrumbs.css';

/**
 * Breadcrumbs - Navigation indicator showing current location
 * Helps users understand where they are in the app hierarchy
 */
function Breadcrumbs({ path = [] }) {
  if (!path || path.length === 0) {
    return null;
  }

  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      <ol className="breadcrumb-list">
        {path.map((item, index) => (
          <li key={index} className="breadcrumb-item">
            {index > 0 && (
              <ChevronRight size={14} className="breadcrumb-separator" />
            )}
            {item.onClick ? (
              <button
                className="breadcrumb-link"
                onClick={item.onClick}
                type="button"
              >
                {item.icon && <span className="breadcrumb-icon">{item.icon}</span>}
                {item.label}
              </button>
            ) : (
              <span className="breadcrumb-current">
                {item.icon && <span className="breadcrumb-icon">{item.icon}</span>}
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export default Breadcrumbs;
