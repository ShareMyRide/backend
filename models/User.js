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
    mobileNumber: {
        type: String,
      },
      address: {
        type: String,
      },
     
      // Add any other fields you need
    }, { timestamps: true });
module.exports=mongoose.model("User",userSchema);
