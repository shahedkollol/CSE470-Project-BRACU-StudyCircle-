const express = require("express");
const router = express.Router();
const { requireUser } = require("../middleware/auth");
const alumniController = require("../controllers/alumni.controller");

router.get("/employment/me", requireUser, alumniController.listMine);
router.post("/employment", requireUser, alumniController.createEmployment);
router.put("/employment/:id", requireUser, alumniController.updateEmployment);
router.delete(
  "/employment/:id",
  requireUser,
  alumniController.deleteEmployment
);

router.get("/employment/search", alumniController.searchEmployment);
router.get("/employment/analytics", alumniController.analytics);

module.exports = router;
