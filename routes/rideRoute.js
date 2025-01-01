const express = require('express');
const router = express.Router();
const Ride = require('../models/Ride');

router.get('/',async(req,res)=>{
    
    const result = await Ride.find();

    if(result){
        res.status(200).json(result)
    }
    else{
        res.status(404).send("Ride not found")
    }
})

router.get('/:id',async(req,res)=>{
    const id = req.params.id;
    const result = await Ride.findById(id);

    if(result){
        res.status(200).json(result)
    }
    else{
        res.status(404).send("Ride not found")
    }
})

module.exports=router;