const express = require("express");
const router = express.Router();
const tutoringController = require("../controllers/tutoring.controller");
const { requireUser } = require("../middleware/auth");

router.get("/posts", tutoringController.listPosts);
router.post("/posts", requireUser, tutoringController.createPost);

router.get("/sessions", tutoringController.listSessions);
router.post("/sessions", requireUser, tutoringController.createSession);

module.exports = router;
