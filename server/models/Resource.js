const mongoose = require("mongoose");

const resourceSchema = new mongoose.Schema(
  {
    uploader: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    title: { type: String, required: true },
    description: String,
    subject: String,
    department: String,
    fileType: String, //PDF,DOCX,PPT
    fileUrl: { type: String, required: true },
    tags: [String],
    groupId: { type: mongoose.Schema.Types.ObjectId, ref: "StudyGroup" }, // Optional: if null, resource is public
    downloadCount: { type: Number, default: 0 },
    viewCount: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    reviews: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        stars: { type: Number, min: 1, max: 5 },
        comment: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
    reports: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        reason: { type: String, required: true },
        status: {
          type: String,
          enum: ["OPEN", "REVIEWED", "DISMISSED"],
          default: "OPEN",
        },
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

const bookmarkSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    resource: { type: mongoose.Schema.Types.ObjectId, ref: "Resource" },
  },
  { timestamps: true }
);

module.exports = {
  Resource: mongoose.model("Resource", resourceSchema),
  Bookmark: mongoose.model("Bookmark", bookmarkSchema),
};
