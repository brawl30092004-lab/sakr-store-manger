import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { Minus, Maximize2, X } from 'lucide-react';
import { loadProducts, bulkRemoveNewBadge, bulkRemoveDiscount, bulkDeleteProducts, saveProducts } from './store/slices/productsSlice';
import { setProjectPath } from './store/slices/settingsSlice';
import { attachKeyboardShortcuts } from './services/keyboardShortcuts';
import { showSuccess, showError } from './services/toastService';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import StatusBar from './components/StatusBar';
import Settings from './components/Settings';
import DataSourceNotFoundDialog from './components/DataSourceNotFoundDialog';
import BulkOperationsDialog from './components/BulkOperationsDialog';
import './App.css';

function App() {
  const dispatch = useDispatch();
  const { items: products, loading, error } = useSelector((state) => state.products);
  const { projectPath, dataSource } = useSelector((state) => state.settings);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeFilters, setActiveFilters] = useState([]); // Array to support multiple filters
  const [currentView, setCurrentView] = useState('main'); // 'main' or 'settings'
  const [showDataSourceDialog, setShowDataSourceDialog] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null); // Track which menu is open
  const [showAboutDialog, setShowAboutDialog] = useState(false);
  const [showShortcutsDialog, setShowShortcutsDialog] = useState(false);
  const [bulkOperationDialog, setBulkOperationDialog] = useState({ isOpen: false, type: null });
  
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
        handlePublishToGitHub();
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
        } else if (showAboutDialog) {
          setShowAboutDialog(false);
        } else if (showShortcutsDialog) {
          setShowShortcutsDialog(false);
        } else if (mainContentRef.current?.handleEscape) {
          mainContentRef.current.handleEscape();
        }
      },
      onEnter: () => {
        if (currentView === 'main' && mainContentRef.current?.handleEnter) {
          mainContentRef.current.handleEnter();
        }
      },
      onReload: () => {
        handleReload();
      },
      onZoomIn: () => {
        handleZoomIn();
      },
      onZoomOut: () => {
        handleZoomOut();
      },
      onActualSize: () => {
        handleActualSize();
      },
      onToggleFullscreen: () => {
        handleToggleFullscreen();
      }
    };

    const cleanup = attachKeyboardShortcuts(handlers);
    return cleanup;
  }, [currentView, showAboutDialog, showShortcutsDialog]);

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

  // Menu handlers
  const handleNewProduct = () => {
    if (currentView === 'main' && mainContentRef.current?.handleNewProduct) {
      mainContentRef.current.handleNewProduct();
      setActiveMenu(null);
    }
  };

  const handleSaveAll = async () => {
    if (currentView === 'main' && mainContentRef.current?.handleSave) {
      await mainContentRef.current.handleSave();
      setActiveMenu(null);
    }
  };

  const handleExport = () => {
    if (currentView === 'main' && mainContentRef.current?.handleExport) {
      mainContentRef.current.handleExport();
      setActiveMenu(null);
    }
  };

  const handleBrowseDataSource = () => {
    setShowDataSourceDialog(true);
    setActiveMenu(null);
  };

  const handleOpenSettings = () => {
    setCurrentView('settings');
    setActiveMenu(null);
  };

  const handleQuit = () => {
    if (window.confirm('Are you sure you want to quit?')) {
      window.close();
    }
    setActiveMenu(null);
  };

  const handleDeleteProduct = () => {
    if (currentView === 'main' && mainContentRef.current?.handleDeleteShortcut) {
      mainContentRef.current.handleDeleteShortcut();
      setActiveMenu(null);
    }
  };

  const handleBulkRemoveNewBadge = () => {
    setBulkOperationDialog({ isOpen: true, type: 'removeNewBadge' });
    setActiveMenu(null);
  };

  const handleBulkRemoveDiscount = () => {
    setBulkOperationDialog({ isOpen: true, type: 'removeDiscount' });
    setActiveMenu(null);
  };

  const handleBulkDeleteProducts = () => {
    setBulkOperationDialog({ isOpen: true, type: 'deleteProducts' });
    setActiveMenu(null);
  };

  const handleBulkOperationConfirm = async (selectedProductIds) => {
    try {
      const { type } = bulkOperationDialog;
      
      switch (type) {
        case 'removeNewBadge':
          dispatch(bulkRemoveNewBadge(selectedProductIds));
          // Get the current products from state after the update
          const updatedProducts1 = products.map(product => {
            if (selectedProductIds.includes(product.id)) {
              return { ...product, isNew: false };
            }
            return product;
          });
          await dispatch(saveProducts(updatedProducts1)).unwrap();
          showSuccess(`Successfully removed "New" badge from ${selectedProductIds.length} product(s)`);
          break;
        case 'removeDiscount':
          dispatch(bulkRemoveDiscount(selectedProductIds));
          const updatedProducts2 = products.map(product => {
            if (selectedProductIds.includes(product.id)) {
              return { ...product, discount: false, discountedPrice: 0.00 };
            }
            return product;
          });
          await dispatch(saveProducts(updatedProducts2)).unwrap();
          showSuccess(`Successfully removed discount from ${selectedProductIds.length} product(s)`);
          break;
        case 'deleteProducts':
          dispatch(bulkDeleteProducts(selectedProductIds));
          const updatedProducts3 = products.filter(product => !selectedProductIds.includes(product.id));
          await dispatch(saveProducts(updatedProducts3)).unwrap();
          showSuccess(`Successfully deleted ${selectedProductIds.length} product(s)`);
          break;
      }
    } catch (error) {
      showError('Failed to complete bulk operation: ' + error);
    }
  };

  const handleReload = () => {
    dispatch(loadProducts());
    setActiveMenu(null);
  };

  const handleZoomIn = () => {
    document.body.style.zoom = (parseFloat(document.body.style.zoom || 1) + 0.1).toString();
    setActiveMenu(null);
  };

  const handleZoomOut = () => {
    document.body.style.zoom = Math.max(0.5, parseFloat(document.body.style.zoom || 1) - 0.1).toString();
    setActiveMenu(null);
  };

  const handleActualSize = () => {
    document.body.style.zoom = '1';
    setActiveMenu(null);
  };

  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
    setActiveMenu(null);
  };

  const handlePublishToGitHub = async () => {
    try {
      const gitStatus = await window.electron.getGitStatus();
      if (gitStatus.hasChanges) {
        const message = prompt('Enter commit message:', 'Update products');
        if (message) {
          await window.electron.publishToGitHub(message);
          showSuccess('Successfully published to GitHub');
        }
      } else {
        showSuccess('No changes to publish');
      }
    } catch (error) {
      showError('Failed to publish: ' + error.message);
    }
    setActiveMenu(null);
  };

  const handleCheckUpdates = async () => {
    showSuccess('Checking for updates...');
    setActiveMenu(null);
  };

  const handleOpenDataFolder = async () => {
    if (projectPath) {
      console.log('Open folder:', projectPath);
      showSuccess('Opening data folder...');
    } else {
      showError('No data folder configured');
    }
    setActiveMenu(null);
  };

  const handleShowDocumentation = () => {
    window.open('https://github.com/your-repo/sakr-store-manager#readme', '_blank');
    setActiveMenu(null);
  };

  const handleShowShortcuts = () => {
    setShowShortcutsDialog(true);
    setActiveMenu(null);
  };

  const handleShowAbout = () => {
    setShowAboutDialog(true);
    setActiveMenu(null);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (activeMenu && !e.target.closest('.app-menu')) {
        setActiveMenu(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [activeMenu]);


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
      
      {/* Bulk Operations Dialog */}
      <BulkOperationsDialog
        isOpen={bulkOperationDialog.isOpen}
        onClose={() => setBulkOperationDialog({ isOpen: false, type: null })}
        products={products}
        operationType={bulkOperationDialog.type}
        onConfirm={handleBulkOperationConfirm}
      />
      
      <header className="app-header">
        <div className="app-title">
          <h1>Sakr Store Manager</h1>
        </div>
        <div className="app-controls">
          <span className="window-control minimize"><Minus size={16} /></span>
          <span className="window-control maximize"><Maximize2 size={16} /></span>
          <span className="window-control close"><X size={16} /></span>
        </div>
      </header>
      
      <nav className="app-menu">
        {/* File Menu */}
        <div className="menu-item-wrapper">
          <span 
            className={`menu-item ${activeMenu === 'file' ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              setActiveMenu(activeMenu === 'file' ? null : 'file');
            }}
          >
            File
          </span>
          {activeMenu === 'file' && (
            <div className="menu-dropdown">
              <div className="menu-option" onClick={handleNewProduct}>
                <span>New Product</span>
                <span className="shortcut">Ctrl+N</span>
              </div>
              <div className="menu-option" onClick={handleSaveAll}>
                <span>Save All</span>
                <span className="shortcut">Ctrl+S</span>
              </div>
              <div className="menu-divider"></div>
              <div className="menu-option" onClick={handleExport}>
                <span>Export...</span>
              </div>
              <div className="menu-option" onClick={handleBrowseDataSource}>
                <span>Browse Data Source...</span>
              </div>
              <div className="menu-divider"></div>
              <div className="menu-option" onClick={handleOpenSettings}>
                <span>Settings</span>
              </div>
              <div className="menu-divider"></div>
              <div className="menu-option" onClick={handleQuit}>
                <span>Quit</span>
              </div>
            </div>
          )}
        </div>

        {/* Edit Menu */}
        <div className="menu-item-wrapper">
          <span 
            className={`menu-item ${activeMenu === 'edit' ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              setActiveMenu(activeMenu === 'edit' ? null : 'edit');
            }}
          >
            Edit
          </span>
          {activeMenu === 'edit' && (
            <div className="menu-dropdown">
              <div className="menu-option" onClick={handleDeleteProduct}>
                <span>Delete Product</span>
                <span className="shortcut">Delete</span>
              </div>
              <div className="menu-divider"></div>
              <div className="menu-option" onClick={handleBulkRemoveNewBadge}>
                <span>Bulk Remove New Badge</span>
              </div>
              <div className="menu-option" onClick={handleBulkRemoveDiscount}>
                <span>Bulk Remove Discount</span>
              </div>
              <div className="menu-option" onClick={handleBulkDeleteProducts}>
                <span>Bulk Delete Products</span>
              </div>
            </div>
          )}
        </div>

        {/* View Menu */}
        <div className="menu-item-wrapper">
          <span 
            className={`menu-item ${activeMenu === 'view' ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              setActiveMenu(activeMenu === 'view' ? null : 'view');
            }}
          >
            View
          </span>
          {activeMenu === 'view' && (
            <div className="menu-dropdown">
              <div className="menu-option" onClick={handleReload}>
                <span>Reload</span>
                <span className="shortcut">Ctrl+R</span>
              </div>
              <div className="menu-divider"></div>
              <div className="menu-option" onClick={handleActualSize}>
                <span>Actual Size</span>
                <span className="shortcut">Ctrl+0</span>
              </div>
              <div className="menu-option" onClick={handleZoomIn}>
                <span>Zoom In</span>
                <span className="shortcut">Ctrl++</span>
              </div>
              <div className="menu-option" onClick={handleZoomOut}>
                <span>Zoom Out</span>
                <span className="shortcut">Ctrl+-</span>
              </div>
              <div className="menu-divider"></div>
              <div className="menu-option" onClick={handleToggleFullscreen}>
                <span>Toggle Fullscreen</span>
                <span className="shortcut">F11</span>
              </div>
            </div>
          )}
        </div>

        {/* Tools Menu */}
        <div className="menu-item-wrapper">
          <span 
            className={`menu-item ${activeMenu === 'tools' ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              setActiveMenu(activeMenu === 'tools' ? null : 'tools');
            }}
          >
            Tools
          </span>
          {activeMenu === 'tools' && (
            <div className="menu-dropdown">
              <div className="menu-option" onClick={handlePublishToGitHub}>
                <span>Publish to GitHub</span>
                <span className="shortcut">Ctrl+P</span>
              </div>
              <div className="menu-divider"></div>
              <div className="menu-option" onClick={handleCheckUpdates}>
                <span>Check for Updates...</span>
              </div>
              <div className="menu-option" onClick={handleOpenDataFolder}>
                <span>Open Data Folder</span>
              </div>
            </div>
          )}
        </div>

        {/* Help Menu */}
        <div className="menu-item-wrapper">
          <span 
            className={`menu-item ${activeMenu === 'help' ? 'active' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              setActiveMenu(activeMenu === 'help' ? null : 'help');
            }}
          >
            Help
          </span>
          {activeMenu === 'help' && (
            <div className="menu-dropdown">
              <div className="menu-option" onClick={handleShowDocumentation}>
                <span>Documentation</span>
              </div>
              <div className="menu-option" onClick={handleShowShortcuts}>
                <span>Keyboard Shortcuts</span>
                <span className="shortcut">Ctrl+/</span>
              </div>
              <div className="menu-divider"></div>
              <div className="menu-option" onClick={handleShowAbout}>
                <span>About</span>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* About Dialog */}
      {showAboutDialog && (
        <div className="modal-overlay" onClick={() => setShowAboutDialog(false)}>
          <div className="modal-content about-dialog" onClick={(e) => e.stopPropagation()}>
            <h2>Sakr Store Manager</h2>
            <p className="version">Version 1.0.0</p>
            <p>A desktop application for managing product catalogs with Git integration</p>
            <p className="tech-info">
              Electron: {window.electron?.versions?.electron}<br/>
              Chrome: {window.electron?.versions?.chrome}<br/>
              Node: {window.electron?.versions?.node}
            </p>
            <button className="btn btn-primary" onClick={() => setShowAboutDialog(false)}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Dialog */}
      {showShortcutsDialog && (
        <div className="modal-overlay" onClick={() => setShowShortcutsDialog(false)}>
          <div className="modal-content shortcuts-dialog" onClick={(e) => e.stopPropagation()}>
            <h2>⌨️ Keyboard Shortcuts</h2>
            <div className="shortcuts-grid">
              <div className="shortcut-section">
                <h3>Product Management</h3>
                <div className="shortcut-row">
                  <span>New Product</span>
                  <kbd>Ctrl+N</kbd>
                </div>
                <div className="shortcut-row">
                  <span>Save</span>
                  <kbd>Ctrl+S</kbd>
                </div>
                <div className="shortcut-row">
                  <span>Delete Product</span>
                  <kbd>Delete</kbd>
                </div>
              </div>
              <div className="shortcut-section">
                <h3>Navigation</h3>
                <div className="shortcut-row">
                  <span>Focus Search</span>
                  <kbd>Ctrl+F</kbd>
                </div>
                <div className="shortcut-row">
                  <span>Close Dialog</span>
                  <kbd>Esc</kbd>
                </div>
                <div className="shortcut-row">
                  <span>Submit Form</span>
                  <kbd>Enter</kbd>
                </div>
              </div>
              <div className="shortcut-section">
                <h3>Publishing</h3>
                <div className="shortcut-row">
                  <span>Publish to GitHub</span>
                  <kbd>Ctrl+P</kbd>
                </div>
              </div>
              <div className="shortcut-section">
                <h3>View</h3>
                <div className="shortcut-row">
                  <span>Reload</span>
                  <kbd>Ctrl+R</kbd>
                </div>
                <div className="shortcut-row">
                  <span>Zoom In</span>
                  <kbd>Ctrl++</kbd>
                </div>
                <div className="shortcut-row">
                  <span>Zoom Out</span>
                  <kbd>Ctrl+-</kbd>
                </div>
                <div className="shortcut-row">
                  <span>Actual Size</span>
                  <kbd>Ctrl+0</kbd>
                </div>
                <div className="shortcut-row">
                  <span>Fullscreen</span>
                  <kbd>F11</kbd>
                </div>
              </div>
            </div>
            <button className="btn btn-primary" onClick={() => setShowShortcutsDialog(false)}>
              Close
            </button>
          </div>
        </div>
      )}

      <div className="app-body">
        {currentView === 'settings' ? (
          <Settings onBackToMain={() => setCurrentView('main')} />
        ) : (
          <>
            <Sidebar 
              selectedCategory={selectedCategory}
              onCategorySelect={setSelectedCategory}
              activeFilters={activeFilters}
              onFilterToggle={(filterId) => {
                setActiveFilters(prev => 
                  prev.includes(filterId) 
                    ? prev.filter(id => id !== filterId)
                    : [...prev, filterId]
                );
              }}
            />
            <MainContent 
              ref={mainContentRef}
              selectedCategory={selectedCategory}
              activeFilters={activeFilters}
            />
          </>
        )}
      </div>

      <StatusBar />
    </div>
  );
}

export default App;
