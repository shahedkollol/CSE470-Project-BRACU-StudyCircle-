const mongoose = require("mongoose");

const employmentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true },
    industry: { type: String, trim: true },
    location: { type: String, trim: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date },
    description: { type: String, trim: true },
  },
  { timestamps: true }
);

employmentSchema.index({
  company: "text",
  industry: "text",
  title: "text",
  location: "text",
});

module.exports = mongoose.model("Employment", employmentSchema);
