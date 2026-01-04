const router = require("express").Router();
const ctrl = require("../controllers/studyGroup.controller");
const resourceCtrl = require("../controllers/resource.controller");

// Study Group routes
router.post("/", ctrl.createStudyGroup);
router.get("/", ctrl.getAllStudyGroups);
router.post("/:id/join", ctrl.joinStudyGroup);
router.post("/:id/leave", ctrl.leaveStudyGroup);

// Group Resources routes (member-only)
router.get("/:groupId/resources", resourceCtrl.listGroupResources);
router.post("/:groupId/resources", resourceCtrl.createGroupResource);
router.delete(
  "/:groupId/resources/:resourceId",
  resourceCtrl.deleteGroupResource
);

module.exports = router;
