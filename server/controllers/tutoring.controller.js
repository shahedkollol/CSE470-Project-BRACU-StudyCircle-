const { TutoringPost, TutoringSession } = require("../models/Tutoring");

async function listPosts(req, res) {
  try {
    const { subject } = req.query;
    const query = {};
    if (subject) {
      query.subject = new RegExp(subject, "i");
    }
    const posts = await TutoringPost.find(query)
      .sort({ createdAt: -1 })
      .populate("author", "name");
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function createPost(req, res) {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Authentication required" });
    }
    const post = await TutoringPost.create({
      ...req.body,
      author: req.user.id,
    });
    res.status(201).json(post);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

async function listSessions(req, res) {
  try {
    const sessions = await TutoringSession.find()
      .sort({ createdAt: -1 })
      .populate("tutor learner", "name");
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function createSession(req, res) {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Authentication required" });
    }
    const { learner, subject, scheduledTime, location } = req.body;
    if (!learner || !subject || !scheduledTime) {
      return res
        .status(400)
        .json({ message: "learner, subject, and scheduledTime are required" });
    }
    const session = await TutoringSession.create({
      tutor: req.user.id,
      learner,
      subject,
      scheduledTime,
      location,
      status: req.body.status || "PENDING",
    });
    res.status(201).json(session);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

module.exports = {
  listPosts,
  createPost,
  listSessions,
  createSession,
};
