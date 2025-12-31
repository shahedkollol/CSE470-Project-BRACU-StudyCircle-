const { ThesisGroup, Thesis } = require("../models/Thesis");

async function createGroup(req, res) {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Authentication required" });
    }
    const group = await ThesisGroup.create({
      ...req.body,
      leader: req.user.id,
      members:
        req.body.members && req.body.members.length > 0
          ? Array.from(new Set([req.user.id, ...req.body.members]))
          : [req.user.id],
    });
    res.status(201).json(group);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

async function listGroups(req, res) {
  try {
    const { interest } = req.query;
    const query = { status: "OPEN" };
    if (interest) {
      query.researchInterests = { $in: [interest] };
    }
    const groups = await ThesisGroup.find(query).populate("leader", "name");
    res.json(groups);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function joinGroup(req, res) {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Authentication required" });
    }
    const group = await ThesisGroup.findById(req.params.id);
    if (!group) return res.status(404).json({ message: "Group not found" });
    if (!group.members.map((m) => m.toString()).includes(req.user.id)) {
      group.members.push(req.user.id);
    }
    await group.save();
    res.json(group);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

async function createThesis(req, res) {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Authentication required" });
    }
    const authors =
      req.body.authors && req.body.authors.length > 0
        ? Array.from(new Set([req.user.id, ...req.body.authors]))
        : [req.user.id];
    const thesis = await Thesis.create({
      ...req.body,
      authors,
    });
    res.status(201).json(thesis);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

async function searchThesis(req, res) {
  try {
    const { keyword, department } = req.query;
    const baseQuery = { status: "PUBLISHED" };
    if (department) baseQuery.department = department;

    // Prefer text search when available
    if (keyword) {
      try {
        const results = await Thesis.find({
          ...baseQuery,
          $text: { $search: keyword },
        });
        return res.json(results);
      } catch (err) {
        const needsTextIndex =
          err &&
          typeof err.message === "string" &&
          err.message.includes("text index required");
        if (!needsTextIndex) throw err;
        // Fallback to regex search when text index is missing
        const regex = new RegExp(keyword, "i");
        const results = await Thesis.find({
          ...baseQuery,
          $or: [{ title: regex }, { abstract: regex }, { keywords: regex }],
        });
        return res.json(results);
      }
    }

    const results = await Thesis.find(baseQuery);
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = {
  createGroup,
  listGroups,
  joinGroup,
  createThesis,
  searchThesis,
};
