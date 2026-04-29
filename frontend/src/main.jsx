import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

// Register Service Worker for caching with update checking
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then(
      (registration) => {
        console.log('Service Worker registered successfully:', registration);
        
        // Check for updates regularly
        setInterval(() => {
          registration.update();
        }, 60000); // Check every 60 seconds
        
        // Listen for Service Worker updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New Service Worker is ready, notify user or reload
              console.log('New Service Worker version available. Reloading...');
              window.location.reload();
            }
          });
        });
      },
      (error) => {
        console.log('Service Worker registration failed:', error);
      }
    );
  });
}
