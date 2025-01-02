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
  const { NIC, password } = req.body;
  try {
      const user = await User.findOne({ NIC });
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

module.exports=router;
