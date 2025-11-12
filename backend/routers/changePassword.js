const express = require("express");
const queryDatabase = require("@mySQLConfig");
const bcrypt = require("bcryptjs");
const { auth } = require("@auth");

const router = express.Router();

/**
 * Đổi mật khẩu
 * - Sinh viên / Giảng viên: cần nhập mật khẩu cũ để xác thực
 * - Admin: đổi không cần mật khẩu cũ
 */
router.post("/change-password", auth(["admin", "giaovien", "sinhvien"]), async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const userId = req.user.id;
  const role = req.user.role;

  try {
    // Lấy thông tin người dùng
    const result = await queryDatabase("SELECT * FROM users WHERE id = ?", [userId]);
    if (result.length === 0) return res.status(404).json({ message: "Không tìm thấy người dùng" });

    const user = result[0];

    // Nếu không phải admin => kiểm tra mật khẩu cũ
    if (role !== "admin") {
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) return res.status(400).json({ message: "Mật khẩu cũ không đúng" });
    }

    // Mã hóa mật khẩu mới
    const hash = await bcrypt.hash(newPassword, 10);

    // Cập nhật DB
    await queryDatabase("UPDATE users SET password = ? WHERE id = ?", [hash, userId]);
    res.json({ message: "Đổi mật khẩu thành công" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

module.exports = router;
