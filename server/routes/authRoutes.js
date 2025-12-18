const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Student, Alumni, Faculty } = require('../models/User');

// @route   POST /api/auth/register
// @desc    Register a user 
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, ...otherData } = req.body;

    // 1. Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    // 2. Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Create User based on Role (Discriminator)
    let user;
    const baseData = { name, email, password: hashedPassword, role };

    if (role === 'STUDENT') {
      user = await Student.create({ ...baseData, ...otherData }); 
    } else if (role === 'FACULTY') {// expects studentId, department, etc.
      user = await Faculty.create({ ...baseData, ...otherData }); 
    } else if (role === 'ALUMNI') {// expects expertise, etc.
      user = await Alumni.create({ ...baseData, ...otherData });
    } else {
      user = await User.create(baseData);
    }

    if (user) {
      res.status(201).json({
        _id: user.id,
        name: user.name,
        role: user.role,
        token: generateToken(user.id)
      });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});
// @route POST /api/auth/login
// @desc Auth user & get token
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      res.json({
        _id: user.id,
        name: user.name,
        role: user.role,
        token: generateToken(user.id)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Helper Function
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

module.exports = router;
