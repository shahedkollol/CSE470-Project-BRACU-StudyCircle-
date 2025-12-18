const express = require('express');
const router = express.Router();
const { TutoringPost, TutoringSession } = require('../models/Tutoring');

// Create a Tutoring Post
router.post('/posts', async (req, res) => {
  try {
    const post = await TutoringPost.create(req.body);
    res.status(201).json(post);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Search Tutors by Subject
router.get('/posts', async (req, res) => {
  try {
    const { subject } = req.query;
    const posts = await TutoringPost.find({ 
      subject: new RegExp(subject, 'i'), 
      postType: 'OFFER' 
    }).populate('author', 'name studentId');
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Request a Session
router.post('/session', async (req, res) => {
  try {
    const session = await TutoringSession.create(req.body);
    res.status(201).json(session);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
