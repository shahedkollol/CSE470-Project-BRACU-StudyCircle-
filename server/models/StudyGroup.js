const mongoose = require("mongoose");

const studyGroupSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    course: { type: String, required: true },
    description: { type: String, default: "" },
    creatorName: { type: String, required: true },

    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    // Maximum allowed members for this group
    maxMembers: { type: Number, default: 2 },

    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("StudyGroup", studyGroupSchema);
