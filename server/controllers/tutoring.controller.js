const { TutoringPost, TutoringSession } = require("../models/Tutoring");
const User = require("../models/User");
const { createNotificationForUser } = require("./notification.controller");

function isOwnerOrAdmin(req, doc) {
  if (!req.user || !req.user.id) return false;
  return doc.author?.toString() === req.user.id || req.user.role === "admin";
}

async function listPosts(req, res) {
  try {
    const {
      subject,
      postType,
      meetingMode,
      rateMin,
      rateMax,
      availability,
      sort,
      page = 1,
      limit = 50,
    } = req.query;

    const query = {};
    if (subject) query.subject = new RegExp(subject, "i");
    if (postType) query.postType = postType.toUpperCase();
    if (meetingMode) query.meetingMode = meetingMode.toUpperCase();

    if (rateMin !== undefined || rateMax !== undefined) {
      query.rate = {};
      const min = Number(rateMin);
      const max = Number(rateMax);
      if (Number.isFinite(min)) query.rate.$gte = min;
      if (Number.isFinite(max)) query.rate.$lte = max;
      if (Object.keys(query.rate).length === 0) delete query.rate;
    }

    if (availability) {
      query.availability = { $regex: availability, $options: "i" };
    }

    let sortStage = { createdAt: -1 };
    if (sort === "rateAsc") sortStage = { rate: 1, createdAt: -1 };
    if (sort === "rateDesc") sortStage = { rate: -1, createdAt: -1 };

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit, 10) || 50, 1), 100);
    const skip = (pageNum - 1) * limitNum;

    const posts = await TutoringPost.find(query)
      .sort(sortStage)
      .skip(skip)
      .limit(limitNum)
      .populate("author", "name");
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function createPost(req, res) {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Authentication required" });
    }
    const post = await TutoringPost.create({
      ...req.body,
      author: req.user.id,
    });
    res.status(201).json(post);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

async function updatePost(req, res) {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Authentication required" });
    }
    const post = await TutoringPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    if (!isOwnerOrAdmin(req, post)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    const allowed = {};
    [
      "subject",
      "description",
      "availability",
      "meetingMode",
      "rate",
      "postType",
    ].forEach((key) => {
      if (req.body[key] !== undefined) allowed[key] = req.body[key];
    });
    const updated = await TutoringPost.findByIdAndUpdate(post._id, allowed, {
      new: true,
      runValidators: true,
    });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

async function deletePost(req, res) {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Authentication required" });
    }
    const post = await TutoringPost.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    if (!isOwnerOrAdmin(req, post)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    await post.deleteOne();
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function listSessions(req, res) {
  try {
    const sessions = await TutoringSession.find()
      .sort({ createdAt: -1 })
      .populate("tutor learner", "name");
    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function createSession(req, res) {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Authentication required" });
    }
    const { learner, subject, scheduledTime, location } = req.body;
    if (!learner || !subject || !scheduledTime) {
      return res
        .status(400)
        .json({ message: "learner, subject, and scheduledTime are required" });
    }

    // Conflict detection: prevent tutor/learner double-book at same time (except cancelled/rejected)
    const conflicts = await TutoringSession.find({
      $and: [
        { scheduledTime: new Date(scheduledTime) },
        {
          status: {
            $nin: ["CANCELLED", "REJECTED"],
          },
        },
        {
          $or: [{ tutor: req.user.id }, { learner }],
        },
      ],
    });
    if (conflicts.length > 0) {
      return res
        .status(409)
        .json({ message: "Schedule conflict for tutor or learner" });
    }

    const session = await TutoringSession.create({
      tutor: req.user.id,
      learner,
      subject,
      scheduledTime,
      location,
      status: req.body.status || "PENDING",
    });

    // notify learner about the new session request
    if (learner && learner !== req.user.id) {
      createNotificationForUser(learner, {
        title: "Tutoring session requested",
        message: `A tutor scheduled a session for ${subject}`,
        type: "tutoring",
        relatedId: session._id.toString(),
      });
    }
    res.status(201).json(session);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

async function updateSessionStatus(req, res) {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Authentication required" });
    }
    const { status } = req.body;
    const session = await TutoringSession.findById(req.params.id);
    if (!session) return res.status(404).json({ message: "Session not found" });

    const userId = req.user.id;
    const isTutor = session.tutor?.toString() === userId;
    const isLearner = session.learner?.toString() === userId;
    if (!isTutor && !isLearner && req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const current = session.status;
    const allowedTransitions = {
      PENDING: isTutor
        ? ["ACCEPTED", "REJECTED", "CANCELLED"]
        : isLearner
        ? ["CANCELLED"]
        : [],
      ACCEPTED: isTutor
        ? ["COMPLETED", "CANCELLED"]
        : isLearner
        ? ["CANCELLED"]
        : [],
      REJECTED: [],
      CANCELLED: [],
      COMPLETED: [],
    };

    const allowed = allowedTransitions[current] || [];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: "Invalid status transition" });
    }

    session.status = status;
    await session.save();

    // notify the counterparty about the status change
    const targetUser = isTutor ? session.learner : session.tutor;
    if (targetUser) {
      createNotificationForUser(targetUser, {
        title: "Session status updated",
        message: `Status changed to ${status} for ${session.subject}`,
        type: "tutoring",
        relatedId: session._id.toString(),
      });
    }
    res.json(session);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

async function rateSession(req, res) {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const session = await TutoringSession.findById(req.params.id);
    if (!session) return res.status(404).json({ message: "Session not found" });

    const isLearner = session.learner?.toString() === req.user.id;
    if (!isLearner) {
      return res.status(403).json({ message: "Only learner can rate" });
    }

    if (session.status !== "COMPLETED") {
      return res
        .status(400)
        .json({ message: "Session must be COMPLETED to rate" });
    }

    const { stars, review } = req.body;
    const numeric = Number(stars);
    if (!Number.isFinite(numeric) || numeric < 1 || numeric > 5) {
      return res.status(400).json({ message: "stars must be between 1 and 5" });
    }

    session.rating = {
      stars: numeric,
      review: review || "",
      timestamp: new Date(),
    };

    await session.save();
    res.json(session);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

async function tutorLeaderboard(req, res) {
  try {
    const pipeline = [
      {
        $match: {
          status: "COMPLETED",
          "rating.stars": { $exists: true },
        },
      },
      {
        $group: {
          _id: "$tutor",
          avgRating: { $avg: "$rating.stars" },
          completed: { $sum: 1 },
        },
      },
      { $sort: { avgRating: -1, completed: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "tutor",
        },
      },
      { $unwind: { path: "$tutor", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          tutorId: "$_id",
          tutorName: "$tutor.name",
          avgRating: { $round: ["$avgRating", 2] },
          completed: 1,
        },
      },
    ];

    const leaders = await TutoringSession.aggregate(pipeline);
    res.json(leaders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function listFavoriteTutors(req, res) {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const me = await User.findById(req.user.id)
      .populate("favoriteTutors", "name role department batch")
      .select("favoriteTutors");

    if (!me) return res.status(404).json({ message: "User not found" });
    res.json(me.favoriteTutors || []);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function addFavoriteTutor(req, res) {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Authentication required" });
    }
    if (req.user.role !== "student") {
      return res
        .status(403)
        .json({ message: "Only students can favorite tutors" });
    }

    const tutorId = req.params.tutorId;
    if (!tutorId)
      return res.status(400).json({ message: "tutorId is required" });
    if (tutorId === req.user.id) {
      return res.status(400).json({ message: "You cannot favorite yourself" });
    }

    const tutor = await User.findById(tutorId);
    if (!tutor) return res.status(404).json({ message: "Tutor not found" });

    const updated = await User.findByIdAndUpdate(
      req.user.id,
      { $addToSet: { favoriteTutors: tutorId } },
      { new: true }
    ).select("favoriteTutors");

    res.json(updated.favoriteTutors || []);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function removeFavoriteTutor(req, res) {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Authentication required" });
    }
    if (req.user.role !== "student") {
      return res
        .status(403)
        .json({ message: "Only students can favorite tutors" });
    }

    const tutorId = req.params.tutorId;
    if (!tutorId)
      return res.status(400).json({ message: "tutorId is required" });

    const updated = await User.findByIdAndUpdate(
      req.user.id,
      { $pull: { favoriteTutors: tutorId } },
      { new: true }
    ).select("favoriteTutors");

    res.json(updated.favoriteTutors || []);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = {
  listPosts,
  createPost,
  updatePost,
  deletePost,
  listSessions,
  createSession,
  updateSessionStatus,
  rateSession,
  tutorLeaderboard,
  listFavoriteTutors,
  addFavoriteTutor,
  removeFavoriteTutor,
};
