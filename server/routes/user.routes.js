const express = require("express");
const router = express.Router();

const userController = require("../controllers/user.controller");
const { requireUser } = require("../middleware/auth");

router.post("/register", userController.register);
router.post("/login", userController.login);

// Get current user profile
router.get("/me", requireUser, userController.getMe);

// Update current user profile
router.put("/me", requireUser, userController.updateMe);

// Update any user (self or admin)
router.put("/:id", requireUser, userController.updateUserById);

module.exports = router;
