const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema({
  rideId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Ride",
    required: true,
  },
  requestById: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  success: {
    type: Boolean,
    required: true,
    default: false,
  },
  pickupPoint: {
    type: String,
    required: true,
  },
  dropoffPoint: {
    type: String,
    required: true,
  },
  pickupCoordinates: {
    type: [String],
    required: true,
  },
  dropoffCoordinates: {
    type: [String],
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Request", requestSchema);
