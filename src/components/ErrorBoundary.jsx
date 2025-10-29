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
          </div>
        </div>
      );
    }

    // No error, render children normally
    return this.props.children;
  }
}

export default ErrorBoundary;
