const { ThesisGroup, Thesis } = require("../models/Thesis");

async function createGroup(req, res) {
  try {
    const group = await ThesisGroup.create(req.body);
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
    const group = await ThesisGroup.findById(req.params.id);
    if (!group) return res.status(404).json({ message: "Group not found" });
    group.members.push(req.body.userId);
    await group.save();
    res.json(group);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

async function createThesis(req, res) {
  try {
    const thesis = await Thesis.create(req.body);
    res.status(201).json(thesis);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

async function searchThesis(req, res) {
  try {
    const { keyword, department } = req.query;
    const query = { status: "PUBLISHED" };
    if (keyword) query.$text = { $search: keyword };
    if (department) query.department = department;
    const results = await Thesis.find(query);
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
