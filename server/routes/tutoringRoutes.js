const express = require("express");
const router = express.Router();
const tutoringController = require("../controllers/tutoring.controller");
const { requireUser } = require("../middleware/auth");

router.get("/posts", tutoringController.listPosts);
router.post("/posts", requireUser, tutoringController.createPost);
router.put("/posts/:id", requireUser, tutoringController.updatePost);
router.delete("/posts/:id", requireUser, tutoringController.deletePost);

router.get("/sessions", tutoringController.listSessions);
router.post("/sessions", requireUser, tutoringController.createSession);
router.put(
  "/sessions/:id/status",
  requireUser,
  tutoringController.updateSessionStatus
);
router.post(
  "/sessions/:id/rating",
  requireUser,
  tutoringController.rateSession
);

router.get("/leaderboard", tutoringController.tutorLeaderboard);

router.get("/favorites", requireUser, tutoringController.listFavoriteTutors);
router.post(
  "/favorites/:tutorId",
  requireUser,
  tutoringController.addFavoriteTutor
);
router.delete(
  "/favorites/:tutorId",
  requireUser,
  tutoringController.removeFavoriteTutor
);

module.exports = router;
