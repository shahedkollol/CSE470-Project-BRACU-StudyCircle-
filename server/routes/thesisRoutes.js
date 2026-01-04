const express = require("express");
const router = express.Router();
const thesisController = require("../controllers/thesis.controller");
const { requireUser } = require("../middleware/auth");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Setup upload directory for thesis files
const uploadDir = path.join(__dirname, "..", "uploads", "thesis");
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
    limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit for thesis PDFs
    fileFilter: (_req, file, cb) => {
        const allowedTypes = [
            "application/pdf",
            "application/zip",
            "application/x-zip-compressed",
            "application/gzip",
            "application/x-gzip",
            "application/x-tar",
        ];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Only PDF and archive files are allowed"), false);
        }
    },
});

// Thesis Groups
router.post("/groups", requireUser, thesisController.createGroup);
router.get("/groups", thesisController.listGroups);
router.put("/groups/:id/join", requireUser, thesisController.joinGroup);

// Thesis Repository - CRUD
router.get("/repository", thesisController.listTheses);
router.get("/repository/search", thesisController.searchThesis);
router.get("/repository/:id", thesisController.getThesis);
router.post(
    "/repository",
    requireUser,
    upload.fields([
        { name: "pdf", maxCount: 1 },
        { name: "code", maxCount: 1 },
    ]),
    thesisController.createThesis
);

// Thesis Repository - Voting
router.post("/repository/:id/upvote", requireUser, thesisController.upvoteThesis);
router.post("/repository/:id/downvote", requireUser, thesisController.downvoteThesis);

// Thesis Repository - Reviews
router.post("/repository/:id/reviews", requireUser, thesisController.addReview);

// Thesis Repository - Citation
router.get("/repository/:id/cite", thesisController.getCitation);

// Thesis Repository - Download tracking
router.post("/repository/:id/download", thesisController.incrementDownload);

module.exports = router;
