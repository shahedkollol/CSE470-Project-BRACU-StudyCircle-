const express = require('express');
const router = express.Router();
const { JobPosting, MentorshipRequest } = require('../models/Community');

// Post a Job (Alumni only)
router.post('/jobs', async (req, res) => {
  try {
    const job = await JobPosting.create(req.body);
    res.status(201).json(job);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Request Mentorship
router.post('/mentorship', async (req, res) => {
  try {
    const request = await MentorshipRequest.create(req.body);
    res.status(201).json(request);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
