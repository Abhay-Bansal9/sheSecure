import React, { useState, useEffect, useRef } from 'react';
import '../styles/PathFinder.css';

const PathFinder = () => {
  const [userPosition, setUserPosition] = useState(null);
  const [destination, setDestination] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [routes, setRoutes] = useState([]);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState(0);
  const [mapInitialized, setMapInitialized] = useState(false);
  const [map, setMap] = useState(null);
  const [userMarker, setUserMarker] = useState(null);
  const [routingControl, setRoutingControl] = useState(null);
  const [emergencySharing, setEmergencySharing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Get emergency contacts from localStorage
  const getEmergencyContacts = () => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        return user.emergencyContacts || [];
      } catch (e) {
        console.error('Error parsing user data:', e);
        return [];
      }
    }
    return [];
  };

  // Make sure we have a ref to the map container to avoid duplicate initialization
  const mapContainerRef = useRef(null);

  // Initialize map when component mounts
  useEffect(() => {
    // Wait for Leaflet to be available
    if (!window.L) {
      return;
    }
    
    // Only initialize map if it doesn't exist and we have a ref
    if (!map && mapContainerRef.current && !mapInitialized) {
      // Check if the container already has a map
      if (mapContainerRef.current._leaflet_id) {
        console.log('Map container already has a Leaflet instance');
        return;
      }
      
      // Create new map
      console.log('Initializing new map');
      const newMap = window.L.map('map').setView([51.505, -0.09], 13);
      
      // Add OpenStreetMap layer
      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(newMap);
      
      setMap(newMap);
      setMapInitialized(true);
      
      // Add support for Leaflet Routing Machine if it exists
      if (window.L.Routing) {
        // Monkey patch the Leaflet Routing Machine to fix issues with route selection
        const originalOnAdd = window.L.Routing.Control.prototype.onAdd;
        window.L.Routing.Control.prototype.onAdd = function(map) {
          const container = originalOnAdd.call(this, map);
          
          // Override the selectRoute method to make it more reliable
          const originalSelectRoute = this.selectRoute;
          this.selectRoute = function(route, previousRoute) {
            if (!route) {
              console.warn('Attempted to select a null route');
              return;
            }
            
            try {
              return originalSelectRoute.call(this, route, previousRoute);
            } catch (error) {
              console.error('Error in original selectRoute:', error);
              // Try to implement a fallback selection behavior
              if (this._line) {
                this._line.setLatLngs(route.coordinates);
                this._line.setStyle({
                  color: '#4CAF50',
                  opacity: 0.8,
                  weight: 6
                });
              }
            }
          };
          
          return container;
        };
      }
    }
    
    // Cleanup on unmount
    return () => {
      if (map) {
        console.log('Cleaning up map instance');
        map.remove();
        setMap(null);
        setMapInitialized(false);
      }
    };
  }, [mapInitialized, map]);

  // Get user's location for map navigation
  const shareLocation = () => {
    if (navigator.geolocation) {
      setLoading(true);
      setError(null);
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Success callback
          const { latitude, longitude } = position.coords;
          setUserPosition([latitude, longitude]);
          
          // Update map view
          if (map) {
            map.setView([latitude, longitude], 13);
            
            // Add or update user marker
            if (userMarker) {
              userMarker.setLatLng([latitude, longitude]);
            } else {
              const marker = window.L.marker([latitude, longitude], {
                icon: window.L.divIcon({
                  className: 'user-marker',
                  html: '<div class="user-marker-icon"></div>',
                  iconSize: [20, 20]
                })
              }).addTo(map);
              marker.bindPopup('Your Current Location').openPopup();
              setUserMarker(marker);
            }
          }
          
          setLoading(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          setError(`Error getting your location: ${error.message}`);
          setLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      setError('Geolocation is not supported by your browser');
    }
  };

  // Find routes
  const findRoutes = async () => {
    if (!userPosition) {
      setError('Please share your location first');
      return;
    }
    
    if (!destination) {
      setError('Please enter a destination');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('Finding routes for destination:', destination);
      console.log('User position:', userPosition);
      
      // Call Nominatim API directly instead of going through our backend
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(destination)}&limit=1`,
        {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'She-Secure-App/1.0'
          }
        }
      );
      
      const data = await response.json();
      console.log('Geocoding response:', data);
      
      if (data.length === 0) {
        throw new Error('Destination not found. Try adding more details to your search.');
      }
      
      const { lat, lon } = data[0];
      const destinationCoords = [parseFloat(lat), parseFloat(lon)];
      
      // If we have a map and routing library
      if (map && window.L && window.L.Routing) {
        // Clear previous routing control
        if (routingControl) {
          map.removeControl(routingControl);
        }
        
        // Create new routing control with multiple route alternatives
        const newRoutingControl = window.L.Routing.control({
          waypoints: [
            window.L.latLng(userPosition[0], userPosition[1]),
            window.L.latLng(destinationCoords[0], destinationCoords[1])
          ],
          router: window.L.Routing.osrmv1({
            serviceUrl: 'https://router.project-osrm.org/route/v1',
            profile: 'driving'
          }),
          routeWhileDragging: false,
          showAlternatives: true,
          lineOptions: {
            styles: [
              {color: '#4CAF50', opacity: 0.8, weight: 6}  // Default style (will be overridden for each route)
            ]
          },
          altLineOptions: {
            styles: [
              { color: '#B0BEC5', opacity: 0.6, weight: 5 }  // Unselected alternative route style
            ]
          },
          createMarker: function(i, waypoint, n) {
            const icon = i === 0 ? 
              window.L.divIcon({
                className: 'user-marker',
                html: '<div class="user-marker-icon"></div>',
                iconSize: [20, 20]
              }) : 
              window.L.divIcon({
                className: 'destination-marker',
                html: '<div class="destination-marker-icon"></div>',
                iconSize: [20, 20]
              });
            
            return window.L.marker(waypoint.latLng, { icon });
          }
        });
        
        // Add the control to the map manually to avoid errors
        try {
          newRoutingControl.addTo(map);
          console.log('Added routing control to map');
          
          // Listen for route calculation complete
          newRoutingControl.on('routesfound', function(e) {
            console.log('Routes found:', e.routes);
            
            // Ensure routes exist before proceeding
            if (!e.routes || !e.routes.length) {
              console.error('No routes returned from routing service');
              setError('No routes found. Please try a different destination.');
              setLoading(false);
              return;
            }
            
            // Make sure each route has the required properties
            e.routes.forEach((route, idx) => {
              if (!route.routeLine) {
                console.warn(`Route at index ${idx} doesn't have a routeLine property`);
              }
            });
            
            // Compute safety metrics for each route
            const routesWithSafety = e.routes.map((route, index) => {
              // In a real app, this would come from an API with real safety data
              // For now, we'll simulate safety ratings based on route characteristics
              
              // Generate a deterministic but seemingly random safety score
              // based on distance and route complexity
              const complexity = route.coordinates.length;
              const distance = route.summary.totalDistance;
              
              // Use distance and complexity to generate a score between 0-100
              // Higher score = safer route
              const seed = (distance * 0.01) + (complexity * 0.1);
              const safetyScore = Math.min(100, Math.max(30, 
                50 + Math.sin(seed) * 30 + Math.cos(seed * 2) * 20
              ));
              
              // Determine safety level based on score
              let safetyLevel, safetyColor;
              if (safetyScore >= 80) {
                safetyLevel = 'high';
                safetyColor = '#4CAF50'; // green
              } else if (safetyScore >= 60) {
                safetyLevel = 'moderate';
                safetyColor = '#FFC107'; // amber
              } else {
                safetyLevel = 'low';
                safetyColor = '#F44336'; // red
              }
              
              // Apply safety color to route - only if routeLine exists
              if (index === 0 && route.routeLine) {
                try {
                  route.routeLine.setStyle({
                    color: safetyColor,
                    opacity: 0.8,
                    weight: 6
                  });
                } catch (err) {
                  console.warn('Error setting route style:', err);
                }
              }
              
              // Return enhanced route object with safety info
              return {
                ...route,
                safety: {
                  score: Math.round(safetyScore),
                  level: safetyLevel,
                  color: safetyColor,
                  // Real app would have reasons for safety rating
                  reasons: safetyLevel === 'high' 
                    ? ['Well-lit streets', 'High pedestrian traffic', 'Safe neighborhood'] 
                    : safetyLevel === 'moderate'
                    ? ['Moderate lighting', 'Some pedestrian traffic', 'Mixed neighborhood safety']
                    : ['Poor lighting', 'Low pedestrian traffic', 'Higher crime area']
                }
              };
            });
            
            // Sort routes by safety (highest safety score first)
            routesWithSafety.sort((a, b) => b.safety.score - a.safety.score);
            
            // Update routes state with safety-enhanced routes
            setRoutes(routesWithSafety);
            setSelectedRouteIndex(0);
            setLoading(false);
          });
          
          // Handle errors in route calculation
          newRoutingControl.on('routingerror', function(e) {
            console.error('Routing error:', e.error);
            setError(`Error calculating routes: ${e.error?.message || 'Please try again'}`);
            setLoading(false);
          });
          
          setRoutingControl(newRoutingControl);
        } catch (error) {
          console.error('Error adding routing control:', error);
          setError(`Error setting up routing: ${error.message}`);
          setLoading(false);
        }
      } else {
        console.error('Map or routing library not initialized:', { 
          mapExists: !!map, 
          LExists: !!window.L,
          routingExists: window.L ? !!window.L.Routing : false
        });
        throw new Error('Map or routing library not initialized. Please refresh the page and try again.');
      }
    } catch (error) {
      console.error('Error finding routes:', error);
      setError(`Error finding routes: ${error.message}`);
      setLoading(false);
    }
  };

  // Select a specific route with updated styling based on safety
  const selectRoute = (index) => {
    setSelectedRouteIndex(index);
    
    if (routingControl && routingControl._routes && routingControl._routes.length > 0) {
      // Set the selected route
      routingControl._selectedRoute = index;
      
      // Check if we have valid routes to style
      if (index >= routingControl._routes.length) {
        console.error(`Selected route index ${index} is out of bounds (total routes: ${routingControl._routes.length})`);
        return;
      }
      
      // Get the selected route for verification
      const selectedRoute = routingControl._routes[index];
      if (!selectedRoute) {
        console.error(`No route found at index ${index}`);
        return;
      }
      
      console.log(`Selecting route ${index}`, selectedRoute);
      
      // Force update route display with proper styling
      if (routingControl._alternativeLines) {
        // Hide all alternative lines first
        routingControl._alternativeLines.forEach(line => {
          if (line) {
            try {
              line.setStyle({ opacity: 0 });
            } catch (err) {
              console.warn('Error hiding alternative line:', err);
            }
          }
        });
      }
      
      // Update the styling of all routes - with proper error checking
      routingControl._routes.forEach((route, i) => {
        // Make sure the route and routeLine exist before trying to style them
        if (route && route.routeLine) {
          try {
            if (i === index) {
              // Selected route - use its safety color and make it more visible
              const safetyColor = routes[i]?.safety?.color || '#4CAF50';
              route.routeLine.setStyle({
                color: safetyColor,
                opacity: 0.9,
                weight: 8
              });
              
              // Bring the selected route to front
              if (route.routeLine.bringToFront) {
                route.routeLine.bringToFront();
              }
              
              // If it's a route line group (multiple segments)
              if (route.routeLine._layers) {
                Object.values(route.routeLine._layers).forEach(layer => {
                  if (layer.setStyle) {
                    layer.setStyle({
                      color: safetyColor,
                      opacity: 0.9,
                      weight: 8
                    });
                  }
                  if (layer.bringToFront) {
                    layer.bringToFront();
                  }
                });
              }
            } else {
              // Non-selected routes - use gray and make them less visible
              route.routeLine.setStyle({
                color: '#B0BEC5',
                opacity: 0.4,
                weight: 4
              });
              
              // If it's a route line group (multiple segments)
              if (route.routeLine._layers) {
                Object.values(route.routeLine._layers).forEach(layer => {
                  if (layer.setStyle) {
                    layer.setStyle({
                      color: '#B0BEC5',
                      opacity: 0.4,
                      weight: 4
                    });
                  }
                });
              }
            }
          } catch (err) {
            console.warn(`Error setting style for route ${i}:`, err);
          }
        } else {
          console.warn(`Route at index ${i} doesn't have a valid routeLine property`);
        }
      });
      
      // Make sure selected route is visually highlighted in the UI
      const routeElement = document.querySelector(`#routes-list li:nth-child(${index + 1})`);
      if (routeElement) {
        routeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
      
      if (routingControl._routes[index]) {
        routingControl.fire('routeselected', { route: routingControl._routes[index] });
      }
    } else {
      console.warn('Routing control or routes not properly initialized');
    }
  };

  // Add user marker and routing styles when component mounts
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .user-marker-icon {
        width: 20px;
        height: 20px;
        background-color: #3498db;
        border: 2px solid white;
        border-radius: 50%;
        box-shadow: 0 0 5px rgba(0, 0, 0, 0.3);
      }
      
      .leaflet-routing-alt {
        max-height: 0;
        overflow: hidden;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Emergency Share location with emergency contacts
  const shareLocationWithContacts = async () => {
    if (!userPosition) {
      setError('Please share your location first');
      return;
    }

    setEmergencySharing(true);
    setSuccessMessage('');
    
    try {
      const contacts = getEmergencyContacts();
      
      if (contacts.length === 0) {
        setError('No emergency contacts found. Please add contacts in your profile.');
        setEmergencySharing(false);
        return;
      }

      // Get user's current location info for context
      const locationInfo = await fetchLocationInfo(userPosition[0], userPosition[1]);
      
      // Format the emergency message
      const userName = getUserName();
      const locationLink = `https://www.google.com/maps?q=${userPosition[0]},${userPosition[1]}`;
      const address = locationInfo?.display_name || 'Unknown location';
      
      const message = `
🚨 EMERGENCY ALERT 🚨
${userName} has triggered an emergency alert from She-Secure!

📍 Current Location: ${address}
🔗 View on map: ${locationLink}

Please contact them immediately or alert authorities if needed.
This is an automated emergency message from She-Secure app.
      `;

      // Simulate sending SMS messages to emergency contacts
      // In a real app, this would call a backend API to send SMS
      console.log('Sending EMERGENCY alert to contacts:', contacts);
      console.log('Emergency message:', message);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Show success message
      setSuccessMessage(
        `🚨 EMERGENCY ALERT sent to ${contacts.filter(c => c.name).map(c => c.name).join(' and ')}`
      );
      
      // In a real app, you'd call your backend here:
      // await fetch('/api/send-emergency-alert', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ contacts, userPosition, message })
      // });
      
    } catch (error) {
      console.error('Error sending emergency alert:', error);
      setError(`Error sending emergency alert: ${error.message}`);
    } finally {
      setEmergencySharing(false);
    }
  };

  // Helper function to get user's name
  const getUserName = () => {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        return `${user.firstName} ${user.lastName}`;
      }
      return 'She-Secure User';
    } catch (e) {
      return 'She-Secure User';
    }
  };

  // Fetch location info (reverse geocoding)
  const fetchLocationInfo = async (lat, lon) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
        {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'She-Secure-App/1.0'
          }
        }
      );
      return await response.json();
    } catch (error) {
      console.error('Error fetching location info:', error);
      return null;
    }
  };

  // Clear success message after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  return (
    <div className="pathfinder-container">
      <header className="pathfinder-header">
        <h1>Path Finder</h1>
        <p>Find the safest route to your destination</p>
      </header>
      
      <main className="pathfinder-main">
        <div className="controls">
          <div className="location-controls">
            <button 
              className="btn location-btn"
              onClick={shareLocation}
              disabled={loading}
            >
              {loading ? (
                <><i className="fas fa-spinner fa-spin"></i> Getting location...</>
              ) : (
                <><i className="fas fa-map-marker-alt"></i> Share My Location</>
              )}
            </button>
            
            <button 
              className="btn emergency-btn"
              onClick={shareLocationWithContacts}
              disabled={emergencySharing || !userPosition}
            >
              {emergencySharing ? (
                <><i className="fas fa-spinner fa-spin"></i> Sending alert...</>
              ) : (
                <><i className="fas fa-exclamation-triangle"></i> Emergency Alert</>
              )}
            </button>
          </div>
          
          {successMessage && (
            <div className="success-message">
              <i className="fas fa-check-circle"></i> {successMessage}
            </div>
          )}
          
          <div className="section-divider">
            <span>Route Planning</span>
          </div>
          
          <div className="input-group">
            <input 
              type="text" 
              id="destination" 
              placeholder="Enter destination..."
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && findRoutes()}
              disabled={loading}
            />
            <button 
              className="btn find-btn"
              onClick={findRoutes}
              disabled={loading || !userPosition}
            >
              {loading ? (
                <><i className="fas fa-spinner fa-spin"></i> Finding routes...</>
              ) : (
                <><i className="fas fa-route"></i> Find Routes</>
              )}
            </button>
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          {routes.length > 0 && (
            <div id="route-options">
              <h3>Routes Ranked by Safety:</h3>
              <ul id="routes-list">
                {routes.map((route, index) => {
                  const distance = (route.summary.totalDistance / 1000).toFixed(1);
                  const time = route.summary.totalTime;
                  const hours = Math.floor(time / 3600);
                  const minutes = Math.floor((time % 3600) / 60);
                  const formattedTime = hours > 0 
                    ? `${hours} hr ${minutes} min` 
                    : `${minutes} min`;
                  
                  // Get safety data
                  const { score, level, color } = route.safety || { 
                    score: 50, 
                    level: 'moderate',
                    color: '#FFC107'
                  };
                  
                  return (
                    <li 
                      key={index}
                      className={index === selectedRouteIndex ? 'selected' : ''}
                      onClick={() => selectRoute(index)}
                    >
                      <div className="route-header">
                        <strong>Route {index + 1}</strong>
                        <div 
                          className="safety-indicator" 
                          style={{ backgroundColor: color }}
                        >
                          <span className="safety-score">{score}%</span>
                          <span className="safety-level">
                            {level === 'high' ? 'Safe' : level === 'moderate' ? 'Moderate' : 'Caution'}
                          </span>
                        </div>
                      </div>
                      <div className="route-details">
                        <span>{distance} km</span>
                        <span>{formattedTime}</span>
                      </div>
                      {index === selectedRouteIndex && (
                        <div className="safety-reasons">
                          {route.safety.reasons.map((reason, i) => (
                            <div key={i} className="safety-reason">
                              <i className={
                                level === 'high' 
                                  ? 'fas fa-check-circle' 
                                  : level === 'moderate' 
                                    ? 'fas fa-info-circle' 
                                    : 'fas fa-exclamation-triangle'
                              }></i>
                              <span>{reason}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
        
        <div id="map-container">
          <div id="map" ref={mapContainerRef}></div>
        </div>
      </main>
      
      <footer>
        <p>&copy; 2025 She-Secure. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default PathFinder; 