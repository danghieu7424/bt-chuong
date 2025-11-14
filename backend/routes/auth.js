const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const queryDatabase = require("@mySQLConfig");
const { auth, requireRole } = require("@auth")

const router = express.Router();

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Vui lòng cung cấp tên đăng nhập và mật khẩu" });
  }

  try {
    // ... (Phần 1. Tìm người dùng - không đổi) ...
    const users = await queryDatabase(
      "SELECT * FROM Users WHERE username = ?",
      [username]
    );
    if (users.length === 0) {
      return res
        .status(401)
        .json({ message: "Tên đăng nhập hoặc mật khẩu không đúng" });
    }
    const user = users[0];

    // ... (Phần 2. So sánh mật khẩu - không đổi) ...
    // const isMatch = await bcrypt.compare(password, user.password_hash);
    const isMatch = password === user.password_hash;

    if (!isMatch) {
      return res
        .status(401)
        .json({ message: "Tên đăng nhập hoặc mật khẩu không đúng" });
    }

    // 3. Tạo JSON Web Token (JWT)
    const tokenPayload = {
      userId: user.id,
      username: user.username,
      role: user.role,
    };

    const token = jwt.sign(
      tokenPayload,
      process.env.SECRET_KEY,
      { expiresIn: "1h" } // Token hết hạn sau 1 giờ
    );

    // 4. *** THAY ĐỔI QUAN TRỌNG: Gửi Token qua Cookie ***
    const cookieOptions = {
      httpOnly: true, // Ngăn JavaScript phía client đọc cookie
      secure: process.env.NODE_ENV === "production", // Chỉ gửi qua HTTPS khi ở môi trường production
      sameSite: "lax", // 'lax' hoặc 'strict' để chống CSRF. 'lax' là lựa chọn cân bằng.
      maxAge: 1 * 60 * 60 * 1000, // 1 giờ (tính bằng mili giây), phải khớp với 'expiresIn'
    };

    res.cookie("token", token, cookieOptions);

    // 5. Trả về thông tin (không cần trả token trong body nữa)
    await queryDatabase(
      "SELECT id, username, full_name, email, role, birthday, address, class_name FROM Users WHERE id = ?",
      [user.id]
    )
      .then((users) => {
        if (users.length === 0)
          return res.status(404).json({ message: "Người dùng không tồn tại" });
        const user = users[0];
        res.status(200).json({
          message: "Đăng nhập thành công",
          // Không cần gửi token ở đây nữa vì nó đã ở trong cookie
          user: {
            id: user.id,
            username: user.username,
            fullName: user.full_name,
            email: user.email,
            role: user.role,
            birthday: user.birthday,
            address: user.address,
            className: user.class_name,
          },
        });
      })
      .catch((err) => {
        console.error(err);
        res.status(500).json({ message: "Lỗi server" });
      });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// GET /api/auth/me
router.get("/me", async (req, res) => {
  const token = req.cookies.token; // đọc token từ cookie

  if (!token) {
    return res.status(401).json({ message: "Chưa đăng nhập" });
  }

  try {
    // Giải mã token
    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    // Nếu muốn, có thể lấy thêm thông tin user từ database
    await queryDatabase(
      "SELECT id, username, full_name, email, role, birthday, address, class_name FROM Users WHERE id = ?",
      [decoded.userId]
    )
      .then((users) => {
        if (users.length === 0)
          return res.status(404).json({ message: "Người dùng không tồn tại" });
        const user = users[0];
        res.status(200).json({
          id: user.id,
          username: user.username,
          fullName: user.full_name,
          email: user.email,
          role: user.role,
          birthday: user.birthday,
          address: user.address,
          className: user.class_name,
        });
      })
      .catch((err) => {
        console.error(err);
        res.status(500).json({ message: "Lỗi server" });
      });
  } catch (err) {
    console.error(err);
    return res.status(401).json({ message: "Token không hợp lệ hoặc hết hạn" });
  }
});

// *** THÊM MỚI: Route để Đăng xuất ***
// POST /api/auth/logout
router.post("/logout", (req, res) => {
  // Gửi lại các tùy chọn giống hệt lúc tạo cookie
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  };

  // Xóa cookie bằng cách ghi đè nó với giá trị rỗng và maxAge = 0
  res.cookie("token", "", { ...cookieOptions, maxAge: 0 });

  res.status(200).json({ message: "Đăng xuất thành công" });
});

router.put("/change-password",auth, async (req, res) => {
  const userId = req.user.userId;
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return res.status(400).json({ message: "Thiếu dữ liệu" });
  }

  try {
    const user = await queryDatabase(
      "SELECT password_hash FROM Users WHERE id = ?",
      [userId]
    );

    if (user.length === 0)
      return res.status(404).json({ message: "Không tồn tại tài khoản" });

    // const valid = await bcrypt.compare(oldPassword, user[0].password_hash);
    const valid = oldPassword === user[0].password_hash

    if (!valid)
      return res.status(400).json({ message: "Mật khẩu cũ không đúng" });

    // const hashed = await bcrypt.hash(newPassword, 10);
    const hashed = newPassword


    await queryDatabase("UPDATE Users SET password_hash = ? WHERE id = ?", [
      hashed,
      userId,
    ]);

    res.status(200).json({ message: "Đổi mật khẩu thành công" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

module.exports = router;
