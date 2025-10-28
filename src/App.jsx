import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Sakr Store Manager</h1>
        <p>Welcome to the Product Catalog Management System</p>
        <div className="info">
          <p>Platform: {window.electron?.platform || 'browser'}</p>
          <p>Electron: {window.electron?.versions?.electron || 'N/A'}</p>
          <p>Node: {window.electron?.versions?.node || 'N/A'}</p>
          <p>Chrome: {window.electron?.versions?.chrome || 'N/A'}</p>
        </div>
      </header>
    </div>
  );
}

export default App;
