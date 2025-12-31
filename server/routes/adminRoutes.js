const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin.controller");
const { requireRole } = require("../middleware/auth");

router.get("/users", requireRole("admin"), adminController.listUsers);
router.put(
  "/users/:id/role",
  requireRole("admin"),
  adminController.updateUserRole
);
router.delete("/users/:id", requireRole("admin"), adminController.deleteUser);

module.exports = router;
