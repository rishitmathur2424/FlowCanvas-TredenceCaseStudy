import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
// Initialize dark mode before first render (prevents flash)
import './hooks/useDarkMode';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
