// Lightweight, header-based auth helpers (no JWT verification)
// Expects clients to send x-user-id and x-user-role headers.

function attachUser(req, _res, next) {
  const id = req.header("x-user-id");
  const role = req.header("x-user-role");
  if (id) {
    req.user = { id, role: role || "student" };
  }
  next();
}

function requireUser(req, res, next) {
  if (!req.user || !req.user.id) {
    return res.status(401).json({ message: "Authentication required" });
  }
  return next();
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Authentication required" });
    }
    if (!req.user.role || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Forbidden" });
    }
    return next();
  };
}

module.exports = { attachUser, requireUser, requireRole };
