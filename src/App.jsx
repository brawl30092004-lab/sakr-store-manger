import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { loadProducts } from './store/slices/productsSlice';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import StatusBar from './components/StatusBar';
import Settings from './components/Settings';
import './App.css';

function App() {
  const dispatch = useDispatch();
  const { items: products, loading, error } = useSelector((state) => state.products);
  const { projectPath } = useSelector((state) => state.settings);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentView, setCurrentView] = useState('main'); // 'main' or 'settings'

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
      <Toaster />
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
        <span 
          className="menu-item" 
          onClick={() => setCurrentView(currentView === 'settings' ? 'main' : 'settings')}
          style={{ cursor: 'pointer', fontWeight: currentView === 'settings' ? 'bold' : 'normal' }}
        >
          {currentView === 'settings' ? '← Back' : 'Settings'}
        </span>
        <span className="menu-item">Help</span>
      </nav>

      <div className="app-body">
        {currentView === 'settings' ? (
          <Settings />
        ) : (
          <>
            <Sidebar 
              selectedCategory={selectedCategory}
              onCategorySelect={setSelectedCategory}
            />
            <MainContent selectedCategory={selectedCategory} />
          </>
        )}
      </div>

      <StatusBar />
    </div>
  );
}

export default App;
