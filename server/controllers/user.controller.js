const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

function signToken(user) {
  return jwt.sign(
    { id: user._id, role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

exports.register = async (req, res) => {
  try {
    const { name, email, password, department, batch, role } = req.body;

    if (!name || !email || !password || !department || !batch) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: "Email already registered." });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashed,
      department,
      batch,
      role: role || "student",
    });

    const token = signToken(user);

    return res.status(201).json({
      message: "Registered successfully ✅",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        batch: user.batch,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+password"
    );

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = signToken(user);

    return res.json({
      message: "Login successful ✅",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        batch: user.batch,
      },
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.getMe = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Authentication required" });
    }
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      batch: user.batch,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

async function updateProfileFields(targetId, body, actingUser) {
  const allowed = {};
  ["name", "department", "batch"].forEach((key) => {
    if (body[key]) allowed[key] = body[key];
  });
  if (Object.keys(allowed).length === 0) {
    const target = await User.findById(targetId);
    return target;
  }
  return User.findByIdAndUpdate(targetId, allowed, {
    new: true,
    runValidators: true,
  });
}

exports.updateMe = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Authentication required" });
    }
    const updated = await updateProfileFields(req.user.id, req.body, req.user);
    if (!updated) return res.status(404).json({ message: "User not found" });
    return res.json({
      id: updated._id,
      name: updated.name,
      email: updated.email,
      role: updated.role,
      department: updated.department,
      batch: updated.batch,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

exports.updateUserById = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Authentication required" });
    }
    const targetId = req.params.id;
    const isSelf = req.user.id === targetId;
    const isAdmin = req.user.role === "admin";
    if (!isSelf && !isAdmin) {
      return res.status(403).json({ message: "Forbidden" });
    }
    const updated = await updateProfileFields(targetId, req.body, req.user);
    if (!updated) return res.status(404).json({ message: "User not found" });
    return res.json({
      id: updated._id,
      name: updated.name,
      email: updated.email,
      role: updated.role,
      department: updated.department,
      batch: updated.batch,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
