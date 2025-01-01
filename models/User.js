const mongoose=require("mongoose");

const userSchema=new mongoose.Schema({
    firstname:{
        type:String,
        require:true,
        min:4,
        max:50,
        unique:true 
    },
    lastname:{
        type:String,
        require:true,
        min:4,
        max:50,
    },
    email:{
        type:String,
        require:true,
        max:100,
        unique:true 
    },
    mobileNumber:{
        type:Number,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true,
        min:6,
        max:12,
        unique:true 
    },
   
    NIC:{
        type:String,
        required:true,
        unique:true,
        min:10,
        max:12
    },
});
module.exports=mongoose.model("User",userSchema);
