import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { getCategoriesFromProducts } from '../services/productValidation';
import './Sidebar.css';

function Sidebar({ selectedCategory, onCategorySelect, selectedFilter, onFilterSelect }) {
  const { items: products } = useSelector((state) => state.products);

  // Generate dynamic categories from products
  const dynamicCategories = useMemo(() => {
    const categoryNames = getCategoriesFromProducts(products);
    return categoryNames.map(categoryName => ({
      id: categoryName.toLowerCase().replace(/\s+/g, '-'),
      name: categoryName,
      icon: '📦',
      count: products.filter(p => p.category === categoryName).length
    }));
  }, [products]);

  // Add "All" category at the beginning
  const categories = useMemo(() => {
    return [
      { id: 'all', name: 'All', icon: '📦', count: products.length },
      ...dynamicCategories
    ];
  }, [dynamicCategories, products.length]);

  // Calculate filter counts
  const filters = useMemo(() => {
    const featuredCount = products.filter(p => p.isNew || p.tags?.includes('featured')).length;
    const discountsCount = products.filter(p => p.discount > 0).length;
    
    return [
      { id: 'featured', name: 'Featured', icon: '⭐', count: featuredCount },
      { id: 'discounts', name: 'Discounts', icon: '🎁', count: discountsCount },
    ];
  }, [products]);

  return (
    <div className="sidebar">
      <div className="sidebar-section">
        <h3 className="sidebar-title">PRODUCTS</h3>
        <div className="sidebar-divider"></div>
        <ul className="sidebar-list">
          {categories.map((category) => (
            <li 
              key={category.id} 
              className={`sidebar-item ${selectedCategory === category.id ? 'active' : ''}`}
              onClick={() => onCategorySelect(category.id)}
            >
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
            <li 
              key={filter.id} 
              className={`sidebar-item ${selectedFilter === filter.id ? 'active' : ''}`}
              onClick={() => onFilterSelect && onFilterSelect(filter.id)}
            >
              <span className="sidebar-icon">{filter.icon}</span>
              <span className="sidebar-label">{filter.name}</span>
              {filter.count !== undefined && (
                <span className="sidebar-count">({filter.count})</span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Sidebar;
