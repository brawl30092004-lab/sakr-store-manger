import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loadProducts } from './store/slices/productsSlice';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import StatusBar from './components/StatusBar';
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
      <header className="app-header">
        <div className="app-title">
          <h1>Sakr Store Manager</h1>
        </div>
        <div className="app-controls">
          <span className="window-control blue">🔵</span>
          <span className="window-control yellow">🟡</span>
          <span className="window-control red">🔴</span>
        </div>
      </header>
      
      <nav className="app-menu">
        <span className="menu-item">File</span>
        <span className="menu-item">Edit</span>
        <span className="menu-item">View</span>
        <span className="menu-item">Settings</span>
        <span className="menu-item">Help</span>
      </nav>

      <div className="app-body">
        <Sidebar />
        <MainContent />
      </div>

      <StatusBar />
    </div>
  );
}

export default App;
