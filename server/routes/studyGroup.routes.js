const express = require("express");
const router = express.Router();

const controller = require("../controllers/studyGroup.controller");
const { requireUser } = require("../middleware/auth");

router.get("/", controller.listStudyGroups);
router.post("/", requireUser, controller.createStudyGroup);

module.exports = router;
