const express = require("express");
const queryDatabase = require("@mySQLConfig");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {authMiddleware} = require("@auth");

const router = express.Router();

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await queryDatabase("SELECT * FROM users WHERE username = ?", [username]);
    if (result.length === 0) return res.status(404).json({ message: "User not found" });

    const user = result[0];
    const match = await bcrypt.compare(password.trim(), user.password);
    if (!match) return res.status(401).json({ message: "Wrong password" });

    const token = jwt.sign(
      { id: user.id, role: user.role, hoTen: user.hoTen },
      "secret_key",
      { expiresIn: "1d" }
    );

    // Lưu token vào cookie
    res.cookie("token", token, {
      httpOnly: true,   // JS frontend không đọc được
      secure: process.env.NODE_ENV === "production", // chỉ HTTPS trên production
      maxAge: 24 * 60 * 60 * 1000, // 1 ngày
      sameSite: "lax",  // chống CSRF cơ bản
    });

    // Trả thông tin user không bao gồm token nữa
    res.json({ role: user.role, username: user.username, hoTen: user.hoTen });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
});

// Logout xóa cookie
router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.json({ message: "Đăng xuất thành công" });
});

router.get("/me", authMiddleware, (req, res) => {
  res.json({
    id: req.user.id,
    username: req.user.username,
    role: req.user.role,
    hoTen: req.user.hoTen,
  });
});


module.exports = router;
