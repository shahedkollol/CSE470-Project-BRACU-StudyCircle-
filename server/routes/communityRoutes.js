const express = require("express");
const router = express.Router();
const communityController = require("../controllers/community.controller");

router.get("/jobs", communityController.listJobs);
router.post("/jobs", communityController.createJob);

router.get("/mentorship", communityController.listMentorships);
router.post("/mentorship", communityController.createMentorship);

module.exports = router;
