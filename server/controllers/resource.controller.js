const { Resource, Bookmark } = require("../models/Resource");
const { createNotificationForUser } = require("./notification.controller");

async function listResources(req, res) {
  try {
    const { subject, department, tag, search, fileType, minRating, from, to } =
      req.query;
    const query = {};
    if (subject) query.subject = new RegExp(subject, "i");
    if (department) query.department = new RegExp(department, "i");
    if (tag) query.tags = { $in: [tag] };
    if (search) {
      const regex = new RegExp(search, "i");
      query.$or = [{ title: regex }, { description: regex }, { tags: regex }];
    }
    if (fileType) query.fileType = new RegExp(`^${fileType}$`, "i");
    if (minRating) {
      const num = Number(minRating);
      if (Number.isFinite(num)) query.averageRating = { $gte: num };
    }
    if (from || to) {
      query.createdAt = {};
      if (from) query.createdAt.$gte = new Date(from);
      if (to) query.createdAt.$lte = new Date(to);
      if (Object.keys(query.createdAt).length === 0) delete query.createdAt;
    }

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
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const { title } = req.body;
    const uploadedFile = req.file;
    const incomingUrl = req.body.fileUrl;
    if (!title || (!uploadedFile && !incomingUrl)) {
      return res
        .status(400)
        .json({ message: "title and a file upload or fileUrl are required" });
    }

    let fileUrl = incomingUrl;
    let fileType = req.body.fileType;

    let tags = req.body.tags;
    if (typeof tags === "string") {
      tags = tags
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }

    if (uploadedFile) {
      const base = `${req.protocol}://${req.get("host")}`;
      fileUrl = `${base}/uploads/resources/${uploadedFile.filename}`;
      if (!fileType) {
        const mime = uploadedFile.mimetype || "";
        const guess = mime.split("/")[1] || "";
        fileType = guess.toUpperCase() || undefined;
      }
    }

    if (fileType && typeof fileType === "string") {
      fileType = fileType.toUpperCase();
    }

    const doc = await Resource.create({
      ...req.body,
      tags,
      fileUrl,
      fileType,
      uploader: req.user.id,
    });
    res.status(201).json(doc);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

async function addReview(req, res) {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Authentication required" });
    }
    const { stars, comment } = req.body;
    const numeric = Number(stars);
    if (!Number.isFinite(numeric) || numeric < 1 || numeric > 5) {
      return res.status(400).json({ message: "stars must be between 1 and 5" });
    }

    const resource = await Resource.findById(req.params.id);
    if (!resource)
      return res.status(404).json({ message: "Resource not found" });

    const existingIdx = resource.reviews.findIndex(
      (r) => r.user?.toString() === req.user.id
    );
    if (existingIdx >= 0) {
      resource.reviews[existingIdx].stars = numeric;
      resource.reviews[existingIdx].comment = comment || "";
      resource.reviews[existingIdx].createdAt = new Date();
    } else {
      resource.reviews.push({
        user: req.user.id,
        stars: numeric,
        comment: comment || "",
      });
    }

    const total = resource.reviews.reduce((acc, r) => acc + (r.stars || 0), 0);
    const count = resource.reviews.length;
    resource.reviewCount = count;
    resource.averageRating = count === 0 ? 0 : total / count;

    await resource.save();
    await resource.populate("reviews.user", "name role");
    res.json(resource);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

async function reportResource(req, res) {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Authentication required" });
    }
    const { reason } = req.body;
    if (!reason || !reason.trim()) {
      return res.status(400).json({ message: "reason is required" });
    }

    const resource = await Resource.findById(req.params.id);
    if (!resource)
      return res.status(404).json({ message: "Resource not found" });

    resource.reports.push({ user: req.user.id, reason: reason.trim() });
    await resource.save();
    if (resource.uploader) {
      createNotificationForUser(resource.uploader, {
        title: "Resource reported",
        message: `${resource.title} was reported: ${reason.trim()}`,
        type: "resource",
        relatedId: resource._id.toString(),
      });
    }
    res.status(201).json({ message: "Report submitted" });
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
    const userId = req.user?.id;
    if (!userId)
      return res.status(401).json({ message: "Authentication required" });
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
    const userId = req.user?.id;
    if (!userId)
      return res.status(401).json({ message: "Authentication required" });
    await Bookmark.findOneAndDelete({ user: userId, resource: req.params.id });
    res.json({ message: "Bookmark removed" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function listBookmarks(req, res) {
  try {
    const { userId } = req.params;
    // Only allow a user to view their own bookmarks or admins could be added later
    if (!req.user || !req.user.id || req.user.id !== userId) {
      return res.status(403).json({ message: "Forbidden" });
    }
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
  addReview,
  reportResource,
  listGroupResources: async (req, res) => {
    try {
      const StudyGroup = require("../models/StudyGroup");
      const { groupId } = req.params;
      const group = await StudyGroup.findById(groupId);
      if (!group)
        return res.status(404).json({ message: "Study group not found" });

      // Check if user is a member
      const userId = req.user?.id || req.user?._id;
      const isMember =
        userId && group.members.some((m) => m.toString() === userId.toString());
      if (!isMember && req.user?.role !== "admin") {
        return res
          .status(403)
          .json({ message: "You must be a group member to view resources" });
      }

      const resources = await Resource.find({ groupId })
        .sort({ createdAt: -1 })
        .populate("uploader", "name email");
      res.json(resources);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },

  createGroupResource: async (req, res) => {
    try {
      const StudyGroup = require("../models/StudyGroup");
      const { groupId } = req.params;
      const group = await StudyGroup.findById(groupId);
      if (!group)
        return res.status(404).json({ message: "Study group not found" });

      // Check if user is a member
      const userId = req.user?.id || req.user?._id;
      const isMember =
        userId && group.members.some((m) => m.toString() === userId.toString());
      if (!isMember && req.user?.role !== "admin") {
        return res
          .status(403)
          .json({ message: "You must be a group member to upload resources" });
      }

      if (!req.user?.id) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const resource = await Resource.create({
        ...req.body,
        uploader: req.user.id,
        groupId,
      });

      res.status(201).json(resource);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  },

  deleteGroupResource: async (req, res) => {
    try {
      const StudyGroup = require("../models/StudyGroup");
      const { groupId, resourceId } = req.params;
      const group = await StudyGroup.findById(groupId);
      if (!group)
        return res.status(404).json({ message: "Study group not found" });

      const resource = await Resource.findById(resourceId);
      if (!resource)
        return res.status(404).json({ message: "Resource not found" });

      // Check ownership or membership
      const userId = req.user?.id || req.user?._id;
      const isOwner = resource.uploader?.toString() === userId;
      const isMember =
        userId && group.members.some((m) => m.toString() === userId.toString());
      if (!isOwner && !isMember && req.user?.role !== "admin") {
        return res.status(403).json({ message: "Forbidden" });
      }

      await resource.deleteOne();
      res.json({ message: "Resource deleted" });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
};
