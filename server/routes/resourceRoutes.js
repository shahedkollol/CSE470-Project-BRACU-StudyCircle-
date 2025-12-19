const express = require("express");
const router = express.Router();
const resourceController = require("../controllers/resource.controller");

router.get("/", resourceController.listResources);
router.get("/:id", resourceController.getResource);
router.post("/", resourceController.createResource);
router.put("/:id", resourceController.updateResource);
router.delete("/:id", resourceController.deleteResource);

router.post("/:id/view", resourceController.incrementView);
router.post("/:id/download", resourceController.incrementDownload);

router.post("/:id/bookmark", resourceController.addBookmark);
router.delete("/:id/bookmark", resourceController.removeBookmark);
router.get("/bookmarks/:userId", resourceController.listBookmarks);

module.exports = router;
