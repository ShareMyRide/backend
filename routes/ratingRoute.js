const router = require("express").Router();
const Rating = require("../models/Rating");
const { verifyToken } = require("../Security/auth");


router.post("/submit", verifyToken, async (req, res) => {
  try {
    const { rating, review, appVersion } = req.body;
    const userId = req.user.id; // fixed from req.user.userId

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    let existingRating = await Rating.findOne({ userId });

    if (existingRating) {
      existingRating.rating = rating;
      existingRating.review = review || existingRating.review;
      existingRating.appVersion = appVersion || existingRating.appVersion;
      existingRating.updatedAt = Date.now();

      await existingRating.save();
      return res.status(200).json({ 
        message: "Rating updated successfully", 
        rating: existingRating 
      });
    }

    const newRating = new Rating({
      userId,
      rating,
      review: review || '',
      appVersion
    });

    await newRating.save();

    return res.status(201).json({ 
      message: "Rating submitted successfully", 
      rating: newRating 
    });
  } catch (error) {
    console.error("Error submitting rating:", error);
    return res.status(500).json({ 
      message: "An error occurred while submitting the rating", 
      error: error.message 
    });
  }
});



router.get("/user", verifyToken, async (req, res) => {
    try {
      const userId = req.user.id; // fixed from req.user.userId
  
      const rating = await Rating.findOne({ userId });
  
      if (!rating) {
        return res.status(404).json({ message: "No rating found for this user" });
      }
  
      return res.status(200).json(rating);
    } catch (error) {
      console.error("Error fetching rating:", error);
      return res.status(500).json({ 
        message: "An error occurred while fetching the rating", 
        error: error.message 
      });
    }
  });

router.get("/all", verifyToken, async (req, res) => {
    try {
      const ratings = await Rating.find().populate('userId', 'firstname lastname email');
  
      return res.status(200).json({
        count: ratings.length,
        ratings
      });
    } catch (error) {
      console.error("Error fetching ratings:", error);
      return res.status(500).json({ 
        message: "An error occurred while fetching ratings", 
        error: error.message 
      });
    }
  });



  
  router.get("/stats", async (req, res) => {
    try {
      const stats = await Rating.aggregate([
        {
          $group: {
            _id: null,
            averageRating: { $avg: "$rating" },
            totalRatings: { $sum: 1 },
            fiveStars: { $sum: { $cond: [{ $eq: ["$rating", 5] }, 1, 0] } },
            fourStars: { $sum: { $cond: [{ $eq: ["$rating", 4] }, 1, 0] } },
            threeStars: { $sum: { $cond: [{ $eq: ["$rating", 3] }, 1, 0] } },
            twoStars: { $sum: { $cond: [{ $eq: ["$rating", 2] }, 1, 0] } },
            oneStars: { $sum: { $cond: [{ $eq: ["$rating", 1] }, 1, 0] } }
          }
        },
        {
          $project: {
            _id: 0,
            averageRating: { $round: ["$averageRating", 2] },
            totalRatings: 1,
            fiveStars: 1,
            fourStars: 1,
            threeStars: 1,
            twoStars: 1,
            oneStars: 1
          }
        }
      ]);
  
      return res.status(200).json(stats[0] || {
        averageRating: 0,
        totalRatings: 0,
        fiveStars: 0,
        fourStars: 0,
        threeStars: 0,
        twoStars: 0,
        oneStars: 0
      });
    } catch (error) {
      console.error("Error fetching rating statistics:", error);
      return res.status(500).json({ 
        message: "An error occurred while fetching rating statistics", 
        error: error.message 
      });
    }
  });
  

module.exports = router;