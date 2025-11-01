import React from 'react';
import { X, Download, ExternalLink, AlertCircle } from 'lucide-react';

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-orange-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Git Installation Required</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Why Git is needed */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Why do I need Git?</h3>
            <p className="text-sm text-blue-800">
              Git is required to sync your product data with GitHub. The app uses Git to clone repositories, 
              track changes, and publish updates to your GitHub account. It's a one-time installation.
            </p>
          </div>

          {/* Installation Instructions */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Installation Instructions</h3>

            {/* Windows */}
            {isWindows && (
              <div className="border border-gray-200 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Download className="w-5 h-5 text-gray-600" />
                  <h4 className="font-semibold text-gray-900">Windows</h4>
                </div>
                <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 ml-2">
                  <li>Download Git for Windows from the official website</li>
                  <li>Run the installer (accept default settings)</li>
                  <li>Restart this application after installation</li>
                  <li>Git will be automatically detected</li>
                </ol>
                <a
                  href="https://git-scm.com/download/win"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
                >
                  <Download className="w-4 h-4" />
                  Download Git for Windows
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}

            {/* macOS */}
            {isMac && (
              <div className="border border-gray-200 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Download className="w-5 h-5 text-gray-600" />
                  <h4 className="font-semibold text-gray-900">macOS</h4>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-2">Option 1: Using Homebrew (Recommended)</p>
                    <div className="bg-gray-900 rounded p-3 font-mono text-sm text-green-400">
                      brew install git
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-2">Option 2: Download Installer</p>
                    <a
                      href="https://git-scm.com/download/mac"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
                    >
                      <Download className="w-4 h-4" />
                      Download Git for macOS
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              </div>
            )}

            {/* Linux */}
            {isLinux && (
              <div className="border border-gray-200 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Download className="w-5 h-5 text-gray-600" />
                  <h4 className="font-semibold text-gray-900">Linux</h4>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-2">Ubuntu/Debian:</p>
                    <div className="bg-gray-900 rounded p-3 font-mono text-sm text-green-400">
                      sudo apt-get update<br />
                      sudo apt-get install git
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-2">Fedora:</p>
                    <div className="bg-gray-900 rounded p-3 font-mono text-sm text-green-400">
                      sudo dnf install git
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 mb-2">Arch Linux:</p>
                    <div className="bg-gray-900 rounded p-3 font-mono text-sm text-green-400">
                      sudo pacman -S git
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Generic instructions for unknown platforms */}
            {!isWindows && !isMac && !isLinux && (
              <div className="border border-gray-200 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <Download className="w-5 h-5 text-gray-600" />
                  <h4 className="font-semibold text-gray-900">Download Git</h4>
                </div>
                <p className="text-sm text-gray-700">
                  Visit the official Git website to download the appropriate version for your operating system.
                </p>
                <a
                  href="https://git-scm.com/downloads"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
                >
                  <Download className="w-4 h-4" />
                  Visit Git Downloads Page
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
          </div>

          {/* Verification Steps */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
            <h4 className="font-semibold text-gray-900">After Installation</h4>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700 ml-2">
              <li>Close and restart this application</li>
              <li>The app will automatically detect Git</li>
              <li>You can then configure your GitHub settings</li>
            </ol>
            <p className="text-xs text-gray-600 mt-3">
              <strong>Note:</strong> If Git is still not detected after installation, you may need to restart your computer 
              or manually add Git to your system PATH.
            </p>
          </div>

          {/* Help Link */}
          <div className="text-center">
            <a
              href="https://git-scm.com/book/en/v2/Getting-Started-Installing-Git"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-orange-600 hover:text-orange-700 font-medium"
            >
              Need more help? View detailed installation guide
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};

export default GitInstallDialog;
