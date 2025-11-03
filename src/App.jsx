import React, { useEffect, useState, useRef, useCallback, lazy, Suspense } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { Minus, Maximize2, X, Home, Package, Plus, Save, Upload, Settings, Github, Keyboard } from 'lucide-react';
import { loadProducts, bulkRemoveNewBadge, bulkRemoveDiscount, bulkDeleteProducts, bulkApplyDiscount, bulkMakeNew, saveProducts } from './store/slices/productsSlice';
import { setProjectPath } from './store/slices/settingsSlice';
import { attachKeyboardShortcuts } from './services/keyboardShortcuts';
import { showSuccess, showError } from './services/toastService';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import StatusBar from './components/StatusBar';
import DataSourceNotFoundDialog from './components/DataSourceNotFoundDialog';
import SettingsPanel from './components/SettingsPanel';
import Breadcrumbs from './components/Breadcrumbs';
import FloatingActionButtons from './components/FloatingActionButtons';
import CommandPalette from './components/CommandPalette';
import WelcomeScreen from './components/WelcomeScreen';
import './App.css';

// Lazy load heavy components
const BulkOperationsDialog = lazy(() => import('./components/BulkOperationsDialog'));

function App() {
  const dispatch = useDispatch();
  const { items: products, loading, error } = useSelector((state) => state.products);
  const { projectPath, dataSource } = useSelector((state) => state.settings);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeFilters, setActiveFilters] = useState([]); // Array to support multiple filters
  const [showSettingsPanel, setShowSettingsPanel] = useState(false); // Settings panel instead of view
  const [showDataSourceDialog, setShowDataSourceDialog] = useState(false);
  const [activeMenu, setActiveMenu] = useState(null); // Track which menu is open
  const [showAboutDialog, setShowAboutDialog] = useState(false);
  const [showShortcutsDialog, setShowShortcutsDialog] = useState(false);
  const [showCommandPalette, setShowCommandPalette] = useState(false); // Command palette
  const [bulkOperationDialog, setBulkOperationDialog] = useState({ isOpen: false, type: null });
  const [showWelcomeScreen, setShowWelcomeScreen] = useState(false);
  
  // Refs for keyboard shortcut handlers
  const mainContentRef = useRef(null);

  // Check if this is the user's first time using the app
  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
    if (!hasSeenWelcome) {
      setShowWelcomeScreen(true);
    }
  }, []);

  // Handle welcome screen completion
  const handleWelcomeComplete = useCallback(() => {
    localStorage.setItem('hasSeenWelcome', 'true');
    setShowWelcomeScreen(false);
    
    // After welcome screen, check if we need to show data source dialog
    if (!projectPath) {
      setShowDataSourceDialog(true);
    }
  }, [projectPath]);

  useEffect(() => {
    // Don't load products while welcome screen is showing
    if (showWelcomeScreen) {
      return;
    }
    
    // Load products on app startup only if projectPath is set
    if (projectPath) {
      dispatch(loadProducts()).unwrap()
        .catch((err) => {
          // Check if error is due to missing products.json
          if (err.includes('PRODUCTS_NOT_FOUND') || err.includes('ENOENT')) {
            setShowDataSourceDialog(true);
          }
        });
    } else {
      // No project path - show data source dialog (but not if welcome screen is showing)
      if (!showWelcomeScreen) {
        setShowDataSourceDialog(true);
      }
    }
  }, [dispatch, projectPath, showWelcomeScreen]);

  // Reload products when data source changes
  useEffect(() => {
    if (dataSource && projectPath) {
      dispatch(loadProducts()).unwrap()
        .catch((err) => {
          if (err.includes('PRODUCTS_NOT_FOUND') || err.includes('ENOENT')) {
            setShowDataSourceDialog(true);
          }
        });
    }
  }, [dataSource, dispatch, projectPath]);

  // Setup keyboard shortcuts
  useEffect(() => {
    const handlers = {
      onNewProduct: () => {
        if (mainContentRef.current?.handleNewProduct) {
          mainContentRef.current.handleNewProduct();
        }
      },
      onSave: () => {
        if (mainContentRef.current?.handleSave) {
          mainContentRef.current.handleSave();
        }
      },
      onPublish: () => {
        handlePublishToGitHub();
      },
      onFocusSearch: () => {
        if (mainContentRef.current?.focusSearch) {
          mainContentRef.current.focusSearch();
        }
      },
      onDelete: () => {
        if (mainContentRef.current?.handleDeleteShortcut) {
          mainContentRef.current.handleDeleteShortcut();
        }
      },
      onEscape: () => {
        if (showSettingsPanel) {
          setShowSettingsPanel(false);
        } else if (showCommandPalette) {
          setShowCommandPalette(false);
        } else if (showAboutDialog) {
          setShowAboutDialog(false);
        } else if (showShortcutsDialog) {
          setShowShortcutsDialog(false);
        } else if (mainContentRef.current?.handleEscape) {
          mainContentRef.current.handleEscape();
        }
      },
      onEnter: () => {
        if (mainContentRef.current?.handleEnter) {
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
      },
      onCommandPalette: () => {
        setShowCommandPalette(prev => !prev);
      }
    };

    const cleanup = attachKeyboardShortcuts(handlers);
    return cleanup;
  }, [showSettingsPanel, showCommandPalette, showAboutDialog, showShortcutsDialog]);

  // Handle creating new products.json file - MEMOIZED
  const handleCreateNewFile = useCallback(async () => {
    try {
      // Validate projectPath exists
      if (!projectPath) {
        showError('Please select a project path first');
        return;
      }
      
      await window.electron.fs.createEmptyProducts(projectPath);
      showSuccess('Created empty products.json file');
      setShowDataSourceDialog(false);
      // Reload products
      dispatch(loadProducts());
    } catch (error) {
      showError('Failed to create products.json: ' + error.message);
    }
  }, [projectPath, dispatch]);

  // Handle browsing for existing file - MEMOIZED
  const handleBrowseForExisting = useCallback(async () => {
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
      showError('Failed to browse directory: ' + error.message);
    }
  }, [dispatch]);

  // Handle closing dialog - MEMOIZED
  const handleCloseDialog = useCallback(() => {
    setShowDataSourceDialog(false);
  }, []);

  // Menu handlers - MEMOIZED
  const handleNewProduct = useCallback(() => {
    if (mainContentRef.current?.handleNewProduct) {
      mainContentRef.current.handleNewProduct();
      setActiveMenu(null);
    }
  }, []);

  const handleSaveAll = useCallback(async () => {
    if (mainContentRef.current?.handleSave) {
      await mainContentRef.current.handleSave();
      setActiveMenu(null);
    }
  }, []);

  const handleExport = useCallback(() => {
    if (mainContentRef.current?.handleExport) {
      mainContentRef.current.handleExport();
      setActiveMenu(null);
    }
  }, []);

  const handleBrowseDataSource = useCallback(() => {
    setShowDataSourceDialog(true);
    setActiveMenu(null);
  }, []);

  const handleOpenSettings = useCallback(() => {
    setShowSettingsPanel(true);
    setActiveMenu(null);
  }, []);

  const handleQuit = useCallback(() => {
    if (window.confirm('Are you sure you want to quit?')) {
      window.close();
    }
    setActiveMenu(null);
  }, []);

  const handleDeleteProduct = () => {
    if (mainContentRef.current?.handleDeleteShortcut) {
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

  const handleBulkApplyDiscount = () => {
    setBulkOperationDialog({ isOpen: true, type: 'applyDiscount' });
    setActiveMenu(null);
  };

  const handleBulkMakeNew = () => {
    setBulkOperationDialog({ isOpen: true, type: 'makeNew' });
    setActiveMenu(null);
  };

  const handleBulkDeleteProducts = () => {
    setBulkOperationDialog({ isOpen: true, type: 'deleteProducts' });
    setActiveMenu(null);
  };

  const handleBulkOperationConfirm = async (selectedProductIds, discountPercentage) => {
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
        case 'applyDiscount':
          dispatch(bulkApplyDiscount({ productIds: selectedProductIds, percentage: discountPercentage }));
          const updatedProducts3 = products.map(product => {
            if (selectedProductIds.includes(product.id)) {
              const discountAmount = product.price * (discountPercentage / 100);
              const discountedPrice = product.price - discountAmount;
              return { 
                ...product, 
                discount: true, 
                discountedPrice: parseFloat(discountedPrice.toFixed(2))
              };
            }
            return product;
          });
          await dispatch(saveProducts(updatedProducts3)).unwrap();
          showSuccess(`Successfully applied ${discountPercentage}% discount to ${selectedProductIds.length} product(s)`);
          break;
        case 'makeNew':
          dispatch(bulkMakeNew(selectedProductIds));
          const updatedProducts4 = products.map(product => {
            if (selectedProductIds.includes(product.id)) {
              return { ...product, isNew: true };
            }
            return product;
          });
          await dispatch(saveProducts(updatedProducts4)).unwrap();
          showSuccess(`Successfully marked ${selectedProductIds.length} product(s) as "New"`);
          break;
        case 'deleteProducts':
          dispatch(bulkDeleteProducts(selectedProductIds));
          const updatedProducts5 = products.filter(product => !selectedProductIds.includes(product.id));
          await dispatch(saveProducts(updatedProducts5)).unwrap();
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
      
      {/* Welcome Screen - First Time Users */}
      {showWelcomeScreen && (
        <WelcomeScreen onGetStarted={handleWelcomeComplete} />
      )}
      
      {/* Data Source Not Found Dialog */}
      {showDataSourceDialog && !showWelcomeScreen && (
        <DataSourceNotFoundDialog
          onCreateNew={handleCreateNewFile}
          onBrowseExisting={handleBrowseForExisting}
          onClose={handleCloseDialog}
        />
      )}
      
      {/* Bulk Operations Dialog - Lazy Loaded */}
      <Suspense fallback={<div />}>
        <BulkOperationsDialog
          isOpen={bulkOperationDialog.isOpen}
          onClose={() => setBulkOperationDialog({ isOpen: false, type: null })}
          products={products}
          operationType={bulkOperationDialog.type}
          onConfirm={handleBulkOperationConfirm}
        />
      </Suspense>
      
      <header className="app-header">
        <div className="app-title">
          <h1>Sakr Store Manager</h1>
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
              <div className="menu-option" onClick={handleBulkApplyDiscount}>
                <span>Bulk Apply Discount</span>
              </div>
              <div className="menu-option" onClick={handleBulkRemoveDiscount}>
                <span>Bulk Remove Discount</span>
              </div>
              <div className="menu-divider"></div>
              <div className="menu-option" onClick={handleBulkMakeNew}>
                <span>Bulk Make New</span>
              </div>
              <div className="menu-option" onClick={handleBulkRemoveNewBadge}>
                <span>Bulk Remove New Badge</span>
              </div>
              <div className="menu-divider"></div>
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
        {/* Breadcrumbs */}
        <Breadcrumbs 
          path={[
            { 
              label: 'Products', 
              icon: <Package size={14} />,
              onClick: () => setSelectedCategory('all')
            },
            selectedCategory !== 'all' && {
              label: selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1),
              icon: null
            }
          ].filter(Boolean)}
        />
        
        <div className="app-body-content">
          <Sidebar 
            selectedCategory={selectedCategory}
            onCategorySelect={setSelectedCategory}
          />
          <MainContent 
            ref={mainContentRef}
            selectedCategory={selectedCategory}
            activeFilters={activeFilters}
            onFilterToggle={(filterId) => {
              setActiveFilters(prev => 
                prev.includes(filterId) 
                  ? prev.filter(id => id !== filterId)
                  : [...prev, filterId]
              );
            }}
          />
        </div>
      </div>

      {/* Settings Panel - Slide-out */}
      <SettingsPanel 
        isOpen={showSettingsPanel}
        onClose={() => setShowSettingsPanel(false)}
      />

      {/* Floating Action Buttons */}
      <FloatingActionButtons
        onNewProduct={handleNewProduct}
        onSave={handleSaveAll}
        onExport={handleExport}
      />

      {/* Command Palette */}
      <CommandPalette
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        commands={[
          {
            id: 'new-product',
            label: 'New Product',
            icon: <Plus size={16} />,
            shortcut: 'Ctrl+N',
            category: 'Product',
            keywords: ['add', 'create', 'new', 'product'],
            action: handleNewProduct
          },
          {
            id: 'save',
            label: 'Save All Changes',
            icon: <Save size={16} />,
            shortcut: 'Ctrl+S',
            category: 'File',
            keywords: ['save', 'write', 'persist'],
            action: handleSaveAll
          },
          {
            id: 'export',
            label: 'Export Products',
            icon: <Upload size={16} />,
            shortcut: 'Ctrl+E',
            category: 'File',
            keywords: ['export', 'download', 'backup'],
            action: handleExport
          },
          {
            id: 'settings',
            label: 'Open Settings',
            icon: <Settings size={16} />,
            category: 'App',
            keywords: ['settings', 'preferences', 'config', 'configuration'],
            action: handleOpenSettings
          },
          {
            id: 'github-publish',
            label: 'Publish to GitHub',
            icon: <Github size={16} />,
            shortcut: 'Ctrl+P',
            category: 'GitHub',
            keywords: ['github', 'publish', 'push', 'upload'],
            action: handlePublishToGitHub
          },
          {
            id: 'shortcuts',
            label: 'Show Keyboard Shortcuts',
            icon: <Keyboard size={16} />,
            shortcut: 'Ctrl+/',
            category: 'Help',
            keywords: ['help', 'shortcuts', 'keyboard', 'hotkeys'],
            action: handleShowShortcuts
          }
        ]}
      />

      <StatusBar />
    </div>
  );
}

export default App;
