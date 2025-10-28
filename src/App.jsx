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
    dispatch(loadProducts());
  }, [dispatch]);

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
        
        <div className="products-info" style={{ marginTop: '20px', padding: '20px', background: '#f0f0f0', borderRadius: '8px' }}>
          <h2>Products Data</h2>
          <p><strong>Project Path:</strong> {projectPath}</p>
          <p><strong>Status:</strong> {loading ? 'Loading...' : error ? `Error: ${error}` : 'Loaded'}</p>
          <p><strong>Total Products:</strong> {products.length}</p>
          {products.length > 0 && (
            <details style={{ marginTop: '10px' }}>
              <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>View Products</summary>
              <pre style={{ textAlign: 'left', maxHeight: '300px', overflow: 'auto', padding: '10px', background: 'white' }}>
                {JSON.stringify(products, null, 2)}
              </pre>
            </details>
          )}
        </div>
      </header>
    </div>
  );
}

export default App;
