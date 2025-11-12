const express = require("express");
const queryDatabase = require("@mySQLConfig");
const { auth } = require("@auth");

const router = express.Router();

// xem điểm
router.get("/diem", auth(["sinhvien"]), async (req, res) => {
  const id = req.user.id;
  try {
    const results = await queryDatabase(
      "SELECT deThi.tieuDe, diem.diem, diem.ngayLam FROM diem JOIN deThi ON diem.idDeThi = deThi.id WHERE idSinhVien = ?",
    [id]
    );
    res.json(results);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
});

// cập nhật thông tin cá nhân
router.put("/update", auth(["sinhvien"]), async (req, res) => {
  const { hoTen, email, lop } = req.body;
  try {
    await queryDatabase(
      "UPDATE users SET hoTen=?, email=?, lop=? WHERE id=?",
      [hoTen, email, lop, req.user.id]
    );
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
});

module.exports = router;