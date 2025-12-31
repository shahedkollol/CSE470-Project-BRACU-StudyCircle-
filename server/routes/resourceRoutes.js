const express = require("express");
const router = express.Router();
const resourceController = require("../controllers/resource.controller");
const { requireUser } = require("../middleware/auth");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadDir = path.join(__dirname, "..", "uploads", "resources");
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const safe = file.originalname.replace(/\s+/g, "_");
    cb(null, `${Date.now()}-${safe}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
});

router.get("/", resourceController.listResources);
router.get("/bookmarks/:userId", requireUser, resourceController.listBookmarks);
router.get("/:id", resourceController.getResource);

router.post(
  "/",
  requireUser,
  upload.single("file"),
  resourceController.createResource
);
router.put("/:id", requireUser, resourceController.updateResource);
router.delete("/:id", requireUser, resourceController.deleteResource);

router.post("/:id/reviews", requireUser, resourceController.addReview);

router.post("/:id/view", resourceController.incrementView);
router.post("/:id/download", resourceController.incrementDownload);

router.post("/:id/bookmark", requireUser, resourceController.addBookmark);
router.delete("/:id/bookmark", requireUser, resourceController.removeBookmark);
router.post("/:id/report", requireUser, resourceController.reportResource);

module.exports = router;
