# Path Finder - Interactive Route Planning Web Application

## Overview

Path Finder is a web application that allows users to:
- Share their current location
- View an interactive map
- Enter a destination
- See multiple route options between their location and destination
- Select their preferred route

The application uses:
- Leaflet.js for map rendering
- OpenStreetMap for base map tiles
- Leaflet Routing Machine for route calculations and display
- Browser's Geolocation API for user location detection
- OpenStreetMap Nominatim for geocoding (converting place names to coordinates)

## Features

- **Responsive Design**: Works on both desktop and mobile devices
- **Location Sharing**: Easy one-click location sharing
- **Multiple Route Options**: View alternative routes for your journey
- **Route Details**: See distance and estimated travel time for each route
- **Interactive Selection**: Choose between different route options
- **Visual Distinction**: Clearly marked user location and destination
- **Error Handling**: Robust error handling for location services and routing

## Setup and Installation

1. Clone this repository:
   ```
   git clone https://github.com/yourusername/path-finder.git
   ```

2. Navigate to the project directory:
   ```
   cd path-finder
   ```

3. Open `index.html` in your web browser by double-clicking the file or using a local development server.

No build process or dependencies installation is required as the project uses CDN links for all external libraries.

## Usage Instructions

1. When the application loads, you'll see a map centered on a default location.
2. Click the "Share My Location" button to allow the browser to detect your location.
3. Enter your desired destination in the input field.
4. Click "Find Routes" or press Enter.
5. The application will display multiple route options in the sidebar.
6. Click on any route in the list to select it and see it highlighted on the map.

## Browser Compatibility

The application works in all modern browsers that support:
- ECMAScript 6 (ES6)
- Geolocation API
- Fetch API

For best results, use the latest version of Chrome, Firefox, Safari, or Edge.

## Privacy Note

This application only uses your location data for displaying it on the map and calculating routes. Your location information is never stored or sent to any server beyond what's necessary for the routing service to function.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Leaflet](https://leafletjs.com/) - The open-source JavaScript library for interactive maps
- [OpenStreetMap](https://www.openstreetmap.org/) - The free wiki world map
- [Leaflet Routing Machine](https://www.liedman.net/leaflet-routing-machine/) - Routing capabilities for Leaflet
- [Nominatim](https://nominatim.org/) - OpenStreetMap's geocoding service

## Future Improvements

- Save favorite routes
- Traffic information overlay
- Public transportation options
- Elevation profile for routes
- Turn-by-turn navigation instructions 