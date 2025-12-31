const express = require("express");
const router = express.Router();
const resourceController = require("../controllers/resource.controller");
const { requireUser } = require("../middleware/auth");

router.get("/", resourceController.listResources);
router.get("/:id", resourceController.getResource);
router.get("/bookmarks/:userId", requireUser, resourceController.listBookmarks);

router.post("/", requireUser, resourceController.createResource);
router.put("/:id", requireUser, resourceController.updateResource);
router.delete("/:id", requireUser, resourceController.deleteResource);

router.post("/:id/view", resourceController.incrementView);
router.post("/:id/download", resourceController.incrementDownload);

router.post("/:id/bookmark", requireUser, resourceController.addBookmark);
router.delete("/:id/bookmark", requireUser, resourceController.removeBookmark);

module.exports = router;
