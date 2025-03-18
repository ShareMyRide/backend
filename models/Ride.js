const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema({
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
  vehicleType: {
    type: String,
    required: false
  },
  vehicleNumber: {
    type: String,
    required: false
  },
  availableSeats: {
    type: String,
    required: false
  },
  contactNumber: {
    type: String,
    required: false
  },
  beginningTime: {
    type: String,
    required: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date
  }
});

const Ride = mongoose.model('Ride', rideSchema);

module.exports = Ride;