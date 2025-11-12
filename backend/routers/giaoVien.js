const express = require("express");
const queryDatabase = require("@mySQLConfig");
const { auth } = require("@auth");

const router = express.Router();

// tạo đề thi
router.post("/dethi", auth(["giaovien"]), async (req, res) => {
  const { tieuDe, moTa } = req.body;
  try {
    await queryDatabase(
      "INSERT INTO deThi (tieuDe, moTa, idGiaoVien) VALUES (?, ?, ?)",
      [tieuDe, moTa, req.user.id]
    );
    res.json({ message: "Tạo đề thi thành công" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
});

// xem điểm của lớp
router.get("/diemlop", auth(["giaovien"]), async (req, res) => {
  try {
    const diemLop = await queryDatabase(
      `
    SELECT u.lop, u.hoTen, d.diem, dt.tieuDe
    FROM diem d
    JOIN users u ON d.idSinhVien = u.id
    JOIN deThi dt ON d.idDeThi = dt.id
    WHERE dt.idGiaoVien = ?`,
      [req.user.id]
    );
    res.json(diemLop);
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
});

// cập nhật thông tin cá nhân
router.put("/update", auth(["giaovien"]), async (req, res) => {
  const { hoTen, email } = req.body;
  try {
    await queryDatabase(
      "UPDATE users SET hoTen=?, email=? WHERE id=?",
      [hoTen, email, req.user.id]
    );
    res.json({ message: "Cập nhật thành công" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
});

module.exports = router;