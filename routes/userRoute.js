const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Feedback = require('../models/Feedback');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const auth = require('../Security/auth');
const secretKey = 'project@shareMyRide';

// Submit feedback
router.post('/feedback', auth, async (req, res) => {
    const { rideId, rating, comment, feedbackType, name, telephone, kilometersTravelled, timeSpent } = req.body;
    try {
        const feedback = new Feedback({
            userId: req.user.userId,
            rideId,
            rating,
            comment,
            feedbackType,
            name,
            telephone,
            kilometersTravelled,
            timeSpent
        });
        const savedFeedback = await feedback.save();
        res.status(200).json(savedFeedback);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});