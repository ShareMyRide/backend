const express = require('express');
const router = express.Router();
const Ride = require('../models/Ride');

// Get all rides
router.get('/', async (req, res) => {
  try {
    const result = await Ride.find();
    if (result) {
      res.status(200).json(result);
    } else {
      res.status(404).send("No rides found");
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get ride by ID
router.get('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const result = await Ride.findById(id);
    
    if (result) {
      res.status(200).json(result);
    } else {
      res.status(404).send("Ride not found");
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create a new ride
router.post('/start', async (req, res) => {
  try {
    const {
      date,
      startingPoint,
      endingPoint,
      vehicleType,
      vehicleNumber,
      availableSeats,
      contactNumber,
      beginningTime
    } = req.body;
    
    // Validate required fields
    if (!date || !startingPoint || !endingPoint) {
      return res.status(400).json({ error: "Please provide required fields: date, startingPoint, endingPoint" });
    }
    
    // Create new ride with all data
    const newRide = {
      date,
      startingPoint,
      endingPoint,
      vehicleType,
      vehicleNumber,
      availableSeats,
      contactNumber,
      beginningTime,
      createdAt: new Date()
    };
    
    const result = await Ride.create(newRide);
    res.status(201).json(result);
  } catch (error) {
    console.error("Error creating ride:", error);
    res.status(500).json({ error: error.message });
  }
});

// Delete ride by ID
router.delete('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const ride = await Ride.findById(id);
    
    if (!ride) {
      return res.status(404).json({ error: "Ride not found" });
    }
    
    const result = await Ride.deleteOne({ _id: id });
    res.status(200).json({ message: "Ride deleted successfully", result });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update ride by ID
router.put('/:id', async (req, res) => {
  try {
    const id = req.params.id;
    
    // Check if ride exists
    const ride = await Ride.findById(id);
    if (!ride) {
      return res.status(404).json({ error: "Ride not found" });
    }
    
    // Update with new data
    const updateData = {
      date: req.body.date,
      startingPoint: req.body.startingPoint,
      endingPoint: req.body.endingPoint,
      vehicleType: req.body.vehicleType,
      vehicleNumber: req.body.vehicleNumber,
      availableSeats: req.body.availableSeats,
      contactNumber: req.body.contactNumber,
      beginningTime: req.body.beginningTime,
      updatedAt: new Date()
    };
    
    // Only update fields that are provided
    Object.keys(updateData).forEach(key => 
      updateData[key] === undefined && delete updateData[key]
    );
    
    const result = await Ride.findByIdAndUpdate(id, updateData, { new: true });
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;