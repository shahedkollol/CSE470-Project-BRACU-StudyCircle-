const Notification = require("../models/Notification");

async function createNotificationForUser(userId, payload) {
  if (!userId) return null;
  const { title, message, type = "general", relatedId } = payload;
  if (!title || !message) return null;
  return Notification.create({
    user: userId,
    title,
    message,
    type,
    relatedId,
  });
}

async function listMyNotifications(req, res) {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Authentication required" });
    }
    const docs = await Notification.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(100);
    res.json(docs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function markRead(req, res) {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Authentication required" });
    }
    const updated = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { read: true },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

module.exports = {
  createNotificationForUser,
  listMyNotifications,
  markRead,
};
