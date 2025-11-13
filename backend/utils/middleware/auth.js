const jwt = require('jsonwebtoken');

// Middleware để xác thực token
const auth = (req, res, next) => {
  try {
    let token = null;

    // 1. Ưu tiên kiểm tra 'Authorization' header (dùng cho Postman/Mobile App)
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } 
    // 2. Nếu không có header, kiểm tra cookie (dùng cho Web Browser)
    else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    // 3. Nếu không tìm thấy token ở cả hai nơi
    if (!token) {
      return res.status(401).json({ message: 'Yêu cầu xác thực không hợp lệ (không có token)' });
    }

    // 4. Xác thực token
    const decodedToken = jwt.verify(token, process.env.SECRET_KEY);
    
    // 5. Gắn thông tin người dùng đã giải mã vào request
    req.user = decodedToken; // Ví dụ: { userId: 'sv1', role: 'student', ... }
    
    next(); // Đi tiếp
  } catch (error) {
    // Lỗi nếu token không hợp lệ hoặc hết hạn
    res.status(401).json({ message: 'Yêu cầu xác thực không hợp lệ (token sai hoặc hết hạn)' });
  }
};

// Middleware để kiểm tra vai trò (Không cần thay đổi)
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