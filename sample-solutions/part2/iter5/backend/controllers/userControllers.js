const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const { SECRET } = require("../utils/config");

// POST /api/users (signup)
const signup = async (req, res) => {
  const {
    name,
    email,
    password,
    phoneNumber,
    profilePicture,
    gender,
    dateOfBirth,
    address,
  } = req.body;

  // Validate required fields
  if (!name || !email || !password || !phoneNumber || !dateOfBirth || !address) {
    return res.status(400).json({ error: "All required fields must be provided" });
  }

  // Validate address sub-fields
  if (!address.street || !address.city || !address.state || !address.zipCode) {
    return res
      .status(400)
      .json({ error: "Address must include street, city, state, and zipCode" });
  }

  // Check if email is already taken
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ error: "Email is already in use" });
  }

  // Hash the password
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  // Create the user
  const user = await User.create({
    name,
    email,
    password: passwordHash,
    phoneNumber,
    profilePicture,
    gender,
    dateOfBirth,
    address,
  });

  // Generate JWT
  const token = jwt.sign({ id: user._id }, SECRET);

  res.status(201).json({
    name: user.name,
    email: user.email,
    phoneNumber: user.phoneNumber,
    dateOfBirth: user.dateOfBirth,
    role: user.role,
    address: user.address,
    token,
  });
};

// POST /api/users/login
const login = async (req, res) => {
  const { email, password } = req.body;

  // Find user by email
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  // Compare passwords
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ error: "Invalid email or password" });
  }

  // Generate JWT
  const token = jwt.sign({ id: user._id }, SECRET);

  res.status(200).json({
    name: user.name,
    email: user.email,
    phoneNumber: user.phoneNumber,
    token,
  });
};

module.exports = { signup, login };
