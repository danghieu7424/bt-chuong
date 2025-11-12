const express = require("express");
const queryDatabase = require("@mySQLConfig");
const { auth } = require("@auth");

const router = express.Router();

// admin có thể chỉnh mọi thông tin
router.put("/updateUser/:id", auth(["admin"]), async (req, res) => {
  const { hoTen, email, role, lop } = req.body;
  try {
    await queryDatabase(
      "UPDATE users SET hoTen=?, email=?, role=?, lop=? WHERE id=?",
      [hoTen, email, role, lop, req.params.id]
    );
    res.json({ message: "Cập nhật thành công" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
});

module.exports = router;
