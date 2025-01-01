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

router.post('/',async(req,res)=>{
    const {date,startingPoint,endingPoint} = req.body;

    if(!date || !startingPoint || !endingPoint){
        res.status(404).send("please provides required fields")

    }
    else{
        try{
            const result = await Ride.create({date,startingPoint,endingPoint});
            res.status(200).json(result)

        }
        catch(error){
            res.status(500).error(error)

        }
    }
})

router.delete('/:id',async(req,res)=>{
    const id = req.params.id;
    const ride = await Ride.findById(id);

    if(!ride){
        res.status(404).send("Ride not found")

    }
    else{
        try{
            const result = await Ride.deleteOne(ride);
            res.status(200).json(result)

        }
        catch(error){
            res.status(500).error(error)

        }
    }

})

router.put('/:id',async(req,res)=>{
    const id = req.params.id;
    const ride = await Ride.findById(id);

    if(!ride){
        res.status(404).send("Ride not found")

    }
    else{
        const {date,startingPoint,endingPoint} = req.body;

        if(!date || !startingPoint || !endingPoint){
            res.status(404).send("please provides required fields")

        }
        else{
            try{
                const result = await ride.updateOne({date,startingPoint,endingPoint});
                res.status(200).json(result)
            }
            catch(error){
                res.status(500).json(error)
    
            }
        }
       
    }

})

module.exports=router;