const mongoose = require('mongoose');

const RideSchema = new mongoose.Schema({
    userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: String,
    required: true
  },
  startingPoint: {
    type: String,
    required: true
  },
  endingPoint: {
    type: String,
    required: true
  },
  startCoordinates: {
    type: Object,
    properties: {
      latitude: Number,
      longitude: Number
    }
  },
  endCoordinates: {
    type: Object,
    properties: {
      latitude: Number,
      longitude: Number
    }
  },
  distance: {
    type: String
  },
  routePath: {
    type: Array
  },
  vehicleType: {
    type: String
  },
  vehicleNumber: {
    type: String
  },
  availableSeats: {
    type: Number
  },
  contactNumber: {
    type: String
  },
  beginningTime: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Ride', RideSchema);