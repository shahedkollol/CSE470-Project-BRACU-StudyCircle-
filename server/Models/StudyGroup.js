const mongoose = require("mongoose");

const StudyGroupSchema = new mongoose.Schema(
  {
    title: String,
    course: String,
    description: String,
    creatorName: String,
    members: [String],
    status: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("StudyGroup", StudyGroupSchema);
