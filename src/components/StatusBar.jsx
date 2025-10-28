import React from 'react';
import './StatusBar.css';

function StatusBar() {
  return (
    <div className="status-bar">
      <div className="status-message">
        <span className="status-indicator ready"></span>
        <span>Ready</span>
      </div>
      <button className="publish-btn" disabled>
        Publish to GitHub
      </button>
    </div>
  );
}

export default StatusBar;
