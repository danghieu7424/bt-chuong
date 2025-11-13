const express = require("express");
const queryDatabase = require("@mySQLConfig");
const { auth, requireRole } = require("@auth");

const router = express.Router();

// Yêu cầu đăng nhập và phải là giáo viên
router.use(auth);
router.use(requireRole('teacher')); // Chỉ giáo viên mới truy cập được

// GET /api/teachers/class-grades - Xem toàn bộ điểm lớp
router.get("/class-grades", async (req, res) => {
  const teacherId = req.user.userId;
  try {
    // Lấy điểm của các sinh viên trong các môn học mà giáo viên này dạy
    const query = `
      SELECT g.id, u.full_name AS student_name, s.name AS subject_name, g.score_10
      FROM Grades g
      JOIN Users u ON g.student_id = u.id
      JOIN Subjects s ON g.subject_id = s.id
      JOIN TeacherSubjects ts ON g.subject_id = ts.subject_id
      WHERE ts.teacher_id = ?
    `;
    // Lưu ý: Cần sắp xếp
    const grades = await queryDatabase(query, [teacherId]);
    res.status(200).json(grades);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// GET /api/teachers/failing-students - Xem danh sách thi không đạt
router.get("/failing-students", async (req, res) => {
  const teacherId = req.user.userId;
  const failingThreshold = 4.0; // Ngưỡng không đạt

  try {
    const query = `
      SELECT g.id, u.full_name AS student_name, s.name AS subject_name, g.score_10
      FROM Grades g
      JOIN Users u ON g.student_id = u.id
      JOIN Subjects s ON g.subject_id = s.id
      JOIN TeacherSubjects ts ON g.subject_id = ts.subject_id
      WHERE ts.teacher_id = ? AND g.score_10 < ?
    `;
    const grades = await queryDatabase(query, [teacherId, failingThreshold]);
    res.status(200).json(grades);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// POST /api/teachers/exams - Tạo tập đề theo môn dạy
router.post("/exams", async (req, res) => {
  const teacherId = req.user.userId;
  const { name, subjectId, questions } = req.body; // questions là một mảng

  if (!name || !subjectId || !questions || !Array.isArray(questions) || questions.length === 0) {
    return res.status(400).json({ message: "Thông tin đề thi không hợp lệ" });
  }

  try {
    // 1. Kiểm tra xem giáo viên có dạy môn này không
    const teachingSubjects = await queryDatabase(
      "SELECT * FROM TeacherSubjects WHERE teacher_id = ? AND subject_id = ?",
      [teacherId, subjectId]
    );
    
    if (teachingSubjects.length === 0) {
        return res.status(403).json({ message: "Bạn không được phép tạo đề thi cho môn này" });
    }

    // 2. Tạo đề thi (status mặc định là 'pending')
    const newExamId = `exam_${Date.now()}`; // Tạo ID tạm thời
    await queryDatabase(
      "INSERT INTO Exams (id, name, subject_id, creator_id, status) VALUES (?, ?, ?, ?, 'pending')",
      [newExamId, name, subjectId, teacherId]
    );

    // 3. Thêm các câu hỏi vào CSDL (cần xử lý transaction ở đây)
    for (const q of questions) {
        const newQuestionId = `q_${Date.now()}_${Math.random()}`;
        await queryDatabase(
            "INSERT INTO Questions (id, exam_id, question_text, options, correct_answer) VALUES (?, ?, ?, ?, ?)",
            [newQuestionId, newExamId, q.text, JSON.stringify(q.options), q.answer]
        );
    }

    res.status(201).json({ message: "Đã gửi đề thi chờ phê duyệt", examId: newExamId });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// ... Thêm route cho việc chỉnh sửa thông tin cá nhân của giáo viên (tương tự sinh viên) ...

module.exports = router;