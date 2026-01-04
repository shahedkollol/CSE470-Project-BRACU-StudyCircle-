const StudyGroup = require("../models/StudyGroup");

// CREATE group (core)
exports.createStudyGroup = async (req, res) => {
  try {
    // Accept either `title` or `name`, and `course` or `courseCode`
    const title = req.body.title || req.body.name;
    const course = req.body.course || req.body.courseCode;
    const description = req.body.description || "";
    const creatorName =
      req.body.creatorName || req.body.creator || req.user?.name;
    const maxMembers = Number(req.body.maxMembers) || 4;

    if (!title) return res.status(400).json({ message: "title is required" });

    const userId = req.user?.id || req.user?._id; // optional

    const group = await StudyGroup.create({
      title,
      course,
      description,
      creatorName,
      maxMembers,
      ownerId: userId,
      members: userId ? [userId] : [],
    });

    res.status(201).json(group);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// LIST groups (core)
exports.getAllStudyGroups = async (req, res) => {
  try {
    const groups = await StudyGroup.find()
      .select(
        "title course description creatorName members maxMembers status createdAt ownerId"
      )
      .sort({ createdAt: -1 });

    // include members count for convenience
    const mapped = groups.map((g) => ({
      _id: g._id,
      title: g.title,
      course: g.course,
      description: g.description,
      creatorName: g.creatorName,
      members: g.members || [],
      membersCount: (g.members || []).length,
      maxMembers: g.maxMembers || 4,
      status: g.status,
      createdAt: g.createdAt,
      ownerId: g.ownerId,
    }));

    res.json(mapped);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// JOIN group (core)
exports.joinStudyGroup = async (req, res) => {
  try {
    const group = await StudyGroup.findById(req.params.id);
    if (!group)
      return res.status(404).json({ message: "Study group not found" });

    const userId = req.user?.id || req.user?._id || req.body.userId;
    if (!userId)
      return res
        .status(400)
        .json({ message: "userId is required (or login token)" });

    const already = group.members.some(
      (m) => m.toString() === userId.toString()
    );
    if (already) return res.status(400).json({ message: "Already joined" });
    // enforce max members
    if (group.maxMembers && group.members.length >= group.maxMembers) {
      return res.status(400).json({ message: "Group is full" });
    }

    group.members.push(userId);
    await group.save();

    res.json({ message: "Joined successfully ✅", group });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// LEAVE group (core)
exports.leaveStudyGroup = async (req, res) => {
  try {
    const group = await StudyGroup.findById(req.params.id);
    if (!group)
      return res.status(404).json({ message: "Study group not found" });

    const userId = req.user?.id || req.user?._id || req.body.userId;
    if (!userId)
      return res
        .status(400)
        .json({ message: "userId is required (or login token)" });

    group.members = group.members.filter(
      (m) => m.toString() !== userId.toString()
    );
    await group.save();

    res.json({ message: "Left successfully ✅", group });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
