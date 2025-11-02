import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Package } from 'lucide-react';
import { getCategoriesFromProducts } from '../services/productValidation';
import './Sidebar.css';

function Sidebar({ selectedCategory, onCategorySelect }) {
  const { items: products } = useSelector((state) => state.products);

  // Generate dynamic categories from products
  const dynamicCategories = useMemo(() => {
    const categoryNames = getCategoriesFromProducts(products);
    return categoryNames.map(categoryName => ({
      id: categoryName.toLowerCase().replace(/\s+/g, '-'),
      name: categoryName,
      icon: Package,
      count: products.filter(p => p.category === categoryName).length
    }));
  }, [products]);

  // Add "All" category at the beginning
  const categories = useMemo(() => {
    return [
      { id: 'all', name: 'All', icon: Package, count: products.length },
      ...dynamicCategories
    ];
  }, [dynamicCategories, products.length]);

  return (
    <div className="sidebar">
      <div className="sidebar-section">
        <h3 className="sidebar-title">CATEGORIES</h3>
        <div className="sidebar-divider"></div>
        <ul className="sidebar-list">
          {categories.map((category) => (
            <li 
              key={category.id} 
              className={`sidebar-item ${selectedCategory === category.id ? 'active' : ''}`}
              onClick={() => onCategorySelect(category.id)}
            >
              <span className="sidebar-icon"><category.icon size={18} /></span>
              <span className="sidebar-label">{category.name}</span>
              {category.count !== undefined && (
                <span className="sidebar-count">{category.count}</span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Sidebar;
