const express = require("express");
const queryDatabase = require("@mySQLConfig");
const { auth, requireRole } = require("@auth");

const router = express.Router();

// Yêu cầu đăng nhập và phải là ADMIN
router.use(auth);
router.use(requireRole('admin'));

// GET /api/admin/users - Admin xem toàn bộ người dùng
router.get("/users", async (req, res) => {
  try {
    const users = await queryDatabase(
      "SELECT id, username, full_name, email, role, birthday, address, class_name FROM Users",
      []
    );
   
    res.status(200).json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// PUT /api/admin/users/:id - Admin chỉnh sửa thông tin toàn bộ
router.put("/users/:id", async (req, res) => {
  const userIdToEdit = req.params.id;
  const { fullName, role, birthday, address, className, email } = req.body;

  if (!fullName || !role) {
    return res.status(400).json({ message: "Thiếu dữ liệu" });
  }

  try {
    await queryDatabase(
      `UPDATE Users SET 
        full_name = ?, 
        role = ?, 
        birthday = ?, 
        address = ?, 
        class_name = ?, 
        email = ?
      WHERE id = ?`,
      [fullName, role, birthday, address, className, email, userIdToEdit]
    );

    res.status(200).json({ message: "Cập nhật người dùng thành công" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
});


// GET /api/admin/pending-exams - Admin xem các đề thi chờ duyệt
router.get("/pending-exams", async (req, res) => {
  try {
    const query = `
      SELECT e.id, e.name, s.name AS subject_name, u.full_name AS creator_name
      FROM Exams e
      JOIN Subjects s ON e.subject_id = s.id
      JOIN Users u ON e.creator_id = u.id
      WHERE e.status = 'pending'
    `;
    const exams = await queryDatabase(query, []);
    res.status(200).json(exams);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// PUT /api/admin/exams/approve/:id - Admin phê duyệt hoặc từ chối đề thi
router.put("/exams/approve/:id", async (req, res) => {
  const examId = req.params.id;
  const { status } = req.body; // 'approved' hoặc 'rejected'

  if (!status || (status !== 'approved' && status !== 'rejected')) {
    return res.status(400).json({ message: "Trạng thái không hợp lệ" });
  }

  try {
    await queryDatabase(
      "UPDATE Exams SET status = ? WHERE id = ?",
      [status, examId]
    );
    res.status(200).json({ message: `Đã ${status === 'approved' ? 'phê duyệt' : 'từ chối'} đề thi` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

module.exports = router;