const express = require("express");
const queryDatabase = require("@mySQLConfig");
const { auth } = require("@auth");

const router = express.Router();

// tạo đề thi
router.post("/dethi", auth(["giaovien"]), async (req, res) => {
  // 1. Lấy 'lop' từ req.body
  const { tieuDe, moTa, lop } = req.body; // 2. Kiểm tra (tùy chọn nhưng nên có)

  if (!tieuDe || !lop) {
    return res.status(400).json({ message: "Tiêu đề và Lớp là bắt buộc" });
  }

  try {
    // 3. Cập nhật câu query
    await queryDatabase(
      "INSERT INTO deThi (tieuDe, moTa, idGiaoVien, lop) VALUES (?, ?, ?, ?)",
      [tieuDe, moTa, req.user.id, lop] // 4. Thêm 'lop' vào mảng
    );
    res.json({ message: "Tạo đề thi thành công" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
});

// tạo câu hỏi cho đề thi
router.post("/cauhoi", auth(["giaovien"]), async (req, res) => {
  const { idDeThi, noiDung, dapAnA, dapAnB, dapAnC, dapAnD, dapAnDung } = req.body;

  if (!idDeThi || !noiDung || !dapAnDung) {
    return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });
  }

  try {
    // Kiểm tra đề thi có thuộc giáo viên đang đăng nhập không
    const check = await queryDatabase(
      "SELECT id FROM deThi WHERE id = ? AND idGiaoVien = ?",
      [idDeThi, req.user.id]
    );
    if (check.length === 0) {
      return res.status(403).json({ message: "Bạn không có quyền thêm câu hỏi vào đề này" });
    }

    await queryDatabase(
      `INSERT INTO cauHoi (idDeThi, noiDung, dapAnA, dapAnB, dapAnC, dapAnD, dapAnDung)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [idDeThi, noiDung, dapAnA, dapAnB, dapAnC, dapAnD, dapAnDung]
    );

    res.json({ message: "✅ Thêm câu hỏi thành công" });
  } catch (err) {
    console.error(err);
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
    await queryDatabase("UPDATE users SET hoTen=?, email=? WHERE id=?", [
      hoTen,
      email,
      req.user.id,
    ]);
    res.json({ message: "Cập nhật thành công" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server" });
  }
});

module.exports = router;
