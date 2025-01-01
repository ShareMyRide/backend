const express = require('express');
const router = express.Router();

router.post('/route', async (req, res) => {
    const { start, end } = req.body;
  
    if (!start || !end) {
      return res.status(400).json({ error: 'Start and end coordinates are required.' });
    }
  
    try {
      
      const response = await axios.get(
        `https://api.openrouteservice.org/v2/directions/driving-car`,
        {
          params: {
            api_key: API_KEY,
            start: `${start[1]},${start[0]}`, // [lng, lat]
            end: `${end[1]},${end[0]}`,       // [lng, lat]
          },
        }
      );
  
      
      res.json(response.data);
    } catch (error) {
      console.error(error.response?.data || error.message);
      res.status(500).json({ error: 'Failed to fetch route data.' });
    }
  });

module.exports=router;