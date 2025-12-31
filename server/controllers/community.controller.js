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
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Authentication required" });
    }
    const job = await JobPosting.create({
      ...req.body,
      poster: req.user.id,
    });
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

async function listMyMentorships(req, res) {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Authentication required" });
    }
    const userId = req.user.id;
    const requests = await MentorshipRequest.find({
      $or: [{ student: userId }, { alumni: userId }],
    }).sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function createMentorship(req, res) {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Authentication required" });
    }
    const { alumni, message } = req.body;
    if (!alumni) return res.status(400).json({ message: "alumni is required" });
    const request = await MentorshipRequest.create({
      student: req.user.id,
      alumni,
      message,
    });
    res.status(201).json(request);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

async function updateMentorshipStatus(req, res) {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Authentication required" });
    }
    const { status } = req.body;
    const allowed = ["ACCEPTED", "REJECTED", "PENDING"];
    if (!status || !allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    const request = await MentorshipRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Not found" });
    const isAdmin = req.user.role === "admin";
    if (!isAdmin && request.alumni.toString() !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }
    request.status = status;
    await request.save();
    res.json(request);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

module.exports = {
  listJobs,
  createJob,
  listMentorships,
  listMyMentorships,
  createMentorship,
  updateMentorshipStatus,
};
