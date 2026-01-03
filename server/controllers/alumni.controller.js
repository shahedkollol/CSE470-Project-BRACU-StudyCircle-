const Employment = require("../models/Employment");

function isOwnerOrAdmin(req, doc) {
  if (!req.user || !req.user.id) return false;
  return doc.user.toString() === req.user.id || req.user.role === "admin";
}

async function listMine(req, res) {
  try {
    const entries = await Employment.find({ user: req.user.id }).sort({
      startDate: -1,
    });
    res.json(entries);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function createEmployment(req, res) {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Authentication required" });
    }
    const { title, company, startDate } = req.body;
    if (!title || !company || !startDate) {
      return res
        .status(400)
        .json({ message: "title, company, and startDate are required" });
    }
    const entry = await Employment.create({
      ...req.body,
      user: req.user.id,
    });
    res.status(201).json(entry);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

async function updateEmployment(req, res) {
  try {
    const entry = await Employment.findById(req.params.id);
    if (!entry)
      return res.status(404).json({ message: "Employment not found" });
    if (!isOwnerOrAdmin(req, entry)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    const allowed = {};
    [
      "title",
      "company",
      "industry",
      "location",
      "startDate",
      "endDate",
      "description",
    ].forEach((key) => {
      if (req.body[key] !== undefined) allowed[key] = req.body[key];
    });
    const updated = await Employment.findByIdAndUpdate(entry._id, allowed, {
      new: true,
      runValidators: true,
    });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

async function deleteEmployment(req, res) {
  try {
    const entry = await Employment.findById(req.params.id);
    if (!entry)
      return res.status(404).json({ message: "Employment not found" });
    if (!isOwnerOrAdmin(req, entry)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    await entry.deleteOne();
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function searchEmployment(req, res) {
  try {
    const { company, industry, title, location } = req.query;
    const query = {};
    if (company) query.company = new RegExp(company, "i");
    if (industry) query.industry = new RegExp(industry, "i");
    if (title) query.title = new RegExp(title, "i");
    if (location) query.location = new RegExp(location, "i");
    const results = await Employment.find(query)
      .populate("user", "name email department batch")
      .sort({ startDate: -1 })
      .limit(100);
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function analytics(req, res) {
  try {
    const byIndustry = await Employment.aggregate([
      { $match: {} },
      {
        $group: {
          _id: { $ifNull: ["$industry", "Unknown"] },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const byYear = await Employment.aggregate([
      { $match: { startDate: { $ne: null } } },
      {
        $group: {
          _id: { $year: "$startDate" },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({ byIndustry, byYear });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = {
  listMine,
  createEmployment,
  updateEmployment,
  deleteEmployment,
  searchEmployment,
  analytics,
};
