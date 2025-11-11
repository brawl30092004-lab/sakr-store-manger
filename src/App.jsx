import React, { useEffect, useState, useRef, useCallback, lazy, Suspense } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { Minus, Maximize2, X, Home, Package, Plus, Save, Upload, Settings, Github, Keyboard, BarChart3 } from 'lucide-react';
import { loadProducts, bulkRemoveNewBadge, bulkRemoveDiscount, bulkDeleteProducts, bulkApplyDiscount, bulkMakeNew, bulkImprovePricing, saveProducts } from './store/slices/productsSlice';
import { setProjectPath } from './store/slices/settingsSlice';
import { attachKeyboardShortcuts } from './services/keyboardShortcuts';
import { showSuccess, showError } from './services/toastService';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import Dashboard from './components/Dashboard';
import StatusBar from './components/StatusBar';
import SyncStatusIndicator from './components/SyncStatusIndicator';
import DataSourceNotFoundDialog from './components/DataSourceNotFoundDialog';
import SettingsPanel from './components/SettingsPanel';
import Breadcrumbs from './components/Breadcrumbs';
import FloatingActionButtons from './components/FloatingActionButtons';
import CommandPalette from './components/CommandPalette';
import WelcomeScreen from './components/WelcomeScreen';
import ConflictResolutionDialog from './components/ConflictResolutionDialog';
import useConflictHandler from './hooks/useConflictHandler';
import './App.css';

// Lazy load heavy components
const BulkOperationsDialog = lazy(() => import('./components/BulkOperationsDialog'));

function App() {
  const dispatch = useDispatch();
  const { items: products, loading, error } = useSelector((state) => state.products);
  const { projectPath, dataSource } = useSelector((state) => state.settings);
  const [currentView, setCurrentView] = useState('products'); // 'dashboard' or 'products'
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
  
  // Conflict handling hook
  const {
    showConflictDialog,
    isResolving,
    handleConflictResolved,
    handleConflictCancelled,
    checkAndHandleConflict
  } = useConflictHandler(async () => {
    // Callback after conflict resolution - reload products
    dispatch(loadProducts());
    showSuccess('Products reloaded after conflict resolution');
  });

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
      onExport: () => {
        handleExport();
      },
      onPublish: () => {
        handlePublishToGitHub();
      },
      onDashboard: () => {
        setCurrentView('dashboard');
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
      },
      onShowShortcuts: () => {
        setShowShortcutsDialog(prev => !prev);
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

  const handleBulkImprovePricing = () => {
    setBulkOperationDialog({ isOpen: true, type: 'improvePricing' });
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
        case 'improvePricing':
          dispatch(bulkImprovePricing(selectedProductIds));
          // Calculate optimized products to save
          const updatedProducts6 = products.map(product => {
            if (!selectedProductIds.includes(product.id) || product.price <= 0) {
              return product;
            }

            const { price, discountedPrice, discount } = product;
            
            if (!discount) {
              // NON-DISCOUNTED: Apply Charm Pricing
              let newPrice;
              if (price < 1) {
                newPrice = Math.ceil(price * 100 - 1) / 100;
              } else if (price >= 9999) {
                newPrice = 9999.99;
              } else {
                newPrice = Math.ceil(price) - 0.01;
              }
              return { ...product, price: parseFloat(newPrice.toFixed(2)) };
            } else {
              // DISCOUNTED: Apply Anchor + Charm Pricing
              const newPrice = Math.ceil(price);
              let newDiscounted;
              if (discountedPrice < 1) {
                newDiscounted = Math.ceil(discountedPrice * 100 - 1) / 100;
              } else if (discountedPrice >= 9999) {
                newDiscounted = 9999.99;
              } else {
                newDiscounted = Math.ceil(discountedPrice) - 0.01;
              }
              
              if (newDiscounted >= newPrice) {
                const fixedPrice = Math.ceil(price) - 0.01;
                return { 
                  ...product,
                  discount: false, 
                  price: parseFloat(fixedPrice.toFixed(2)),
                  discountedPrice: 0
                };
              }
              
              return {
                ...product,
                price: newPrice,
                discountedPrice: parseFloat(newDiscounted.toFixed(2))
              };
            }
          });
          await dispatch(saveProducts(updatedProducts6)).unwrap();
          showSuccess(`Successfully optimized pricing for ${selectedProductIds.length} product(s)`);
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
          const result = await window.electron.publishToGitHub(message);
          
          // Check if this is a conflict error
          if (checkAndHandleConflict(result, message)) {
            // Conflict detected - dialog will be shown by the hook
            console.log('Merge conflict detected during menu publish');
            setActiveMenu(null);
            return;
          }
          
          if (result.success) {
            showSuccess('Successfully published to GitHub');
          } else {
            showError('Failed to publish: ' + result.message);
          }
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
              <div className="menu-section-label">Product Management</div>
              <div className="menu-option" onClick={handleNewProduct}>
                <span>New Product</span>
                <span className="shortcut">Ctrl+N</span>
              </div>
              <div className="menu-option" onClick={handleSaveAll}>
                <span>Save All</span>
                <span className="shortcut">Ctrl+S</span>
              </div>
              <div className="menu-divider"></div>
              <div className="menu-section-label">Data Operations</div>
              <div className="menu-option" onClick={handleExport}>
                <span>Export...</span>
                <span className="shortcut">Ctrl+E</span>
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
              <div className="menu-section-label">Single Product</div>
              <div className="menu-option" onClick={handleDeleteProduct}>
                <span>Delete Product</span>
                <span className="shortcut">Delete</span>
              </div>
              <div className="menu-divider"></div>
              <div className="menu-section-label">Discount Operations</div>
              <div className="menu-option" onClick={handleBulkApplyDiscount}>
                <span>Bulk Apply Discount</span>
              </div>
              <div className="menu-option" onClick={handleBulkRemoveDiscount}>
                <span>Bulk Remove Discount</span>
              </div>
              <div className="menu-divider"></div>
              <div className="menu-section-label">Badge Operations</div>
              <div className="menu-option" onClick={handleBulkMakeNew}>
                <span>Bulk Mark as "New"</span>
              </div>
              <div className="menu-option" onClick={handleBulkRemoveNewBadge}>
                <span>Bulk Remove "New"</span>
              </div>
              <div className="menu-divider"></div>
              <div className="menu-section-label">Pricing Operations</div>
              <div className="menu-option" onClick={handleBulkImprovePricing}>
                <span>Bulk Improve Pricing</span>
              </div>
              <div className="menu-divider"></div>
              <div className="menu-section-label">Danger Zone</div>
              <div className="menu-option menu-option-danger" onClick={handleBulkDeleteProducts}>
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
              <div className="menu-section-label">Navigation</div>
              <div className="menu-option" onClick={() => { setCurrentView('dashboard'); setActiveMenu(null); }}>
                <span>Dashboard</span>
                <span className="shortcut">Ctrl+D</span>
              </div>
              <div className="menu-option" onClick={() => { setCurrentView('products'); setActiveMenu(null); }}>
                <span>Products</span>
              </div>
              <div className="menu-divider"></div>
              <div className="menu-section-label">Refresh</div>
              <div className="menu-option" onClick={handleReload}>
                <span>Reload</span>
                <span className="shortcut">Ctrl+R</span>
              </div>
              <div className="menu-divider"></div>
              <div className="menu-section-label">Zoom</div>
              <div className="menu-option" onClick={handleZoomIn}>
                <span>Zoom In</span>
                <span className="shortcut">Ctrl++</span>
              </div>
              <div className="menu-option" onClick={handleZoomOut}>
                <span>Zoom Out</span>
                <span className="shortcut">Ctrl+-</span>
              </div>
              <div className="menu-option" onClick={handleActualSize}>
                <span>Actual Size</span>
                <span className="shortcut">Ctrl+0</span>
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
              <div className="menu-section-label">Publishing</div>
              <div className="menu-option" onClick={handlePublishToGitHub}>
                <span>Publish to Store</span>
                <span className="shortcut">Ctrl+P</span>
              </div>
              <div className="menu-divider"></div>
              <div className="menu-section-label">Utilities</div>
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
              <div className="menu-section-label">Quick Access</div>
              <div className="menu-option" onClick={() => { setShowCommandPalette(true); setActiveMenu(null); }}>
                <span>Command Palette</span>
                <span className="shortcut">Ctrl+K</span>
              </div>
              <div className="menu-divider"></div>
              <div className="menu-section-label">Resources</div>
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
                  <span>Save All</span>
                  <kbd>Ctrl+S</kbd>
                </div>
                <div className="shortcut-row">
                  <span>Delete Product</span>
                  <kbd>Delete</kbd>
                </div>
                <div className="shortcut-row">
                  <span>Export Products</span>
                  <kbd>Ctrl+E</kbd>
                </div>
              </div>
              <div className="shortcut-section">
                <h3>Navigation</h3>
                <div className="shortcut-row">
                  <span>Dashboard</span>
                  <kbd>Ctrl+D</kbd>
                </div>
                <div className="shortcut-row">
                  <span>Focus Search</span>
                  <kbd>Ctrl+F</kbd>
                </div>
                <div className="shortcut-row">
                  <span>Command Palette</span>
                  <kbd>Ctrl+K</kbd>
                </div>
                <div className="shortcut-row">
                  <span>Keyboard Shortcuts</span>
                  <kbd>Ctrl+/</kbd>
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
                  <span>Publish to Store</span>
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
        {/* Breadcrumbs and Sync Status */}
        <div className="app-header-bar">
          <Breadcrumbs 
            path={currentView === 'dashboard' ? [
              { 
                label: 'Dashboard', 
                icon: <BarChart3 size={14} />,
                onClick: () => setCurrentView('dashboard')
              }
            ] : [
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
          
          {/* Sync Status Indicator - Only shows in GitHub mode */}
          <SyncStatusIndicator />
        </div>
        
        <div className="app-body-content">
          {currentView === 'dashboard' ? (
            <Dashboard onNavigateToProducts={() => setCurrentView('products')} />
          ) : (
            <>
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
            </>
          )}
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
          // View Commands
          {
            id: 'dashboard',
            label: 'Show Dashboard',
            icon: <BarChart3 size={16} />,
            shortcut: 'Ctrl+D',
            category: 'View',
            keywords: ['dashboard', 'overview', 'metrics', 'analytics', 'stats'],
            action: () => setCurrentView('dashboard')
          },
          {
            id: 'products',
            label: 'Show Products',
            icon: <Package size={16} />,
            category: 'View',
            keywords: ['products', 'items', 'inventory', 'list'],
            action: () => setCurrentView('products')
          },
          {
            id: 'reload',
            label: 'Reload Products',
            icon: <Upload size={16} />,
            shortcut: 'Ctrl+R',
            category: 'View',
            keywords: ['reload', 'refresh', 'update'],
            action: handleReload
          },
          // Product Management Commands
          {
            id: 'new-product',
            label: 'New Product',
            icon: <Plus size={16} />,
            shortcut: 'Ctrl+N',
            category: 'Product',
            keywords: ['add', 'create', 'new', 'product'],
            action: handleNewProduct
          },
          // File Commands
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
            id: 'browse-data-source',
            label: 'Browse Data Source',
            icon: <Package size={16} />,
            category: 'File',
            keywords: ['browse', 'open', 'data', 'source', 'folder'],
            action: handleBrowseDataSource
          },
          // Edit - Bulk Operations
          {
            id: 'bulk-apply-discount',
            label: 'Bulk Apply Discount',
            icon: <Package size={16} />,
            category: 'Bulk Operations',
            keywords: ['bulk', 'discount', 'apply', 'sale'],
            action: handleBulkApplyDiscount
          },
          {
            id: 'bulk-remove-discount',
            label: 'Bulk Remove Discount',
            icon: <Package size={16} />,
            category: 'Bulk Operations',
            keywords: ['bulk', 'discount', 'remove'],
            action: handleBulkRemoveDiscount
          },
          {
            id: 'bulk-make-new',
            label: 'Bulk Mark as "New"',
            icon: <Package size={16} />,
            category: 'Bulk Operations',
            keywords: ['bulk', 'new', 'badge'],
            action: handleBulkMakeNew
          },
          {
            id: 'bulk-remove-new-badge',
            label: 'Bulk Remove "New"',
            icon: <Package size={16} />,
            category: 'Bulk Operations',
            keywords: ['bulk', 'new', 'badge', 'remove'],
            action: handleBulkRemoveNewBadge
          },
          {
            id: 'bulk-delete',
            label: 'Bulk Delete Products',
            icon: <Package size={16} />,
            category: 'Bulk Operations',
            keywords: ['bulk', 'delete', 'remove', 'multiple'],
            action: handleBulkDeleteProducts
          },
          {
            id: 'bulk-improve-pricing',
            label: 'Bulk Improve Pricing',
            icon: <Package size={16} />,
            category: 'Bulk Operations',
            keywords: ['bulk', 'pricing', 'optimize', 'psychological', 'charm', '99'],
            action: handleBulkImprovePricing
          },
          // Settings & Tools
          {
            id: 'settings',
            label: 'Open Settings',
            icon: <Settings size={16} />,
            category: 'Tools',
            keywords: ['settings', 'preferences', 'config', 'configuration'],
            action: handleOpenSettings
          },
          {
            id: 'github-publish',
            label: 'Publish to Store',
            icon: <Github size={16} />,
            shortcut: 'Ctrl+P',
            category: 'Tools',
            keywords: ['store', 'publish', 'push', 'upload', 'sync'],
            action: handlePublishToGitHub
          },
          {
            id: 'check-updates',
            label: 'Check for Updates',
            icon: <Upload size={16} />,
            category: 'Tools',
            keywords: ['update', 'check', 'version'],
            action: handleCheckUpdates
          },
          {
            id: 'open-data-folder',
            label: 'Open Data Folder',
            icon: <Package size={16} />,
            category: 'Tools',
            keywords: ['open', 'folder', 'data', 'directory'],
            action: handleOpenDataFolder
          },
          // Help Commands
          {
            id: 'shortcuts',
            label: 'Show Keyboard Shortcuts',
            icon: <Keyboard size={16} />,
            shortcut: 'Ctrl+/',
            category: 'Help',
            keywords: ['help', 'shortcuts', 'keyboard', 'hotkeys'],
            action: handleShowShortcuts
          },
          {
            id: 'about',
            label: 'About Application',
            icon: <Package size={16} />,
            category: 'Help',
            keywords: ['about', 'info', 'version'],
            action: handleShowAbout
          }
        ]}
      />

      <ConflictResolutionDialog
        isOpen={showConflictDialog}
        onClose={handleConflictCancelled}
        onResolved={handleConflictResolved}
        isResolving={isResolving}
      />

      <StatusBar />
    </div>
  );
}

export default App;
