const express = require("express");
const { ObjectId } = require("mongodb");
const router = express.Router();
const Ride = require("../models/Ride");
const { verifyToken } = require("../Security/auth");
const Request = require("../models/Request");
const { Mongoose } = require("mongoose");

// Apply verifyToken middleware to all routes
router.use(verifyToken);

router.get("/all", async (req, res) => {
  const result = await Ride.find();
  if (result) {
    res.status(200).json(result);
  } else {
    res.status(404).send("Ride not found");
  }
});

router.get("/user/rides", verifyToken, async (req, res) => {
  try {
    // req.user.id comes from the verifyToken middleware
    const userId = req.user.id;

    const rides = await Ride.find({ userId: userId });

    res.status(200).json(rides);
  } catch (error) {
    console.error("Error fetching user rides:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch user rides", error: error.message });
  }
});

router.post("/start", async (req, res) => {
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
    beginningTime,
  } = req.body;

  if (!date || !startingPoint || !endingPoint) {
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
      beginningTime,
    });

    res.status(201).json(result);
  } catch (error) {
    console.error("Error creating ride:", error);
    res
      .status(500)
      .json({ message: "Failed to create ride", error: error.message });
  }
});

router.delete("/:id", async (req, res) => {
  const id = req.params.id;
  const ride = await Ride.findById(id);

  if (!ride) {
    return res.status(404).send("Ride not found");
  }

  // Check if the user is the owner of the ride
  if (ride.userId.toString() !== req.user.id) {
    return res
      .status(403)
      .json({ message: "Not authorized to delete this ride" });
  }

  try {
    const result = await Ride.deleteOne({ _id: id });
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/:id", async (req, res) => {
  const id = req.params.id;
  const ride = await Ride.findById(id);

  if (!ride) {
    return res.status(404).send("Ride not found");
  }

  // Check if the user is the owner of the ride
  if (ride.userId.toString() !== req.user.id) {
    return res
      .status(403)
      .json({ message: "Not authorized to update this ride" });
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
    beginningTime,
  } = req.body;

  if (!date || !startingPoint || !endingPoint) {
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
        beginningTime,
      }
    );

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//to get vehicle details
router.get("/latestByUser/:userId", verifyToken, async (req, res) => {
  try {
    const userId = req.params.userId;

    const latestRide = await Ride.findOne({ userId })
      .sort({ createdAt: -1 }) // Get the most recent ride
      .limit(1);

    if (!latestRide) {
      return res.status(404).json({ message: "No rides found for this user" });
    }

    res.json(latestRide);
  } catch (error) {
    console.error("Error fetching latest ride:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/request", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      rideId,
      pickupPoint,
      dropoffPoint,
      pickupCoordinates,
      dropoffCoordinates,
    } = req.body;

    if (
      !userId ||
      !rideId ||
      !pickupPoint ||
      !dropoffPoint ||
      !pickupCoordinates.length ||
      !dropoffCoordinates.length
    ) {
      return res.status(400).send("Please provide required fields");
    }

    try {
      // Create the ride with userId from the token
      const result = await Request.create({
        rideId,
        requestById: userId,
        pickupPoint,
        dropoffPoint,
        pickupCoordinates,
        dropoffCoordinates,
      });

      res.status(201).json(result);
    } catch (error) {
      console.error("Error creating request:", error);
      res
        .status(500)
        .json({ message: "Failed to create request", error: error.message });
    }
  } catch (error) {
    console.error("Error create request:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/getRequests", async (req, res) => {
  try {
    const { rideId } = req.body;

    if (!rideId) {
      return res.status(400).send("Please provide required fields");
    }

    try {
      // Create the ride with userId from the token
      const result = await Request.find();
      console.log(result);

      res.status(200).json(result);
    } catch (error) {
      console.error("Error getting request:", error);
      res
        .status(500)
        .json({ message: "Failed to getting request", error: error.message });
    }
  } catch (error) {
    console.error("Error create request:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
