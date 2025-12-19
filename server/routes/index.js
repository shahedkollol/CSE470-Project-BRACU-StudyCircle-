const express = require("express");
const router = express.Router();

const studyGroupRoutes = require("./studyGroup.routes");
const userRoutes = require("./user.routes");
const authRoutes = require("./authRoutes");
const communityRoutes = require("./communityRoutes");
const tutoringRoutes = require("./tutoringRoutes");
const thesisRoutes = require("./thesisRoutes");
const resourceRoutes = require("./resourceRoutes");
const eventRoutes = require("./eventRoutes");
const adminRoutes = require("./adminRoutes");

router.use("/study-groups", studyGroupRoutes);
router.use("/users", userRoutes);
router.use("/auth", authRoutes);
router.use("/community", communityRoutes);
router.use("/tutoring", tutoringRoutes);
router.use("/thesis", thesisRoutes);
router.use("/resources", resourceRoutes);
router.use("/events", eventRoutes);
router.use("/admin", adminRoutes);

module.exports = router;
