import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setDataSource } from '../store/slices/settingsSlice';
import './DataSourceSelector.css';

/**
 * DataSourceSelector Component
 * Allows users to choose between local file browsing or GitHub repository
 */
function DataSourceSelector() {
  const dispatch = useDispatch();
  const dataSource = useSelector((state) => state.settings.dataSource);

  const handleSourceChange = (source) => {
    dispatch(setDataSource(source));
  };

  return (
    <div className="data-source-selector">
      <h3>Data Source</h3>
      <p className="selector-description">
        Choose where to load your products.json and images from:
      </p>
      
      <div className="source-options">
        <label className={`source-option ${dataSource === 'local' ? 'active' : ''}`}>
          <input
            type="radio"
            name="dataSource"
            value="local"
            checked={dataSource === 'local'}
            onChange={() => handleSourceChange('local')}
          />
          <div className="option-content">
            <div className="option-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 6H12L10 4H4C2.9 4 2.01 4.9 2.01 6L2 18C2 19.1 2.9 20 4 20H20C21.1 20 22 19.1 22 18V8C22 6.9 21.1 6 20 6Z" fill="currentColor"/>
              </svg>
            </div>
            <div className="option-details">
              <h4>Local Files</h4>
              <p>Browse and select products.json from your local file system</p>
            </div>
          </div>
        </label>

        <label className={`source-option ${dataSource === 'github' ? 'active' : ''}`}>
          <input
            type="radio"
            name="dataSource"
            value="github"
            checked={dataSource === 'github'}
            onChange={() => handleSourceChange('github')}
          />
          <div className="option-content">
            <div className="option-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12C2 16.42 4.865 20.17 8.839 21.49C9.339 21.58 9.521 21.27 9.521 21C9.521 20.77 9.511 20.14 9.511 19.43C7 19.91 6.35 18.83 6.15 18.27C6.037 17.98 5.55 17.2 5.125 16.97C4.775 16.8 4.275 16.32 5.112 16.31C5.9 16.3 6.462 17.04 6.65 17.35C7.55 18.85 8.988 18.42 9.562 18.15C9.65 17.5 9.912 17.06 10.2 16.8C7.975 16.54 5.65 15.67 5.65 11.53C5.65 10.4 6.037 9.47 6.675 8.74C6.575 8.48 6.225 7.45 6.775 6.1C6.775 6.1 7.612 5.83 9.525 7.1C10.325 6.87 11.175 6.755 12.025 6.755C12.875 6.755 13.725 6.87 14.525 7.1C16.437 5.82 17.275 6.1 17.275 6.1C17.825 7.45 17.475 8.48 17.375 8.74C18.012 9.47 18.4 10.39 18.4 11.53C18.4 15.68 16.062 16.54 13.837 16.8C14.2 17.12 14.512 17.73 14.512 18.68C14.512 20.03 14.5 21.12 14.5 21C14.5 21.27 14.687 21.59 15.187 21.49C17.172 20.823 18.8978 19.5364 20.089 17.8214C21.2802 16.1064 21.9336 14.0524 21.9336 12C21.9336 6.477 17.522 2 12 2Z" fill="currentColor"/>
              </svg>
            </div>
            <div className="option-details">
              <h4>GitHub Repository</h4>
              <p>Load products.json from your configured GitHub repository</p>
            </div>
          </div>
        </label>
      </div>

      {dataSource === 'local' && (
        <div className="source-info">
          <strong>Current Mode:</strong> Local file browsing
        </div>
      )}
      
      {dataSource === 'github' && (
        <div className="source-info github-info">
          <strong>GitHub Mode:</strong> Configure your repository settings below to get started. The app will clone your repository locally and sync changes when you publish.
        </div>
      )}
    </div>
  );
}

export default DataSourceSelector;
