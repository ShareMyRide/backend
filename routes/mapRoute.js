const express = require('express');
const axios = require('axios');
const router = express.Router();

const API_KEY = AIzaSyAiQ_WJER_3HDCs0B6tH01WPTCzB1COSLA;  // Google Maps API Key

// POST route to fetch route directions
router.post('/route', async (req, res) => {
    const { start, end } = req.body;

    if (!start || !end) {
        return res.status(400).json({ error: 'Start and end coordinates are required.' });
    }

    try {
        // Making a request to Google Maps Directions API
        const response = await axios.get('https://maps.googleapis.com/maps/api/directions/json', {
            params: {
                origin: `${start[0]},${start[1]}`, // [lat, lng]
                destination: `${end[0]},${end[1]}`, // [lat, lng]
                key: API_KEY,  // API key for Google Maps
            }
        });

        // Send the route response data back to frontend
        res.json(response.data);
    } catch (error) {
        console.error(error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to fetch route data from Google Maps.' });
    }
});

module.exports = router;
