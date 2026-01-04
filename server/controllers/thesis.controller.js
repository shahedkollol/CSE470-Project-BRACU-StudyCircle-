const { ThesisGroup, Thesis } = require("../models/Thesis");

// ========== Thesis Groups ==========

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

// ========== Thesis Repository ==========

async function listTheses(req, res) {
  try {
    const { department, keyword } = req.query;
    const query = { status: "PUBLISHED" };
    if (department) query.department = department;

    let theses;
    if (keyword) {
      const regex = new RegExp(keyword, "i");
      theses = await Thesis.find({
        ...query,
        $or: [{ title: regex }, { abstract: regex }, { keywords: regex }],
      })
        .populate("authors", "name")
        .sort({ createdAt: -1 });
    } else {
      theses = await Thesis.find(query)
        .populate("authors", "name")
        .sort({ createdAt: -1 });
    }

    // Sort by upvote count (descending)
    theses.sort((a, b) => (b.upvotes?.length || 0) - (a.upvotes?.length || 0));

    res.json(theses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function getThesis(req, res) {
  try {
    const thesis = await Thesis.findById(req.params.id)
      .populate("authors", "name department")
      .populate("supervisor", "name")
      .populate("reviews.user", "name");
    if (!thesis) return res.status(404).json({ message: "Thesis not found" });

    // Increment view count
    thesis.viewCount = (thesis.viewCount || 0) + 1;
    await thesis.save();

    res.json(thesis);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function createThesis(req, res) {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const { title, brief, abstract, department, keywords, year, gitRepoUrl, designation } = req.body;
    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }

    // Handle file uploads
    let pdfUrl = req.body.pdfUrl;
    let codeUrl = req.body.codeUrl;

    if (req.files) {
      const base = `${req.protocol}://${req.get("host")}`;
      if (req.files.pdf && req.files.pdf[0]) {
        pdfUrl = `${base}/uploads/thesis/${req.files.pdf[0].filename}`;
      }
      if (req.files.code && req.files.code[0]) {
        codeUrl = `${base}/uploads/thesis/${req.files.code[0].filename}`;
      }
    }

    // Parse keywords if string
    let parsedKeywords = keywords;
    if (typeof keywords === "string") {
      parsedKeywords = keywords
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }

    const authors =
      req.body.authors && req.body.authors.length > 0
        ? Array.from(new Set([req.user.id, ...req.body.authors]))
        : [req.user.id];

    const thesis = await Thesis.create({
      title,
      brief,
      abstract,
      department,
      keywords: parsedKeywords,
      year: year || new Date().getFullYear(),
      pdfUrl,
      codeUrl,
      gitRepoUrl,
      designation,
      authors,
      status: "PUBLISHED",
      upvotes: [],
      downvotes: [],
      reviews: [],
      averageRating: 0,
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

    if (keyword) {
      try {
        const results = await Thesis.find({
          ...baseQuery,
          $text: { $search: keyword },
        }).populate("authors", "name");
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
        }).populate("authors", "name");
        return res.json(results);
      }
    }

    const results = await Thesis.find(baseQuery).populate("authors", "name");
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function upvoteThesis(req, res) {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const thesis = await Thesis.findById(req.params.id);
    if (!thesis) return res.status(404).json({ message: "Thesis not found" });

    const userId = req.user.id;
    const upvoteIndex = thesis.upvotes.findIndex(
      (id) => id.toString() === userId
    );
    const downvoteIndex = thesis.downvotes.findIndex(
      (id) => id.toString() === userId
    );

    // Remove from downvotes if present
    if (downvoteIndex > -1) {
      thesis.downvotes.splice(downvoteIndex, 1);
    }

    // Toggle upvote
    if (upvoteIndex > -1) {
      thesis.upvotes.splice(upvoteIndex, 1);
    } else {
      thesis.upvotes.push(userId);
    }

    await thesis.save();
    res.json({
      upvotes: thesis.upvotes.length,
      downvotes: thesis.downvotes.length,
      userUpvoted: upvoteIndex === -1,
      userDownvoted: false,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

async function downvoteThesis(req, res) {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const thesis = await Thesis.findById(req.params.id);
    if (!thesis) return res.status(404).json({ message: "Thesis not found" });

    const userId = req.user.id;
    const upvoteIndex = thesis.upvotes.findIndex(
      (id) => id.toString() === userId
    );
    const downvoteIndex = thesis.downvotes.findIndex(
      (id) => id.toString() === userId
    );

    // Remove from upvotes if present
    if (upvoteIndex > -1) {
      thesis.upvotes.splice(upvoteIndex, 1);
    }

    // Toggle downvote
    if (downvoteIndex > -1) {
      thesis.downvotes.splice(downvoteIndex, 1);
    } else {
      thesis.downvotes.push(userId);
    }

    await thesis.save();
    res.json({
      upvotes: thesis.upvotes.length,
      downvotes: thesis.downvotes.length,
      userUpvoted: false,
      userDownvoted: downvoteIndex === -1,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

async function addReview(req, res) {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const { comment, rating } = req.body;
    if (!comment || !comment.trim()) {
      return res.status(400).json({ message: "Comment is required" });
    }

    // Validate rating if provided
    const numericRating = rating ? Number(rating) : null;
    if (numericRating !== null && (numericRating < 1 || numericRating > 5)) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    const thesis = await Thesis.findById(req.params.id);
    if (!thesis) return res.status(404).json({ message: "Thesis not found" });

    // Check if user already reviewed, update if so
    const existingReviewIndex = thesis.reviews.findIndex(
      (r) => r.user?.toString() === req.user.id
    );

    if (existingReviewIndex > -1) {
      thesis.reviews[existingReviewIndex].comment = comment.trim();
      thesis.reviews[existingReviewIndex].rating = numericRating;
      thesis.reviews[existingReviewIndex].createdAt = new Date();
    } else {
      thesis.reviews.push({
        user: req.user.id,
        comment: comment.trim(),
        rating: numericRating,
        createdAt: new Date(),
      });
    }

    // Calculate average rating
    const ratingsWithValues = thesis.reviews.filter((r) => r.rating);
    if (ratingsWithValues.length > 0) {
      const sum = ratingsWithValues.reduce((acc, r) => acc + r.rating, 0);
      thesis.averageRating = Math.round((sum / ratingsWithValues.length) * 10) / 10;
    } else {
      thesis.averageRating = 0;
    }

    await thesis.save();
    await thesis.populate("reviews.user", "name");

    res.json(thesis.reviews);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

async function getCitation(req, res) {
  try {
    const thesis = await Thesis.findById(req.params.id)
      .populate("authors", "name")
      .populate("supervisor", "name");

    if (!thesis) return res.status(404).json({ message: "Thesis not found" });

    // Generate APA-style citation
    const authorNames =
      thesis.authors?.map((a) => a.name).join(", ") || "Unknown Author";
    const year = thesis.year || new Date(thesis.createdAt).getFullYear();
    const title = thesis.title || "Untitled";
    const department = thesis.department || "Unknown Department";
    const supervisor = thesis.supervisor?.name
      ? ` Supervisor: ${thesis.supervisor.name}.`
      : "";

    const citation = `${authorNames} (${year}). ${title}. ${department}, BRAC University.${supervisor}`;

    res.json({ citation, thesis });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function incrementDownload(req, res) {
  try {
    const thesis = await Thesis.findById(req.params.id);
    if (!thesis) return res.status(404).json({ message: "Thesis not found" });

    thesis.downloadCount = (thesis.downloadCount || 0) + 1;
    await thesis.save();

    res.json({ downloadCount: thesis.downloadCount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = {
  // Groups
  createGroup,
  listGroups,
  joinGroup,
  // Repository
  listTheses,
  getThesis,
  createThesis,
  searchThesis,
  upvoteThesis,
  downvoteThesis,
  addReview,
  getCitation,
  incrementDownload,
};
