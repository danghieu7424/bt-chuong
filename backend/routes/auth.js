const express = require("express");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs'); // Thư viện để hash và so sánh mật khẩu
const queryDatabase = require("@mySQLConfig");

const router = express.Router();

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Vui lòng cung cấp tên đăng nhập và mật khẩu" });
  }

  try {
    // 1. Tìm người dùng trong CSDL
    const users = await queryDatabase(
      "SELECT * FROM Users WHERE username = ?",
      [username]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: "Tên đăng nhập hoặc mật khẩu không đúng" });
    }

    const user = users[0];

    // 2. So sánh mật khẩu (Trong thực tế, user.password_hash đã được hash)
    // const isMatch = await bcrypt.compare(password, user.password_hash);
    
    // --- BỎ QUA BCRYPT TRONG BẢN DEMO NÀY VÌ CẦN HASH THẬT ---
    // Giả sử mật khẩu là 'password' cho bản demo
    const isMatch = (password === 'password'); 
    // --- KẾT THÚC BỎ QUA ---

    if (!isMatch) {
      return res.status(401).json({ message: "Tên đăng nhập hoặc mật khẩu không đúng" });
    }

    // 3. Tạo JSON Web Token (JWT)
    const tokenPayload = {
      userId: user.id,
      username: user.username,
      role: user.role
    };
    
    const token = jwt.sign(
      tokenPayload,
       process.env.SECRET_KEY,
      { expiresIn: '1h' } // Token hết hạn sau 1 giờ
    );

    // 4. Trả về token và thông tin người dùng (trừ mật khẩu)
    res.status(200).json({
      message: "Đăng nhập thành công",
      token: token,
      user: {
        id: user.id,
        username: user.username,
        fullName: user.full_name,
        role: user.role
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

module.exports = router;