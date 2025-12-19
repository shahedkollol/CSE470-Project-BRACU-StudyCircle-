const express = require("express");
const router = express.Router();
const thesisController = require("../controllers/thesis.controller");

router.post("/groups", thesisController.createGroup);
router.get("/groups", thesisController.listGroups);
router.put("/groups/:id/join", thesisController.joinGroup);

router.post("/repository", thesisController.createThesis);
router.get("/repository/search", thesisController.searchThesis);

module.exports = router;
