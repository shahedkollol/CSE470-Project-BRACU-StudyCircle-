const express = require('express');
const router = express.Router();
const { ThesisGroup, Thesis, ThesisReview } = require('../models/Thesis');

// THESIS GROUPS

// Create a new Thesis Group
router.post('/groups', async (req, res) => {
  try {
    const group = await ThesisGroup.create(req.body);
    res.status(201).json(group);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all Groups 
router.get('/groups', async (req, res) => {
  try {
    const { interest } = req.query;
    let query = { status: 'OPEN' };
    
    //Interest-based matching logic
    if (interest) {
      query.researchInterests = { $in: [interest] };
    }

    const groups = await ThesisGroup.find(query).populate('leader', 'name');
    res.json(groups);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Join a Group (Add member)
router.put('/groups/:id/join', async (req, res) => {
  try {
    const group = await ThesisGroup.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    
    //heck maxMembers here
    group.members.push(req.body.userId);
    await group.save();
    res.json(group);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// THESIS REPOSITORY

// Upload/Submit a Thesis
router.post('/repository', async (req, res) => {
  try {
    const thesis = await Thesis.create(req.body);
    res.status(201).json(thesis);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Advanced Search (FR-5.4)
router.get('/repository/search', async (req, res) => {
  try {
    const { keyword, department } = req.query;
    let query = { status: 'PUBLISHED' }; // Only show published papers

    if (keyword) {
      query.$text = { $search: keyword }; // Uses the Text Index
    }
    if (department) {
      query.department = department;
    }

    const results = await Thesis.find(query);
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
