const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const auth=require("../Security/auth")
const secretekey='project@shareMyRide';
const {verifyToken}=require("../Security/auth")

//user registration
router.post("/register", async (req, res) => {
  console.log("Received data:", req.body); 
  try {
    const { firstname, lastname, email, NIC, password, confirmPassword } = req.body;

    if (!firstname || !lastname || !email || !NIC || !password || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    
    const existingUser = await User.findOne({ NIC });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists with this NIC" });
    }

    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      firstname,
      lastname,
      email,
      NIC,
      password: hashedPassword,
    });

    const user = await newUser.save();
    return res.status(200).json({ message: "Registration successful", user });
  } catch (err) {
    console.error("Error during registration:", err);
    return res.status(500).json({ message: err.message || "Internal Server Error" });
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

 

//logout 
router.post('/logout', verifyToken, (req, res) => {
  try {
      res.status(200).json({ message: "Logout successful" });
  } catch (err) {
      res.status(500).json({ message: "An error occurred while logging out", error: err.message });
  }
});

//view user details
router.get("/users/:id", verifyToken, async (req, res) => {
  try {
      const userId = req.params.id;

      
      const user = await User.findById(userId);  

      if (!user) {
          return res.status(404).json({ message: "User not found" });
      }

      res.status(200).json(user);
  } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports=router;
