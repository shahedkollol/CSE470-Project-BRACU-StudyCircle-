const express = require("express");
const router = express.Router();
const communityController = require("../controllers/community.controller");
const { requireUser, requireRole } = require("../middleware/auth");

router.get("/jobs", communityController.listJobs);
router.post("/jobs", requireRole("alumni"), communityController.createJob);

router.get("/mentorship", communityController.listMentorships);
router.post("/mentorship", requireUser, communityController.createMentorship);
router.get(
  "/mentorship/mine",
  requireUser,
  communityController.listMyMentorships
);
router.put(
  "/mentorship/:id/status",
  requireUser,
  communityController.updateMentorshipStatus
);

module.exports = router;
