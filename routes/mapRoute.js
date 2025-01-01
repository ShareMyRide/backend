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

  const fetchRoute = async () => {
    if (!startLocation || !endLocation) {
      Alert.alert('Error', 'Please enter both start and end locations.');
      return;
    }
  
    try {
      const response = await axios.post('http://localhost:3000/route', {
        start: startLocation.split(',').map(Number),
        end: endLocation.split(',').map(Number),
      });
  
      const routeCoordinates = response.data.features[0].geometry.coordinates.map(
        ([longitude, latitude]) => ({ latitude, longitude })
      );
  
      setCoordinates(routeCoordinates);
      setMarkers([
        { latitude: routeCoordinates[0].latitude, longitude: routeCoordinates[0].longitude },
        { latitude: routeCoordinates[routeCoordinates.length - 1].latitude, longitude: routeCoordinates[routeCoordinates.length - 1].longitude },
      ]);
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to fetch the route.');
    }
  };


module.exports=router;