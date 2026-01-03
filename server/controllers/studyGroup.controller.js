const StudyGroup = require("../models/StudyGroup");

exports.createStudyGroup = async (req, res) => {
  try {
    const { name, courseCode, description, privacy } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Group name is required" });
    }

    const userId = req.user.id || req.user._id;

    const group = await StudyGroup.create({
      name,
      courseCode,
      description,
      privacy: privacy || "public",
      ownerId: userId,
      members: [userId],
    });

    res.status(201).json(group);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllStudyGroups = async (req, res) => {
  const groups = await StudyGroup.find();
  res.json(groups);
};

exports.joinStudyGroup = async (req, res) => {
  const group = await StudyGroup.findById(req.params.id);

  if (!group) {
    return res.status(404).json({ message: "Study group not found" });
  }

  if (group.members.includes(req.user.id)) {
    return res.status(400).json({ message: "Already joined" });
  }

  group.members.push(req.user.id);
  await group.save();

  res.json({ message: "Joined successfully ✅" });
};

exports.leaveStudyGroup = async (req, res) => {
  const group = await StudyGroup.findById(req.params.id);

  if (!group) {
    return res.status(404).json({ message: "Study group not found" });
  }

  group.members = group.members.filter((m) => m.toString() !== req.user.id);

  await group.save();
  res.json({ message: "Left successfully ✅" });
};
