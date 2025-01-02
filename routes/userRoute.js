const express=require('express');
const router =express.Router();
const User=require('../models/User');
const Feedback=require('../models/Feedback');
const bcrypt=require('bcrypt');
const jwt=require('jsonwebtoken');
const auth=require('../Security/auth');
const secretKey='project@shareMyRide';

//submit feedback
router.post('/feedback',auth,async(req,res)=>{
    const{rideId,rating,comment,feedbackType}=req.body;
    try{
        const feedback =new Feedback({
            userId:req.user.userId,
            rideId,
            rating,
            comment,
            feedbackType
        });
const savedFeedback=await feedback.save();
res.status(200).json(savedFeedback);
    }catch(err){
        res.status(500).json({error:error.message});
    }
    });

    //Get Feedback for a specific ride
router.get('/feedback/:rideId',auth,aync(req,res)=> {
  try{
    const feedbacks=await Feedback.find({rideId:req.params.rideId});
    res.status(200).json(feedbacks);

  } 
  catch(error)
  {
    res.status(500).json({error:error.message});

} 
});
module.exports=router;
