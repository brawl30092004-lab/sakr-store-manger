import React, { useMemo, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Package, Edit2, Tag } from 'lucide-react';
import { getCategoriesFromProducts } from '../services/productValidation';
import { renameCategory } from '../store/slices/productsSlice';
import RenameCategoryDialog from './RenameCategoryDialog';
import { showSuccess, showError } from '../services/toastService';
import './Sidebar.css';

function Sidebar({ selectedCategory, onCategorySelect, currentView, onViewChange }) {
  const dispatch = useDispatch();
  const { items: products } = useSelector((state) => state.products);
  const { items: coupons } = useSelector((state) => state.coupons);
  const [renamingCategory, setRenamingCategory] = useState(null);

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

  // Handle rename category button click
  const handleRenameClick = (e, category) => {
    e.stopPropagation();
    setRenamingCategory(category);
  };

  // Handle rename category confirmation
  const handleRenameConfirm = async (newCategoryName) => {
    if (!renamingCategory) return;

    try {
      await dispatch(renameCategory({
        oldCategory: renamingCategory.name,
        newCategory: newCategoryName
      })).unwrap();
      
      showSuccess(`Category "${renamingCategory.name}" renamed to "${newCategoryName}" for ${renamingCategory.count} product${renamingCategory.count !== 1 ? 's' : ''}`);
      
      // Update selected category if it was the one being renamed
      if (selectedCategory === renamingCategory.id) {
        const newCategoryId = newCategoryName.toLowerCase().replace(/\s+/g, '-');
        onCategorySelect(newCategoryId);
      }
    } catch (error) {
      showError(error.message || 'Failed to rename category');
    } finally {
      setRenamingCategory(null);
    }
  };

  return (
    <div className="sidebar">
      {/* View Selector */}
      <div className="sidebar-section">
        <h3 className="sidebar-title">VIEWS</h3>
        <div className="sidebar-divider"></div>
        <ul className="sidebar-list">
          <li 
            className={`sidebar-item ${currentView === 'products' ? 'active' : ''}`}
            onClick={() => onViewChange && onViewChange('products')}
          >
            <span className="sidebar-icon"><Package size={18} /></span>
            <span className="sidebar-label">Products</span>
            <span className="sidebar-count">{products.length}</span>
          </li>
          <li 
            className={`sidebar-item ${currentView === 'coupons' ? 'active' : ''}`}
            onClick={() => onViewChange && onViewChange('coupons')}
          >
            <span className="sidebar-icon"><Tag size={18} /></span>
            <span className="sidebar-label">Coupons</span>
            <span className="sidebar-count">{coupons.length}</span>
          </li>
        </ul>
      </div>

      {/* Categories (only show for products view) */}
      {currentView === 'products' && (
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
                <div className="sidebar-item-right">
                  {category.count !== undefined && (
                    <span className="sidebar-count">{category.count}</span>
                  )}
                  {category.id !== 'all' && (
                    <button
                      className="sidebar-rename-btn"
                      onClick={(e) => handleRenameClick(e, category)}
                      title={`Rename "${category.name}" category`}
                      aria-label={`Rename ${category.name}`}
                    >
                      <Edit2 size={14} />
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Rename Category Dialog */}
      <RenameCategoryDialog
        isOpen={!!renamingCategory}
        onClose={() => setRenamingCategory(null)}
        onConfirm={handleRenameConfirm}
        currentCategory={renamingCategory?.name}
        productCount={renamingCategory?.count || 0}
      />
    </div>
  );
}

export default Sidebar;
