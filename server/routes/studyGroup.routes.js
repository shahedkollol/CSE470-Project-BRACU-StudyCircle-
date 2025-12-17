const express = require("express");
const router = express.Router();

const controller = require("../controllers/studyGroup.controller");

router.get("/", controller.listStudyGroups);
router.post("/", controller.createStudyGroup);

module.exports = router;
