const router = require("express").Router();
const studyGroupController = require("../controllers/studyGroup.controller");
const authMiddleware = require("../middleware/auth.middleware");

// create study group
router.post("/", studyGroupController.createStudyGroup);

// get all study groups
router.get("/", studyGroupController.getAllStudyGroups);

// join study group
router.post("/:id/join", authMiddleware, studyGroupController.joinStudyGroup);

// leave study group
router.post("/:id/leave", authMiddleware, studyGroupController.leaveStudyGroup);

module.exports = router;
