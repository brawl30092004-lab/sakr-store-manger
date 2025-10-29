import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { exportProducts, validateExportOptions, getExportPreview } from '../services/exportService';
import './ExportDialog.css';

/**
 * ExportDialog Component
 * Allows users to export products to a clean "Exported" folder
 * with organized structure and product name-based folders
 */
function ExportDialog({ isOpen, onClose }) {
  const products = useSelector(state => state.products.items);
  const projectPath = useSelector(state => state.settings.projectPath);
  
  const [includeFormats, setIncludeFormats] = useState(['jpg', 'webp', 'avif']);
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0, message: '' });
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  
  // Get export preview stats
  const preview = getExportPreview(products);
  
  const handleFormatToggle = (format) => {
    setIncludeFormats(prev => {
      if (prev.includes(format)) {
        return prev.filter(f => f !== format);
      } else {
        return [...prev, format];
      }
    });
  };
  
  const handleExport = async () => {
    // Validate options
    const validation = validateExportOptions({ includeFormats });
    if (!validation.valid) {
      setError(validation.errors.join(', '));
      return;
    }
    
    setIsExporting(true);
    setError(null);
    setResult(null);
    
    try {
      const result = await exportProducts(products, projectPath, {
        includeFormats,
        onProgress: (current, total, message) => {
          setProgress({ current, total, message });
        }
      });
      
      setResult(result);
      
    } catch (err) {
      console.error('Export error:', err);
      setError(err.message);
    } finally {
      setIsExporting(false);
    }
  };
  
  const handleClose = () => {
    if (!isExporting) {
      setResult(null);
      setError(null);
      setProgress({ current: 0, total: 0, message: '' });
      onClose();
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content export-dialog" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Export Products</h2>
          <button className="modal-close" onClick={handleClose} disabled={isExporting}>
            ✕
          </button>
        </div>
        
        <div className="modal-body">
          {!result ? (
            <>
              <div className="export-info">
                <h3>Export Preview</h3>
                <div className="export-stats">
                  <div className="stat-item">
                    <span className="stat-label">Products:</span>
                    <span className="stat-value">{preview.totalProducts}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Total Images:</span>
                    <span className="stat-value">{preview.totalImages}</span>
                  </div>
                  {preview.productsWithoutImages > 0 && (
                    <div className="stat-item warning">
                      <span className="stat-label">⚠️ Without Images:</span>
                      <span className="stat-value">{preview.productsWithoutImages}</span>
                    </div>
                  )}
                  <div className="stat-item">
                    <span className="stat-label">Est. Size:</span>
                    <span className="stat-value">~{preview.estimatedSizeMB.toFixed(1)} MB</span>
                  </div>
                </div>
              </div>
              
              <div className="export-section">
                <h3>Export Structure</h3>
                <div className="structure-preview">
                  <pre>{`Exported/
├── products.json
├── export-info.json
└── images/
    ├── classic-black-t-shirt-1/
    │   ├── primary.jpg
    │   ├── primary.webp
    │   ├── primary.avif
    │   └── gallery-1.jpg
    └── modern-coffee-mug-2/
        └── primary.jpg`}</pre>
                </div>
              </div>
              
              <div className="export-section">
                <h3>Image Formats</h3>
                <div className="format-options">
                  <label className="format-checkbox">
                    <input
                      type="checkbox"
                      checked={includeFormats.includes('jpg')}
                      onChange={() => handleFormatToggle('jpg')}
                      disabled={isExporting}
                    />
                    <span>JPG (Universal compatibility)</span>
                  </label>
                  
                  <label className="format-checkbox">
                    <input
                      type="checkbox"
                      checked={includeFormats.includes('webp')}
                      onChange={() => handleFormatToggle('webp')}
                      disabled={isExporting}
                    />
                    <span>WebP (Smaller size, modern browsers)</span>
                  </label>
                  
                  <label className="format-checkbox">
                    <input
                      type="checkbox"
                      checked={includeFormats.includes('avif')}
                      onChange={() => handleFormatToggle('avif')}
                      disabled={isExporting}
                    />
                    <span>AVIF (Best compression, newest format)</span>
                  </label>
                </div>
                
                {includeFormats.length === 0 && (
                  <div className="export-error">
                    ⚠️ Please select at least one format
                  </div>
                )}
              </div>
              
              {isExporting && (
                <div className="export-progress">
                  <div className="progress-text">
                    {progress.message || 'Exporting...'}
                  </div>
                  <div className="progress-bar">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${(progress.current / progress.total) * 100}%` }}
                    ></div>
                  </div>
                  <div className="progress-stats">
                    {progress.current} of {progress.total} products
                  </div>
                </div>
              )}
              
              {error && (
                <div className="export-error">
                  ❌ Export failed: {error}
                </div>
              )}
            </>
          ) : (
            <div className="export-success">
              <div className="success-icon">✅</div>
              <h3>Export Completed!</h3>
              
              <div className="export-stats">
                <div className="stat-item">
                  <span className="stat-label">Products Exported:</span>
                  <span className="stat-value">{result.stats.processedProducts}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Images Copied:</span>
                  <span className="stat-value">{result.stats.copiedImages}</span>
                </div>
                {result.stats.errors.length > 0 && (
                  <div className="stat-item warning">
                    <span className="stat-label">⚠️ Errors:</span>
                    <span className="stat-value">{result.stats.errors.length}</span>
                  </div>
                )}
              </div>
              
              <div className="export-path">
                <strong>Exported to:</strong>
                <code>{result.exportPath}</code>
              </div>
              
              {result.stats.errors.length > 0 && (
                <div className="export-errors">
                  <h4>Errors:</h4>
                  <ul>
                    {result.stats.errors.map((err, i) => (
                      <li key={i}>
                        {err.productName} (ID: {err.productId}): {err.error}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className="modal-footer">
          {!result ? (
            <>
              <button 
                className="btn btn-secondary" 
                onClick={handleClose}
                disabled={isExporting}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary" 
                onClick={handleExport}
                disabled={isExporting || includeFormats.length === 0}
              >
                {isExporting ? 'Exporting...' : 'Export Products'}
              </button>
            </>
          ) : (
            <button 
              className="btn btn-primary" 
              onClick={handleClose}
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ExportDialog;
