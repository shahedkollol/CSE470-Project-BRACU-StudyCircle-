const express = require("express");
const router = express.Router();
const { requireUser } = require("../middleware/auth");
const notificationController = require("../controllers/notification.controller");

router.get("/", requireUser, notificationController.listMyNotifications);
router.put("/:id/read", requireUser, notificationController.markRead);

module.exports = router;
