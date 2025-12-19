const express = require("express");
const router = express.Router();
const tutoringController = require("../controllers/tutoring.controller");

router.get("/posts", tutoringController.listPosts);
router.post("/posts", tutoringController.createPost);

router.get("/sessions", tutoringController.listSessions);
router.post("/sessions", tutoringController.createSession);

module.exports = router;
