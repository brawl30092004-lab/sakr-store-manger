import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { loadProducts } from './store/slices/productsSlice';
import { setProjectPath } from './store/slices/settingsSlice';
import { attachKeyboardShortcuts } from './services/keyboardShortcuts';
import { showSuccess, showError } from './services/toastService';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import StatusBar from './components/StatusBar';
import Settings from './components/Settings';
import DataSourceNotFoundDialog from './components/DataSourceNotFoundDialog';
import './App.css';

function App() {
  const dispatch = useDispatch();
  const { items: products, loading, error } = useSelector((state) => state.products);
  const { projectPath, dataSource } = useSelector((state) => state.settings);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentView, setCurrentView] = useState('main'); // 'main' or 'settings'
  const [showDataSourceDialog, setShowDataSourceDialog] = useState(false);
  
  // Refs for keyboard shortcut handlers
  const mainContentRef = useRef(null);

  useEffect(() => {
    // Load products on app startup
    console.log('App mounted, dispatching loadProducts...');
    dispatch(loadProducts()).unwrap()
      .catch((err) => {
        // Check if error is due to missing products.json
        if (err.includes('PRODUCTS_NOT_FOUND') || err.includes('ENOENT')) {
          console.log('Products file not found, showing dialog');
          setShowDataSourceDialog(true);
        }
      });
  }, [dispatch]);

  // Reload products when data source changes
  useEffect(() => {
    if (dataSource) {
      console.log('Data source changed to:', dataSource);
      dispatch(loadProducts()).unwrap()
        .catch((err) => {
          if (err.includes('PRODUCTS_NOT_FOUND') || err.includes('ENOENT')) {
            setShowDataSourceDialog(true);
          }
        });
    }
  }, [dataSource, dispatch]);

  // Debug logging
  useEffect(() => {
    console.log('Redux State:', { products, loading, error, projectPath, dataSource });
  }, [products, loading, error, projectPath, dataSource]);

  // Setup keyboard shortcuts
  useEffect(() => {
    const handlers = {
      onNewProduct: () => {
        if (currentView === 'main' && mainContentRef.current?.handleNewProduct) {
          mainContentRef.current.handleNewProduct();
        }
      },
      onSave: () => {
        if (currentView === 'main' && mainContentRef.current?.handleSave) {
          mainContentRef.current.handleSave();
        }
      },
      onPublish: () => {
        // TODO: Implement publish to GitHub functionality
        console.log('Publish shortcut triggered (Ctrl+P)');
      },
      onFocusSearch: () => {
        if (currentView === 'main' && mainContentRef.current?.focusSearch) {
          mainContentRef.current.focusSearch();
        }
      },
      onDelete: () => {
        if (currentView === 'main' && mainContentRef.current?.handleDeleteShortcut) {
          mainContentRef.current.handleDeleteShortcut();
        }
      },
      onEscape: () => {
        if (currentView === 'settings') {
          setCurrentView('main');
        } else if (mainContentRef.current?.handleEscape) {
          mainContentRef.current.handleEscape();
        }
      },
      onEnter: () => {
        if (currentView === 'main' && mainContentRef.current?.handleEnter) {
          mainContentRef.current.handleEnter();
        }
      }
    };

    const cleanup = attachKeyboardShortcuts(handlers);
    return cleanup;
  }, [currentView]);

  // Handle creating new products.json file
  const handleCreateNewFile = async () => {
    try {
      await window.electron.fs.createEmptyProducts(projectPath);
      showSuccess('Created empty products.json file');
      setShowDataSourceDialog(false);
      // Reload products
      dispatch(loadProducts());
    } catch (error) {
      console.error('Failed to create products.json:', error);
      showError('Failed to create products.json: ' + error.message);
    }
  };

  // Handle browsing for existing file
  const handleBrowseForExisting = async () => {
    try {
      const selectedPath = await window.electron.browseDirectory();
      if (selectedPath) {
        dispatch(setProjectPath(selectedPath));
        setShowDataSourceDialog(false);
        // Try to load products from new path
        dispatch(loadProducts()).unwrap()
          .then(() => {
            showSuccess('Products loaded successfully');
          })
          .catch((err) => {
            if (err.includes('PRODUCTS_NOT_FOUND') || err.includes('ENOENT')) {
              setShowDataSourceDialog(true);
            }
          });
      }
    } catch (error) {
      console.error('Failed to browse directory:', error);
      showError('Failed to browse directory: ' + error.message);
    }
  };

  // Handle closing dialog
  const handleCloseDialog = () => {
    setShowDataSourceDialog(false);
  };


  return (
    <div className="App">
      <Toaster />
      
      {/* Data Source Not Found Dialog */}
      {showDataSourceDialog && (
        <DataSourceNotFoundDialog
          onCreateNew={handleCreateNewFile}
          onBrowseExisting={handleBrowseForExisting}
          onClose={handleCloseDialog}
        />
      )}
      
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
            <MainContent 
              ref={mainContentRef}
              selectedCategory={selectedCategory} 
            />
          </>
        )}
      </div>

      <StatusBar />
    </div>
  );
}

export default App;
