const express = require("express");
const router = express.Router();
const eventController = require("../controllers/event.controller");

router.get("/", eventController.listEvents);
router.post("/", eventController.createEvent);
router.post("/:id/rsvp", eventController.rsvpEvent);
router.post("/:id/cancel", eventController.cancelRsvp);

module.exports = router;
