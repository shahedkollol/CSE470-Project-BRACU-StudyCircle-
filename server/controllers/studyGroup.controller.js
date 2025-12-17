const StudyGroup = require("../models/StudyGroup");

async function listStudyGroups(req, res) {
  try {
    const groups = await StudyGroup.find();
    res.json(groups);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function createStudyGroup(req, res) {
  try {
    const { title, course, creatorName } = req.body;

    if (!title || !course || !creatorName) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const group = await StudyGroup.create({
      title,
      course,
      creatorName,
      members: [creatorName],
      status: "active",
    });

    res.status(201).json(group);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  listStudyGroups,
  createStudyGroup,
};
