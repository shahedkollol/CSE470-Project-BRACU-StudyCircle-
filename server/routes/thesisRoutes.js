const express = require("express");
const router = express.Router();
const thesisController = require("../controllers/thesis.controller");
const { requireUser } = require("../middleware/auth");

router.post("/groups", requireUser, thesisController.createGroup);
router.get("/groups", thesisController.listGroups);
router.put("/groups/:id/join", requireUser, thesisController.joinGroup);

router.post("/repository", requireUser, thesisController.createThesis);
router.get("/repository/search", thesisController.searchThesis);

module.exports = router;
