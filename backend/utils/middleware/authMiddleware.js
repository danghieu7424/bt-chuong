const jwt = require("jsonwebtoken");

const auth = (roles = []) => {
  return (req, res, next) => {
    const token = req.cookies?.token; // đọc từ cookie
    if (!token) return res.status(401).json({ message: "Missing token" });

    try {
      const user = jwt.verify(token, "secret_key");
      if (roles.length && !roles.includes(user.role)) {
        return res.status(403).json({ message: "Permission denied" });
      }
      req.user = user;
      next();
    } catch {
      res.status(401).json({ message: "Invalid token" });
    }
  };
};

function authMiddleware(req, res, next) {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ message: "Chưa đăng nhập" });

  try {
    const decoded = jwt.verify(token, "secret_key");
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: "Token không hợp lệ" });
  }
}


module.exports.auth = auth;
module.exports.authMiddleware = authMiddleware;