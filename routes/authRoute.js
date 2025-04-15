const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const { check, validationResult } = require("express-validator"); // Add express-validator

const auth = require("../Security/auth");
const secretekey = "project@shareMyRide";
const { verifyToken, tokenBlacklist } = require("../Security/auth");

// Enhanced user registration with validation
router.post(
  "/register",
  [
    check("firstname")
      .trim()
      .notEmpty()
      .withMessage("First name is required")
      .isLength({ min: 2, max: 50 })
      .withMessage("First name must be between 2 and 50 characters"),

    check("lastname")
      .trim()
      .notEmpty()
      .withMessage("Last name is required")
      .isLength({ min: 2, max: 50 })
      .withMessage("Last name must be between 2 and 50 characters"),

    check("email")
      .trim()
      .notEmpty()
      .withMessage("Email is required")
      .isEmail()
      .withMessage("Invalid email format")
      .normalizeEmail()
      .custom(async (email) => {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          throw new Error("Email is already in use");
        }
        return true;
      }),

    check("NIC")
      .trim()
      .notEmpty()
      .withMessage("NIC is required")
      .matches(/^[0-9]{9}[vVxX]$|^[0-9]{12}$/)
      .withMessage("Invalid NIC format"),

    check("password")
      .trim()
      .notEmpty()
      .withMessage("Password is required")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters long")
      .matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
      )
      .withMessage(
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
      ),

    check("confirmPassword")
      .trim()
      .notEmpty()
      .withMessage("Confirm password is required")
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error("Passwords do not match");
        }
        return true;
      }),
  ],
  async (req, res) => {
    console.log("Received data:", req.body);

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: "Validation failed",
        errors: errors
          .array()
          .map((err) => ({ field: err.param, message: err.msg })),
      });
    }

    try {
      const { firstname, lastname, email, NIC, password } = req.body;

      // Additional validation for existing NIC
      const existingUser = await User.findOne({ NIC });
      if (existingUser) {
        return res
          .status(400)
          .json({ message: "User already exists with this NIC" });
      }

      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create new user
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
      return res
        .status(500)
        .json({ message: err.message || "Internal Server Error" });
    }
  }
);

// The rest of your existing code remains unchanged
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  console.log(1, email, password);
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).send({ message: "User not found" });

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword)
      return res.status(400).send({ message: "Invalid password" });

    const token = jwt.sign({ userId: user._id }, secretekey, {
      expiresIn: "10h",
    });
    console.log("Generated Token:", token);

    res.send({
      token,
      user: { id: user._id, username: user.firstname, email: user.email },
    });
  } catch (err) {
    console.error("Error during login:", err);
    res.status(500).json({ error: err.message });
  }
});

const otpStore = {};

const transporter = nodemailer.createTransport({
  service: "gmail", // or another service
  auth: {
    user: process.env.EMAIL_USER || "",
    pass: process.env.EMAIL_PASS || "",
  },
});

// Request password reset - send OTP to email
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const otp = crypto.randomInt(100000, 999999).toString();

    otpStore[email] = {
      otp,
      expiry: Date.now() + 2 * 60 * 1000, // 10 minutes in milliseconds
    };

    const mailOptions = {
      from: process.env.EMAIL_USER || "",
      to: email,
      subject: "Password Reset OTP",
      text: `Your OTP for password reset is: ${otp}. This OTP will expire in 10 minutes.`,
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({ message: "OTP sent to your email" });
  } catch (error) {
    console.error("Error in forgot password:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
});

// Verify OTP
router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const otpData = otpStore[email];
    if (!otpData) {
      return res.status(400).json({ message: "No OTP request found" });
    }

    if (Date.now() > otpData.expiry) {
      delete otpStore[email];
      return res.status(400).json({ message: "OTP has expired" });
    }

    if (otp !== otpData.otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    const resetToken = jwt.sign({ email }, secretekey, { expiresIn: "2m" });

    delete otpStore[email];

    return res.status(200).json({
      message: "OTP verified successfully",
      resetToken,
    });
  } catch (error) {
    console.error("Error in OTP verification:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
});

// Reset password with valid token
router.post("/reset-password", async (req, res) => {
  try {
    const { resetToken, newPassword, confirmPassword } = req.body;

    if (!resetToken || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    let decoded;
    try {
      decoded = jwt.verify(resetToken, secretekey);
    } catch (err) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    const user = await User.findOne({ email: decoded.email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.error("Error in password reset:", error);
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
});

//edit profile details
router.put("/editProfile/:id", verifyToken, async (req, res) => {
  try {
    const userId = req.params.id;
    const { firstname, lastname, email, mobileNumber, address, vehicle, NIC } =
      req.body;

    // Find user first to preserve password
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const updateData = {
      firstname,
      lastname,
      email,
      mobileNumber,
      address,
      vehicle,
      NIC,
    };

    // Only update fields that were provided
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] === undefined) delete updateData[key];
    });

    const updateUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    });

    res
      .status(200)
      .json({ message: "Profile updated successfully", user: updateUser });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ message: "An error occurred while updating the profile" });
  }
});

//logout
//const tokenBlacklist = new Set(); // In a production app, this would be in Redis or a database

router.post("/logout", verifyToken, (req, res) => {
  try {
    // Make sure authorization header exists
    if (!req.headers.authorization) {
      return res.status(400).json({ message: "No token provided" });
    }

    const token = req.headers.authorization.split(" ")[1];

    // Add the token to blacklist
    tokenBlacklist.add(token);

    res.status(200).json({ message: "Logout successful" });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({
      message: "An error occurred while logging out",
      error: err.message,
    });
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

router.delete("/users/:id", verifyToken, async (req, res) => {
  try {
    const userId = req.params.id;

    // Find the user to confirm they exist
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Delete the user
    await User.findByIdAndDelete(userId);

    res.status(200).json({ message: "User account deleted successfully" });
  } catch (error) {
    console.error("Error deleting user account:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
