const { Event } = require("../models/Community");

async function listEvents(req, res) {
  try {
    const events = await Event.find()
      .sort({ dateTime: 1 })
      .populate("creator", "name");
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function createEvent(req, res) {
  try {
    const { title, dateTime, location } = req.body;
    if (!title || !dateTime || !location) {
      return res
        .status(400)
        .json({ message: "title, dateTime, and location are required" });
    }
    const event = await Event.create(req.body);
    res.status(201).json(event);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

async function rsvpEvent(req, res) {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: "userId is required" });
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    if (!event.attendees.includes(userId)) {
      event.attendees.push(userId);
      await event.save();
    }
    res.json(event);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

async function cancelRsvp(req, res) {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: "userId is required" });
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    event.attendees = event.attendees.filter((id) => id.toString() !== userId);
    await event.save();
    res.json(event);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

module.exports = {
  listEvents,
  createEvent,
  rsvpEvent,
  cancelRsvp,
};
