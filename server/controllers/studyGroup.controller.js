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
    const { title, course } = req.body;
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Authentication required" });
    }

    if (!title || !course) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const creatorName = req.user.id;

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
