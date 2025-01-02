const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const auth=require("../Security/auth")
const secretekey='project@shareMyRide';
const {verifyToken}=require("../Security/auth")

router.post("/register", async (req, res) => {
  try {
    //check already an account 
    const existingUser=await User.findOne({NIC:req.body.NIC});
    if(existingUser){
      return res.status(400).json({message:"An Account with this NIC already Exists."})
    }
    // Check password
    if (req.body.password !== req.body.confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);

    
    const newUser = new User({
      firstname: req.body.firstname,
      lastname:req.body.lastname,
      email: req.body.email,
      password: hashedPassword,
      mobileNumber:req.body.mobileNumber,
      NIC:req.body.NIC

     
    });

    
    const user = await newUser.save();
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
      const user = await User.findOne({ email });
      if (!user) return res.status(404).send({ message: 'User not found' });

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) return res.status(400).send({ message: 'Invalid password' });

      const token = jwt.sign({ userId: user._id }, secretekey, { expiresIn: '10h' });
      console.log('Generated Token:', token); 

      res.send({ token, user: { id: user._id, username: user.firstname, email: user.email } });
  } catch (err) {
      console.error("Error during login:", err);
      res.status(500).json({ error: err.message });
  }
});

//edit profile details
router.put("/editProfile/:id",async(req,res)=>{
  try{
   const userId=req.params.id;
   const{firstname,lastname,email,mobileNumber,password,NIC}=req.body;
  
   const updateUser=await User.findByIdAndUpdate(
     userId,
     {
       firstname,
       lastname,
       email,
       mobileNumber,
       password,
       NIC,
      }, 
      {
       new:true,runValidators:true
      }
   );
   if(!updateUser){
     return res.status(404).json({message:"User not found"});
   }
   res.status(200).json({message:"Profile updated successfully",updateUser});
 
  }
  catch(error){
   console.log(error);
   res.status(500).json({message:"An error occured while updating the profile"});
  }
 })

module.exports=router;
