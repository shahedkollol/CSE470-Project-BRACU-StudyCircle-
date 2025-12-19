const { JobPosting, MentorshipRequest } = require("../models/Community");

async function listJobs(req, res) {
  try {
    const jobs = await JobPosting.find().sort({ createdAt: -1 });
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function createJob(req, res) {
  try {
    const job = await JobPosting.create(req.body);
    res.status(201).json(job);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

async function listMentorships(req, res) {
  try {
    const requests = await MentorshipRequest.find().sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function createMentorship(req, res) {
  try {
    const request = await MentorshipRequest.create(req.body);
    res.status(201).json(request);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

module.exports = {
  listJobs,
  createJob,
  listMentorships,
  createMentorship,
};
