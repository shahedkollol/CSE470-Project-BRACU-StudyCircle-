const express = require("express");
const router = express.Router();
const eventController = require("../controllers/event.controller");
const { requireUser } = require("../middleware/auth");

router.get("/", eventController.listEvents);
router.post("/", requireUser, eventController.createEvent);
router.post("/:id/rsvp", requireUser, eventController.rsvpEvent);
router.post("/:id/cancel", requireUser, eventController.cancelRsvp);

module.exports = router;
