import React from 'react';
import { X, Download, ExternalLink, AlertCircle } from 'lucide-react';
import './GitInstallDialog.css';

/**
 * GitInstallDialog Component
 * 
 * Displays instructions for installing Git on the user's system
 * Shows platform-specific download links and installation steps
 */
const GitInstallDialog = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  // Detect user's platform
  const platform = window.navigator.platform.toLowerCase();
  const isWindows = platform.includes('win');
  const isMac = platform.includes('mac');
  const isLinux = platform.includes('linux');

  return (
    <div className="git-install-overlay">
      <div className="git-install-dialog">
        {/* Header */}
        <div className="git-install-header">
          <div className="git-install-header-content">
            <div className="git-install-icon">
              <AlertCircle />
            </div>
            <h2 className="git-install-title">Git Installation Required</h2>
          </div>
          <button
            onClick={onClose}
            className="git-install-close"
            aria-label="Close dialog"
          >
            <X />
          </button>
        </div>

        {/* Content */}
        <div className="git-install-content">
          {/* Why Git is needed */}
          <div className="git-install-info">
            <h3 className="git-install-info-title">Why do I need Git?</h3>
            <p className="git-install-info-text">
              Git is required to sync your product data with GitHub. The app uses Git to clone repositories, 
              track changes, and publish updates to your GitHub account. It's a one-time installation.
            </p>
          </div>

          {/* Installation Instructions */}
          <div className="git-install-section">
            <h3 className="git-install-section-title">Installation Instructions</h3>

            {/* Windows */}
            {isWindows && (
              <div className="git-install-platform">
                <div className="git-install-platform-header">
                  <Download />
                  <h4 className="git-install-platform-name">Windows</h4>
                </div>
                <ol className="git-install-steps">
                  <li>Download Git for Windows from the official website</li>
                  <li>Run the installer (accept default settings)</li>
                  <li>Restart this application after installation</li>
                  <li>Git will be automatically detected</li>
                </ol>
                <a
                  href="https://git-scm.com/download/win"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="git-install-download-btn"
                >
                  <Download />
                  Download Git for Windows
                  <ExternalLink />
                </a>
              </div>
            )}

            {/* macOS */}
            {isMac && (
              <div className="git-install-platform">
                <div className="git-install-platform-header">
                  <Download />
                  <h4 className="git-install-platform-name">macOS</h4>
                </div>
                <div className="git-install-option">
                  <p className="git-install-option-title">Option 1: Using Homebrew (Recommended)</p>
                  <div className="git-install-code">
                    brew install git
                  </div>
                </div>
                <div className="git-install-option">
                  <p className="git-install-option-title">Option 2: Download Installer</p>
                  <a
                    href="https://git-scm.com/download/mac"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="git-install-download-btn"
                  >
                    <Download />
                    Download Git for macOS
                    <ExternalLink />
                  </a>
                </div>
              </div>
            )}

            {/* Linux */}
            {isLinux && (
              <div className="git-install-platform">
                <div className="git-install-platform-header">
                  <Download />
                  <h4 className="git-install-platform-name">Linux</h4>
                </div>
                <div className="git-install-option">
                  <p className="git-install-option-title">Ubuntu/Debian:</p>
                  <div className="git-install-code">
                    sudo apt-get update<br />
                    sudo apt-get install git
                  </div>
                </div>
                <div className="git-install-option">
                  <p className="git-install-option-title">Fedora:</p>
                  <div className="git-install-code">
                    sudo dnf install git
                  </div>
                </div>
                <div className="git-install-option">
                  <p className="git-install-option-title">Arch Linux:</p>
                  <div className="git-install-code">
                    sudo pacman -S git
                  </div>
                </div>
              </div>
            )}

            {/* Generic instructions for unknown platforms */}
            {!isWindows && !isMac && !isLinux && (
              <div className="git-install-platform">
                <div className="git-install-platform-header">
                  <Download />
                  <h4 className="git-install-platform-name">Download Git</h4>
                </div>
                <p className="git-install-info-text" style={{ marginBottom: '1rem' }}>
                  Visit the official Git website to download the appropriate version for your operating system.
                </p>
                <a
                  href="https://git-scm.com/downloads"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="git-install-download-btn"
                >
                  <Download />
                  Visit Git Downloads Page
                  <ExternalLink />
                </a>
              </div>
            )}
          </div>

          {/* Verification Steps */}
          <div className="git-install-verify">
            <h4 className="git-install-verify-title">After Installation</h4>
            <ol className="git-install-verify-steps">
              <li>Close and restart this application</li>
              <li>The app will automatically detect Git</li>
              <li>You can then configure your GitHub settings</li>
            </ol>
            <p className="git-install-verify-note">
              <strong>Note:</strong> If Git is still not detected after installation, you may need to restart your computer 
              or manually add Git to your system PATH.
            </p>
          </div>

          {/* Help Link */}
          <div className="git-install-help">
            <a
              href="https://git-scm.com/book/en/v2/Getting-Started-Installing-Git"
              target="_blank"
              rel="noopener noreferrer"
              className="git-install-help-link"
            >
              Need more help? View detailed installation guide
              <ExternalLink />
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="git-install-footer">
          <button
            onClick={onClose}
            className="git-install-footer-btn"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};

export default GitInstallDialog;
