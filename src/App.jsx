import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loadProducts } from './store/slices/productsSlice';
import './App.css';

function App() {
  const dispatch = useDispatch();
  const { items: products, loading, error } = useSelector((state) => state.products);
  const { projectPath } = useSelector((state) => state.settings);

  useEffect(() => {
    // Load products on app startup
    console.log('App mounted, dispatching loadProducts...');
    dispatch(loadProducts());
  }, [dispatch]);

  // Debug logging
  useEffect(() => {
    console.log('Redux State:', { products, loading, error, projectPath });
  }, [products, loading, error, projectPath]);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Sakr Store Manager</h1>
        <p>Welcome to the Product Catalog Management System</p>
        <div className="info">
          <p>Platform: {window.electron?.platform || 'browser'}</p>
          <p>Electron: {window.electron?.versions?.electron || 'N/A'}</p>
          <p>Node: {window.electron?.versions?.node || 'N/A'}</p>
          <p>Chrome: {window.electron?.versions?.chrome || 'N/A'}</p>
        </div>
        
        <div className="products-info" style={{ 
          marginTop: '20px', 
          padding: '20px', 
          background: '#f0f0f0', 
          borderRadius: '8px',
          color: '#000',
          minWidth: '600px'
        }}>
          <h2 style={{ color: '#282c34', margin: '0 0 15px 0' }}>Products Data</h2>
          <p style={{ color: '#000', margin: '8px 0' }}>
            <strong>Project Path:</strong> {projectPath || 'Not set'}
          </p>
          <p style={{ color: '#000', margin: '8px 0' }}>
            <strong>Status:</strong> {loading ? 'Loading...' : error ? `Error: ${error}` : 'Loaded'}
          </p>
          <p style={{ color: '#000', margin: '8px 0' }}>
            <strong>Total Products:</strong> {products?.length || 0}
          </p>
          {error && (
            <div style={{ 
              marginTop: '10px', 
              padding: '10px', 
              background: '#ffebee', 
              border: '1px solid #f44336',
              borderRadius: '4px',
              color: '#c62828'
            }}>
              <strong>Error Details:</strong> {error}
            </div>
          )}
          {products && products.length > 0 && (
            <details style={{ marginTop: '10px' }}>
              <summary style={{ cursor: 'pointer', fontWeight: 'bold', color: '#000' }}>
                View Products ({products.length} items)
              </summary>
              <pre style={{ 
                textAlign: 'left', 
                maxHeight: '300px', 
                overflow: 'auto', 
                padding: '10px', 
                background: 'white',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '12px',
                color: '#000'
              }}>
                {JSON.stringify(products, null, 2)}
              </pre>
            </details>
          )}
          {!loading && !error && products && products.length === 0 && (
            <p style={{ color: '#666', fontStyle: 'italic', marginTop: '10px' }}>
              No products found in products.json
            </p>
          )}
        </div>
      </header>
    </div>
  );
}

export default App;
