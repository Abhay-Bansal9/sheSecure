const express = require('express');
const router = express.Router();
const axios = require('axios');

// @route   GET api/map/geocode
// @desc    Geocode an address to coordinates using OpenStreetMap Nominatim
// @access  Public
router.get('/geocode', async (req, res) => {
  try {
    const { address } = req.query;
    
    if (!address) {
      return res.status(400).json({ msg: 'Address parameter is required' });
    }
    
    // Call OpenStreetMap Nominatim API with proper User-Agent to respect usage policy
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/search`,
      {
        params: {
          q: address,
          format: 'json',
          limit: 1
        },
        headers: {
          'User-Agent': 'She-Secure-App/1.0'
        }
      }
    );
    
    if (response.data.length === 0) {
      return res.status(404).json({ msg: 'Location not found' });
    }
    
    res.json(response.data[0]);
  } catch (error) {
    console.error('Geocoding error:', error);
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
});

// @route   GET api/map/reverse-geocode
// @desc    Reverse geocode coordinates to an address
// @access  Public
router.get('/reverse-geocode', async (req, res) => {
  try {
    const { lat, lon } = req.query;
    
    if (!lat || !lon) {
      return res.status(400).json({ msg: 'Latitude and longitude parameters are required' });
    }
    
    // Call OpenStreetMap Nominatim API
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/reverse`,
      {
        params: {
          lat,
          lon,
          format: 'json'
        },
        headers: {
          'User-Agent': 'She-Secure-App/1.0'
        }
      }
    );
    
    res.json(response.data);
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
});

module.exports = router; 