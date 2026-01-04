const { Event } = require("../models/Community");
const Notification = require("../models/Notification");

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
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Authentication required" });
    }
    const event = await Event.create({
      ...req.body,
      creator: req.user.id,
    });
    res.status(201).json(event);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

async function rsvpEvent(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId)
      return res.status(401).json({ message: "Authentication required" });
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
    const userId = req.user?.id;
    if (!userId)
      return res.status(401).json({ message: "Authentication required" });
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    event.attendees = event.attendees.filter((id) => id.toString() !== userId);
    await event.save();
    res.json(event);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

// Send reminder notifications to confirmed attendees
async function sendEventReminders(req, res) {
  try {
    // Find all upcoming events (within next 24 hours) that haven't sent reminders yet
    const now = new Date();
    const in24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const upcomingEvents = await Event.find({
      dateTime: { $gte: now, $lte: in24Hours },
      reminderSent: false,
    }).populate("attendees", "_id");

    let remindersSent = 0;

    for (const event of upcomingEvents) {
      // Send notification to each confirmed attendee
      for (const attendee of event.attendees) {
        await Notification.create({
          user: attendee._id,
          title: `Reminder: ${event.title}`,
          message: `Event "${event.title}" is happening at ${new Date(
            event.dateTime
          ).toLocaleString()} in ${event.location}`,
          type: "event_reminder",
          relatedId: event._id.toString(),
        });
      }

      // Mark reminder as sent
      event.reminderSent = true;
      event.reminderSentAt = new Date();
      await event.save();
      remindersSent++;
    }

    res.json({
      success: true,
      message: `Sent reminders for ${remindersSent} events to confirmed attendees`,
      remindersSent,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = {
  listEvents,
  createEvent,
  rsvpEvent,
  cancelRsvp,
  sendEventReminders,
};
