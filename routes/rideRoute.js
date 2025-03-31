const express = require('express');
const router = express.Router();
const Ride = require('../models/Ride');
const User = require('../models/User'); // Import the User model
const { verifyToken } = require('../Security/auth');

// Apply verifyToken middleware to all routes
router.use(verifyToken);

router.get('/all', async(req, res) => {
    try {
        // Find all rides
        const rides = await Ride.find();
        
        // Create an array to store the enhanced ride objects
        const enhancedRides = [];
        
        // For each ride, find the driver details and add them to the ride object
        for (const ride of rides) {
            // Find the driver information based on userId
            const driver = await User.findById(ride.userId);
            
            // Create a new object with all ride properties
            const enhancedRide = ride.toObject();
            
            // Add driver information if available
            if (driver) {
                enhancedRide.driverName = driver.name || driver.username || 'Unknown';
                enhancedRide.driverContact = driver.contactNumber || ride.contactNumber || 'Not provided';
            } else {
                enhancedRide.driverName = 'Unknown';
                enhancedRide.driverContact = ride.contactNumber || 'Not provided';
            }
            
            enhancedRides.push(enhancedRide);
        }
        
        res.status(200).json(enhancedRides);
    } catch (error) {
        console.error("Error fetching rides:", error);
        res.status(500).json({ message: "Failed to fetch rides", error: error.message });
    }
});

router.get('/user/rides', async(req, res) => {
    try {
        // req.user.id comes from the verifyToken middleware
        const userId = req.user.id;
        
        const rides = await Ride.find({ userId: userId });
        
        // Get user information
        const driver = await User.findById(userId);
        
        // Add driver info to each ride
        const enhancedRides = rides.map(ride => {
            const rideObj = ride.toObject();
            rideObj.driverName = driver ? (driver.name || driver.username || 'Unknown') : 'Unknown';
            rideObj.driverContact = driver ? (driver.contactNumber || ride.contactNumber || 'Not provided') : (ride.contactNumber || 'Not provided');
            return rideObj;
        });
        
        res.status(200).json(enhancedRides);
    } catch(error) {
        console.error("Error fetching user rides:", error);
        res.status(500).json({ message: "Failed to fetch user rides", error: error.message });
    }
});

// The rest of your routes remain the same
router.post('/start', async(req, res) => {
    const {
        date,
        startingPoint,
        endingPoint,
        startCoordinates,
        endCoordinates,
        distance,
        routePath,
        vehicleType,
        vehicleNumber,
        availableSeats,
        contactNumber,
        beginningTime
    } = req.body;
    
    if(!date || !startingPoint || !endingPoint) {
        return res.status(400).send("Please provide required fields");
    }
    
    try {
        // Create the ride with userId from the token
        const result = await Ride.create({
            userId: req.user.id, // This comes from the verifyToken middleware
            date,
            startingPoint,
            endingPoint,
            startCoordinates,
            endCoordinates,
            distance,
            routePath,
            vehicleType,
            vehicleNumber,
            availableSeats,
            contactNumber,
            beginningTime
        });
        
        res.status(201).json(result);
    } catch(error) {
        console.error("Error creating ride:", error);
        res.status(500).json({ message: "Failed to create ride", error: error.message });
    }
});

router.delete('/:id', async(req, res) => {
    const id = req.params.id;
    const ride = await Ride.findById(id);
    
    if(!ride) {
        return res.status(404).send("Ride not found");
    }
    
    // Check if the user is the owner of the ride
    if(ride.userId.toString() !== req.user.id) {
        return res.status(403).json({ message: "Not authorized to delete this ride" });
    }
    
    try {
        const result = await Ride.deleteOne({ _id: id });
        res.status(200).json(result);
    } catch(error) {
        res.status(500).json({ error: error.message });
    }
});

router.put('/:id', async(req, res) => {
    const id = req.params.id;
    const ride = await Ride.findById(id);
    
    if(!ride) {
        return res.status(404).send("Ride not found");
    }
    
    // Check if the user is the owner of the ride
    if(ride.userId.toString() !== req.user.id) {
        return res.status(403).json({ message: "Not authorized to update this ride" });
    }
    
    const {
        date,
        startingPoint,
        endingPoint,
        startCoordinates,
        endCoordinates,
        distance,
        routePath,
        vehicleType,
        vehicleNumber,
        availableSeats,
        contactNumber,
        beginningTime
    } = req.body;
    
    if(!date || !startingPoint || !endingPoint) {
        return res.status(400).send("Please provide required fields");
    }
    
    try {
        const result = await Ride.updateOne(
            { _id: id },
            {
                date,
                startingPoint,
                endingPoint,
                startCoordinates,
                endCoordinates,
                distance,
                routePath,
                vehicleType,
                vehicleNumber,
                availableSeats,
                contactNumber,
                beginningTime
            }
        );
        
        res.status(200).json(result);
    } catch(error) {
        res.status(500).json({ error: error.message });
    }
});

// To get vehicle details with driver information
router.get('/latestByUser/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
      
        const latestRide = await Ride.findOne({ userId })
            .sort({ createdAt: -1 }) // Get the most recent ride
            .limit(1);
      
        if (!latestRide) {
            return res.status(404).json({ message: 'No rides found for this user' });
        }
        
        // Get driver details
        const driver = await User.findById(userId);
        
        // Create enhanced ride object with driver details
        const enhancedRide = latestRide.toObject();
        if (driver) {
            enhancedRide.driverName = driver.name || driver.username || 'Unknown';
            enhancedRide.driverContact = driver.contactNumber || latestRide.contactNumber || 'Not provided';
        } else {
            enhancedRide.driverName = 'Unknown';
            enhancedRide.driverContact = latestRide.contactNumber || 'Not provided';
        }
      
        res.json(enhancedRide);
    } catch (error) {
        console.error('Error fetching latest ride:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;