const jwt = require("jsonwebtoken");
const secretKey = "project@shareMyRide";

// Define tokenBlacklist (could also be imported from another file)
const tokenBlacklist = new Set();

function verifyToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(403).json({ error: "Token not available" });
    }

    const token = authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : authHeader;

    if (tokenBlacklist.has(token)) {
      return res.status(401).json({ message: "Token has been invalidated" });
    }

    jwt.verify(token, secretKey, (err, decoded) => {
      if (err) {
        return res.status(401).json({ error: "Invalid token" });
      }

      req.user = { id: decoded.userId || decoded.id };
      next();
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// Export both the middleware and the blacklist to be used in logout function
module.exports = {
  verifyToken,
  tokenBlacklist,
};
