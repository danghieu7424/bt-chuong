const jwt = require('jsonwebtoken');

// Middleware để xác thực token
const auth = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1]; // "Bearer TOKEN"
    if (!token) {
      return res.status(401).json({ message: 'Yêu cầu xác thực không hợp lệ (không có token)' });
    }

    // Xác thực token
    const decodedToken = jwt.verify(token,   process.env.SECRET_KEY);
    
    // Gắn thông tin người dùng đã giải mã vào request
    req.user = decodedToken; // Ví dụ: { userId: 'sv1', role: 'student', iat: ..., exp: ... }
    
    next(); // Đi tiếp
  } catch (error) {
    res.status(401).json({ message: 'Yêu cầu xác thực không hợp lệ' });
  }
};

// Middleware để kiểm tra vai trò (ví dụ: chỉ cho phép Admin)
const requireRole = (role) => {
  return (req, res, next) => {
    if (req.user && req.user.role === role) {
      next();
    } else {
      res.status(403).json({ message: 'Không có quyền truy cập' });
    }
  };
};

module.exports.auth = auth;
module.exports.requireRole = requireRole;