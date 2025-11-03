import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { 
  Package, 
  AlertTriangle, 
  Tag, 
  Sparkles, 
  TrendingUp,
  DollarSign,
  ShoppingCart,
  BarChart3,
  ArrowLeft
} from 'lucide-react';
import './Dashboard.css';

/**
 * Dashboard Component
 * Displays at-a-glance metrics, charts, and recent activity for the store
 */
function Dashboard({ onNavigateToProducts }) {
  const { items: products } = useSelector((state) => state.products);

  // Calculate key metrics
  const metrics = useMemo(() => {
    const totalProducts = products.length;
    const outOfStock = products.filter(p => p.stock === 0 || p.stock < 0).length;
    const discounted = products.filter(p => p.discount === true).length;
    const newProducts = products.filter(p => p.isNew === true).length;
    const lowStock = products.filter(p => p.stock > 0 && p.stock <= 5).length;
    
    // Calculate total inventory value
    const totalValue = products.reduce((sum, p) => {
      const price = p.discount ? p.discountedPrice : p.price;
      return sum + (price * p.stock);
    }, 0);

    // Average price
    const avgPrice = totalProducts > 0 
      ? products.reduce((sum, p) => sum + p.price, 0) / totalProducts 
      : 0;

    return {
      totalProducts,
      outOfStock,
      discounted,
      newProducts,
      lowStock,
      totalValue,
      avgPrice
    };
  }, [products]);

  // Category distribution for chart
  const categoryData = useMemo(() => {
    const categories = {};
    products.forEach(p => {
      const cat = p.category || 'Uncategorized';
      categories[cat] = (categories[cat] || 0) + 1;
    });
    return Object.entries(categories)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6); // Top 6 categories
  }, [products]);

  // Price range distribution
  const priceRanges = useMemo(() => {
    const ranges = {
      '0-50': 0,
      '50-100': 0,
      '100-200': 0,
      '200-500': 0,
      '500+': 0
    };
    
    products.forEach(p => {
      const price = p.price;
      if (price < 50) ranges['0-50']++;
      else if (price < 100) ranges['50-100']++;
      else if (price < 200) ranges['100-200']++;
      else if (price < 500) ranges['200-500']++;
      else ranges['500+']++;
    });

    return Object.entries(ranges).map(([range, count]) => ({ range, count }));
  }, [products]);

  // Stock level distribution
  const stockLevels = useMemo(() => {
    return {
      outOfStock: metrics.outOfStock,
      lowStock: metrics.lowStock,
      inStock: products.filter(p => p.stock > 5).length
    };
  }, [products, metrics]);

  // Recent activity (last 5 products sorted by ID - assuming higher ID = more recent)
  const recentProducts = useMemo(() => {
    return [...products]
      .sort((a, b) => b.id - a.id)
      .slice(0, 5);
  }, [products]);

  // Get max count for category chart scaling
  const maxCategoryCount = Math.max(...categoryData.map(c => c.count), 1);

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="dashboard-title-row">
          <div className="dashboard-title-content">
            <h2 className="dashboard-title">Dashboard Overview</h2>
            <p className="dashboard-subtitle">At-a-glance metrics and insights for your store</p>
          </div>
          {onNavigateToProducts && (
            <button className="back-to-products-btn" onClick={onNavigateToProducts}>
              <ArrowLeft size={20} />
              <span>Back to Products</span>
            </button>
          )}
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="metrics-grid">
        <div className="metric-card primary">
          <div className="metric-icon">
            <Package size={24} />
          </div>
          <div className="metric-content">
            <h3 className="metric-value">{metrics.totalProducts}</h3>
            <p className="metric-label">Total Products</p>
          </div>
        </div>

        <div className="metric-card danger">
          <div className="metric-icon">
            <AlertTriangle size={24} />
          </div>
          <div className="metric-content">
            <h3 className="metric-value">{metrics.outOfStock}</h3>
            <p className="metric-label">Out of Stock</p>
          </div>
        </div>

        <div className="metric-card success">
          <div className="metric-icon">
            <Tag size={24} />
          </div>
          <div className="metric-content">
            <h3 className="metric-value">{metrics.discounted}</h3>
            <p className="metric-label">Discounted Items</p>
          </div>
        </div>

        <div className="metric-card info">
          <div className="metric-icon">
            <Sparkles size={24} />
          </div>
          <div className="metric-content">
            <h3 className="metric-value">{metrics.newProducts}</h3>
            <p className="metric-label">New Products</p>
          </div>
        </div>

        <div className="metric-card warning">
          <div className="metric-icon">
            <ShoppingCart size={24} />
          </div>
          <div className="metric-content">
            <h3 className="metric-value">{metrics.lowStock}</h3>
            <p className="metric-label">Low Stock (≤5)</p>
          </div>
        </div>

        <div className="metric-card accent">
          <div className="metric-icon">
            <DollarSign size={24} />
          </div>
          <div className="metric-content">
            <h3 className="metric-value">{metrics.totalValue.toFixed(2)} EGP</h3>
            <p className="metric-label">Inventory Value</p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-grid">
        {/* Category Distribution Chart */}
        <div className="chart-card">
          <div className="chart-header">
            <BarChart3 size={20} />
            <h3>Category Distribution</h3>
          </div>
          <div className="chart-content">
            {categoryData.length > 0 ? (
              <div className="bar-chart">
                {categoryData.map((cat, idx) => (
                  <div key={idx} className="bar-item">
                    <div className="bar-label">{cat.name}</div>
                    <div className="bar-container">
                      <div 
                        className="bar-fill"
                        style={{ width: `${(cat.count / maxCategoryCount) * 100}%` }}
                      >
                        <span className="bar-value">{cat.count}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="chart-empty">
                <Package size={32} />
                <p>No products yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Price Range Distribution */}
        <div className="chart-card">
          <div className="chart-header">
            <DollarSign size={20} />
            <h3>Price Ranges</h3>
          </div>
          <div className="chart-content">
            <div className="price-chart">
              {priceRanges.map((range, idx) => (
                <div key={idx} className="price-range">
                  <div className="price-range-label">${range.range}</div>
                  <div className="price-range-bar">
                    <div 
                      className="price-range-fill"
                      style={{ 
                        width: `${metrics.totalProducts > 0 ? (range.count / metrics.totalProducts) * 100 : 0}%` 
                      }}
                    />
                  </div>
                  <div className="price-range-value">{range.count}</div>
                </div>
              ))}
            </div>
            <div className="chart-summary">
              <div className="summary-item">
                <span className="summary-label">Average Price:</span>
                <span className="summary-value">{metrics.avgPrice.toFixed(2)} EGP</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stock Levels */}
        <div className="chart-card">
          <div className="chart-header">
            <TrendingUp size={20} />
            <h3>Stock Levels</h3>
          </div>
          <div className="chart-content">
            <div className="stock-chart">
              <div className="stock-level out-of-stock">
                <div className="stock-icon">
                  <AlertTriangle size={20} />
                </div>
                <div className="stock-info">
                  <div className="stock-label">Out of Stock</div>
                  <div className="stock-value">{stockLevels.outOfStock}</div>
                </div>
              </div>
              <div className="stock-level low-stock">
                <div className="stock-icon">
                  <ShoppingCart size={20} />
                </div>
                <div className="stock-info">
                  <div className="stock-label">Low Stock (1-5)</div>
                  <div className="stock-value">{stockLevels.lowStock}</div>
                </div>
              </div>
              <div className="stock-level in-stock">
                <div className="stock-icon">
                  <Package size={20} />
                </div>
                <div className="stock-info">
                  <div className="stock-label">In Stock (6+)</div>
                  <div className="stock-value">{stockLevels.inStock}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Section */}
      <div className="recent-activity">
        <div className="activity-header">
          <h3>Recent Products</h3>
          <p>Latest additions to your inventory</p>
        </div>
        <div className="activity-content">
          {recentProducts.length > 0 ? (
            <div className="activity-list">
              {recentProducts.map(product => (
                <div key={product.id} className="activity-item">
                  <div className="activity-image">
                    {product.image || product.images?.primary ? (
                      <img 
                        src={product.image || product.images.primary} 
                        alt={product.name}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div className="activity-image-placeholder" style={{ display: product.image || product.images?.primary ? 'none' : 'flex' }}>
                      <Package size={24} />
                    </div>
                  </div>
                  <div className="activity-details">
                    <h4 className="activity-name">{product.name || 'Unnamed Product'}</h4>
                    <div className="activity-meta">
                      <span className="activity-category">{product.category || 'No category'}</span>
                      <span className="activity-separator">•</span>
                      <span className="activity-price">{product.price.toFixed(2)} EGP</span>
                      {product.discount && (
                        <>
                          <span className="activity-separator">•</span>
                          <span className="activity-discount">
                            <Tag size={14} /> {product.discountedPrice.toFixed(2)} EGP
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="activity-badges">
                    {product.isNew && (
                      <span className="badge badge-new">
                        <Sparkles size={14} /> New
                      </span>
                    )}
                    {product.stock === 0 && (
                      <span className="badge badge-out-of-stock">
                        <AlertTriangle size={14} /> Out
                      </span>
                    )}
                    {product.stock > 0 && product.stock <= 5 && (
                      <span className="badge badge-low-stock">
                        Low Stock
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="activity-empty">
              <Package size={48} />
              <p>No products in your inventory</p>
              <span>Start by adding your first product</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
