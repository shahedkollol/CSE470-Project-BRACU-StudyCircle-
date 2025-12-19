const { Resource, Bookmark } = require("../models/Resource");

async function listResources(req, res) {
  try {
    const { subject, department, tag, search } = req.query;
    const query = {};
    if (subject) query.subject = new RegExp(subject, "i");
    if (department) query.department = new RegExp(department, "i");
    if (tag) query.tags = { $in: [tag] };
    if (search) query.title = new RegExp(search, "i");

    const resources = await Resource.find(query)
      .sort({ createdAt: -1 })
      .populate("uploader", "name email");
    res.json(resources);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function getResource(req, res) {
  try {
    const doc = await Resource.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: "Resource not found" });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function createResource(req, res) {
  try {
    const { title, fileUrl } = req.body;
    if (!title || !fileUrl) {
      return res
        .status(400)
        .json({ message: "title and fileUrl are required" });
    }
    const doc = await Resource.create(req.body);
    res.status(201).json(doc);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

async function updateResource(req, res) {
  try {
    const updated = await Resource.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated)
      return res.status(404).json({ message: "Resource not found" });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

async function deleteResource(req, res) {
  try {
    const deleted = await Resource.findByIdAndDelete(req.params.id);
    if (!deleted)
      return res.status(404).json({ message: "Resource not found" });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function incrementView(req, res) {
  try {
    const updated = await Resource.findByIdAndUpdate(
      req.params.id,
      { $inc: { viewCount: 1 } },
      { new: true }
    );
    if (!updated)
      return res.status(404).json({ message: "Resource not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function incrementDownload(req, res) {
  try {
    const updated = await Resource.findByIdAndUpdate(
      req.params.id,
      { $inc: { downloadCount: 1 } },
      { new: true }
    );
    if (!updated)
      return res.status(404).json({ message: "Resource not found" });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function addBookmark(req, res) {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: "userId is required" });
    const existing = await Bookmark.findOne({
      user: userId,
      resource: req.params.id,
    });
    if (existing) return res.json(existing);
    const bookmark = await Bookmark.create({
      user: userId,
      resource: req.params.id,
    });
    res.status(201).json(bookmark);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

async function removeBookmark(req, res) {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: "userId is required" });
    await Bookmark.findOneAndDelete({ user: userId, resource: req.params.id });
    res.json({ message: "Bookmark removed" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function listBookmarks(req, res) {
  try {
    const { userId } = req.params;
    const bookmarks = await Bookmark.find({ user: userId })
      .populate("resource")
      .sort({ createdAt: -1 });
    res.json(bookmarks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = {
  listResources,
  getResource,
  createResource,
  updateResource,
  deleteResource,
  incrementView,
  incrementDownload,
  addBookmark,
  removeBookmark,
  listBookmarks,
};
