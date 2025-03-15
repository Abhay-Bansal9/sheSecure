import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import PathFinder from './pages/PathFinder';
import './App.css';

// Font Awesome for icons - add this to index.html
// <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />

// Private route component
const PrivateRoute = ({ children }) => {
  // Check if user is authenticated
  const isAuthenticated = localStorage.getItem('token') !== null;
  
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Only load scripts if they're not already loaded
    if (document.querySelector('script[src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"]')) {
      setLoading(false);
      return;
    }

    // Load required CSS files
    loadStylesheet('https://unpkg.com/leaflet@1.9.4/dist/leaflet.css');
    loadStylesheet('https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.css');
    loadStylesheet('https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css');
    
    // Load Leaflet JS first
    loadScript('https://unpkg.com/leaflet@1.9.4/dist/leaflet.js')
      .then(() => {
        // Then load routing machine
        return loadScript('https://unpkg.com/leaflet-routing-machine@3.2.12/dist/leaflet-routing-machine.js');
      })
      .then(() => {
        // All scripts loaded
        setLoading(false);
      })
      .catch(error => {
        console.error('Error loading scripts:', error);
        setLoading(false);
      });
    
    // We won't try to remove scripts on unmount as it causes issues
  }, []);
  
  // Helper function to load a script
  const loadScript = (src) => {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  };
  
  // Helper function to load a stylesheet
  const loadStylesheet = (href) => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  };
  
  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading map resources...</p>
      </div>
    );
  }
  
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route 
          path="/pathfinder" 
          element={
            <PrivateRoute>
              <PathFinder />
            </PrivateRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;
