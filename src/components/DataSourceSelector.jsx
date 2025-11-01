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
            <div className="option-icon">📁</div>
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
            <div className="option-icon">🐙</div>
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
