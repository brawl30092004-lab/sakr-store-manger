/**
 * Error Boundary Component
 * Catches fatal errors in React component tree and displays fallback UI
 */

import React from 'react';
import './ErrorBoundary.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      deleteProjectData: false,
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details to console for debugging
    console.error('Error Boundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo,
    });

    // You can also log the error to an error reporting service here
    // Example: logErrorToService(error, errorInfo);
  }

  handleRestart = () => {
    // Clear the error state and reload the app
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
    
    // Optionally reload the entire app
    window.location.reload();
  };

  handleForceReset = async () => {
    const { deleteProjectData } = this.state;
    
    // Build confirmation message based on what will be deleted
    let confirmMessage = '⚠️ FORCE RESET - This will delete ALL app data!\n\n' +
      'This includes:\n' +
      '• All settings and configurations\n' +
      '• GitHub credentials\n' +
      '• Local data in AppData/Roaming\n' +
      '• Cached files and logs\n';
    
    if (deleteProjectData) {
      confirmMessage += '\n⚠️⚠️⚠️ DANGER: Also deleting YOUR PROJECT DATA:\n' +
        '• products.json (ALL YOUR PRODUCTS)\n' +
        '• All product images\n' +
        '• Entire project folder\n\n' +
        '🚨 THIS CANNOT BE UNDONE! 🚨\n';
    } else {
      confirmMessage += '\nYour project data (products.json, images) will be safe.\n';
    }
    
    confirmMessage += '\nThe app will restart with a clean slate.\n\n' +
      'Are you absolutely sure you want to continue?';

    const confirmed = confirm(confirmMessage);

    if (!confirmed) {
      return;
    }

    try {
      // Get project path from localStorage if available
      const projectPath = localStorage.getItem('projectPath');
      
      // Call the force reset IPC handler with options
      const result = await window.electron.forceReset({
        includeProjectData: deleteProjectData,
        projectPath: deleteProjectData ? projectPath : null
      });
      
      if (!result.success) {
        alert('Failed to reset app data: ' + (result.error || 'Unknown error'));
      }
      // If successful, the app will quit and relaunch automatically
    } catch (error) {
      console.error('Error during force reset:', error);
      alert('Failed to reset app data. Please try manually deleting the AppData folder.');
    }
  };

  handleReport = () => {
    // Prepare error report
    const { error, errorInfo } = this.state;
    const errorReport = {
      message: error?.message || 'Unknown error',
      stack: error?.stack || 'No stack trace',
      componentStack: errorInfo?.componentStack || 'No component stack',
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
    };

    // Copy to clipboard
    navigator.clipboard.writeText(JSON.stringify(errorReport, null, 2))
      .then(() => {
        alert('Error details copied to clipboard. You can paste this information when reporting the issue.');
      })
      .catch(() => {
        // Fallback: show error details in console
        console.error('Error Report:', errorReport);
        alert('Error details have been logged to the console. Please open DevTools (F12) to view them.');
      });
  };

  render() {
    if (this.state.hasError) {
      // Render fallback UI
      return (
        <div className="error-boundary">
          <div className="error-boundary-content">
            <div className="error-icon">⚠️</div>
            <h1>Something went wrong</h1>
            <p className="error-message">
              The application encountered an unexpected error and needs to restart.
            </p>
            
            {this.state.error && (
              <details className="error-details">
                <summary>Technical Details</summary>
                <div className="error-stack">
                  <p><strong>Error:</strong> {this.state.error.message}</p>
                  {this.state.error.stack && (
                    <pre>{this.state.error.stack}</pre>
                  )}
                  {this.state.errorInfo?.componentStack && (
                    <>
                      <p><strong>Component Stack:</strong></p>
                      <pre>{this.state.errorInfo.componentStack}</pre>
                    </>
                  )}
                </div>
              </details>
            )}

            <div className="error-actions">
              <button 
                className="btn-restart" 
                onClick={this.handleRestart}
              >
                Restart Application
              </button>
              <button 
                className="btn-report" 
                onClick={this.handleReport}
              >
                Copy Error Details
              </button>
            </div>

            <p className="error-help">
              If this problem persists, please report it with the error details.
            </p>

            <div className="error-force-reset">
              <details className="force-reset-details">
                <summary>⚠️ Crash persists? Try Force Reset</summary>
                <div className="force-reset-content">
                  <p className="force-reset-warning">
                    <strong>Force Reset</strong> will delete all app data and start fresh:
                  </p>
                  <ul className="force-reset-list">
                    <li>All settings and configurations</li>
                    <li>GitHub credentials</li>
                    <li>Cached data in AppData/Roaming</li>
                    <li>Logs and temporary files</li>
                  </ul>
                  <p className="force-reset-note">
                    <strong>Note:</strong> By default, your product files (products.json, images) will be safe. 
                    Only the app's configuration and cached data will be removed.
                  </p>
                  
                  <div className="force-reset-danger-zone">
                    <label className="force-reset-checkbox">
                      <input 
                        type="checkbox" 
                        checked={this.state.deleteProjectData}
                        onChange={(e) => this.setState({ deleteProjectData: e.target.checked })}
                      />
                      <span className="checkbox-text">
                        <strong>🚨 Also delete ALL project data</strong>
                        <small>
                          This will permanently delete:
                          • products.json (all products)
                          • All product images
                          • Entire project folder
                          <br/>
                          <em>⚠️ THIS CANNOT BE UNDONE!</em>
                        </small>
                      </span>
                    </label>
                  </div>
                  
                  <button 
                    className="btn-force-reset" 
                    onClick={this.handleForceReset}
                  >
                    {this.state.deleteProjectData 
                      ? '🚨 Delete EVERYTHING & Reset' 
                      : '⚠️ Force Reset App Data'}
                  </button>
                </div>
              </details>
            </div>
          </div>
        </div>
      );
    }

    // No error, render children normally
    return this.props.children;
  }
}

export default ErrorBoundary;
