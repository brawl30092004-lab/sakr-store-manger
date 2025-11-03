import React from 'react';
import { Package, Image, Github, Zap, Shield, FolderOpen } from 'lucide-react';
import './WelcomeScreen.css';

/**
 * WelcomeScreen Component
 * Displays a welcome screen for first-time users explaining the app's purpose
 */
function WelcomeScreen({ onGetStarted }) {
  return (
    <div className="welcome-overlay">
      <div className="welcome-container">
        <div className="welcome-header">
          <div className="welcome-icon">
            <Package size={48} />
          </div>
          <h1>Welcome to Sakr Store Manager</h1>
          <p className="welcome-subtitle">
            A powerful desktop application for managing your product catalog with Git integration
          </p>
        </div>

        <div className="welcome-content">
          <div className="welcome-section">
            <h2>What You Can Do</h2>
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">
                  <Package size={24} />
                </div>
                <h3>Manage Products</h3>
                <p>Create, edit, and organize your product catalog with an intuitive interface</p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">
                  <Image size={24} />
                </div>
                <h3>Handle Images</h3>
                <p>Upload, crop, and manage product images with built-in image processing tools</p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">
                  <Github size={24} />
                </div>
                <h3>Git Integration</h3>
                <p>Sync your product data to GitHub for backup and version control</p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">
                  <Zap size={24} />
                </div>
                <h3>Bulk Operations</h3>
                <p>Apply discounts, badges, and other changes to multiple products at once</p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">
                  <Shield size={24} />
                </div>
                <h3>Auto-Save</h3>
                <p>Never lose your work with automatic draft saving and recovery</p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">
                  <FolderOpen size={24} />
                </div>
                <h3>Local Storage</h3>
                <p>All data is stored locally on your computer for privacy and control</p>
              </div>
            </div>
          </div>

          <div className="welcome-section getting-started">
            <h2>Getting Started</h2>
            <ol className="getting-started-steps">
              <li>
                <strong>Set up your workspace:</strong> Choose where to store your product data
              </li>
              <li>
                <strong>Add products:</strong> Create your first product using the "New Product" button
              </li>
              <li>
                <strong>Customize:</strong> Add images, descriptions, prices, and categories
              </li>
              <li>
                <strong>(Optional) Connect GitHub:</strong> Sync your data for backup and collaboration
              </li>
            </ol>
          </div>

          <div className="welcome-tips">
            <p className="tip-label">💡 Pro Tip:</p>
            <p>Press <kbd>Ctrl</kbd> + <kbd>/</kbd> anytime to see all keyboard shortcuts!</p>
          </div>
        </div>

        <div className="welcome-footer">
          <button className="welcome-btn-primary" onClick={onGetStarted}>
            Get Started
          </button>
          <p className="welcome-version">Version 1.0.0</p>
        </div>
      </div>
    </div>
  );
}

export default WelcomeScreen;
