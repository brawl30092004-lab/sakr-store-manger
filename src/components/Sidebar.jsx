import React from 'react';
import './Sidebar.css';

function Sidebar() {
  const categories = [
    { id: 'all', name: 'All', icon: '📦', count: 23 },
    { id: 'apparel', name: 'Apparel', icon: '👕', count: 0 },
    { id: 'home', name: 'Home Goods', icon: '🏠', count: 0 },
    { id: 'accessories', name: 'Accessories', icon: '💼', count: 0 },
  ];

  const filters = [
    { id: 'featured', name: 'Featured', icon: '⭐' },
    { id: 'discounts', name: 'Discounts', icon: '🎁' },
  ];

  return (
    <div className="sidebar">
      <div className="sidebar-section">
        <h3 className="sidebar-title">PRODUCTS</h3>
        <div className="sidebar-divider"></div>
        <ul className="sidebar-list">
          {categories.map((category) => (
            <li key={category.id} className="sidebar-item">
              <span className="sidebar-icon">{category.icon}</span>
              <span className="sidebar-label">{category.name}</span>
              {category.count !== undefined && (
                <span className="sidebar-count">({category.count})</span>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div className="sidebar-section">
        <h3 className="sidebar-subtitle">Filters</h3>
        <ul className="sidebar-list">
          {filters.map((filter) => (
            <li key={filter.id} className="sidebar-item">
              <span className="sidebar-icon">{filter.icon}</span>
              <span className="sidebar-label">{filter.name}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="sidebar-section">
        <button className="new-product-btn">+ New Product</button>
      </div>
    </div>
  );
}

export default Sidebar;
