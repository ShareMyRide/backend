const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const feedbackSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    rideId: { type: Schema.Types.ObjectId, ref: 'Ride', required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, required: false },
    feedbackType: { type: String, enum: ['driver', 'passenger'], required: true },
    name: { type: String, required: true },
    date: { type: Date, default: Date.now },
    telephone: { type: String, required: false },
    kilometersTravelled: { type: Number, required: true },
    timeSpent: { type: Number, required: true }, // Time spent in minutes
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Feedback', feedbackSchema);