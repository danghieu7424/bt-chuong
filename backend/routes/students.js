const express = require("express");
const queryDatabase = require("@mySQLConfig");
const { auth, requireRole } = require("@auth"); // Dùng auth middleware

const router = express.Router();

// Tất cả các route ở đây đều yêu cầu đăng nhập
router.use(auth);

// GET /api/students/grades - Lấy điểm của sinh viên (đã đăng nhập)
router.get("/grades", async (req, res) => {
  const studentId = req.user.userId; // Lấy từ token đã giải mã

  try {
    // Truy vấn điểm và thông tin môn học, tính điểm trung bình lớp
    const query = `
      SELECT 
        g.id, 
        g.score_10, 
        s.name AS subject_name,
        (SELECT AVG(g_inner.score_10) 
         FROM Grades g_inner 
         WHERE g_inner.subject_id = g.subject_id) AS class_average
      FROM Grades g
      JOIN Subjects s ON g.subject_id = s.id
      WHERE g.student_id = ?
    `;
    const grades = await queryDatabase(query, [studentId]);
    
    res.status(200).json(grades);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// GET /api/students/profile - Lấy thông tin cá nhân
router.get("/profile", async (req, res) => {
    const userId = req.user.userId;
    try {
        const users = await queryDatabase(
            "SELECT id, username, full_name, email, role FROM Users WHERE id = ?", 
            [userId]
        );
        if (users.length === 0) {
            return res.status(404).json({ message: "Không tìm thấy người dùng" });
        }
        res.status(200).json(users[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Lỗi server" });
    }
});

// PUT /api/students/profile - Cập nhật thông tin cá nhân (chỉ full_name, email)
router.put("/profile", async (req, res) => {
  const userId = req.user.userId;
  const { fullName } = req.body;

  if (!fullName ) {
      return res.status(400).json({ message: "Vui lòng cung cấp đầy đủ thông tin" });
  }
  
  // Sinh viên không được tự ý đổi vai trò hay username
  try {
    await queryDatabase(
      "UPDATE Users SET full_name = ? WHERE id = ?",
      [fullName, userId]
    );
    res.status(200).json({ message: "Cập nhật thông tin thành công" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// GET /api/students/exams - Lấy danh sách bài thi được phép làm
router.get("/exams", async (req, res) => {
  const studentId = req.user.userId;
  try {
    // Lấy các bài thi 'approved' của các môn mà sinh viên này đã đăng ký
    const query = `
      SELECT e.id, e.name, s.name AS subject_name
      FROM Exams e
      JOIN Subjects s ON e.subject_id = s.id
      JOIN Enrollments en ON e.subject_id = en.subject_id
      WHERE en.student_id = ? AND e.status = 'approved'
      -- Thêm điều kiện để đảm bảo sinh viên chưa làm bài thi này (nếu cần)
      -- AND e.id NOT IN (SELECT se.exam_id FROM StudentExams se WHERE se.student_id = ?)
    `;
    const exams = await queryDatabase(query, [studentId]);
    res.status(200).json(exams);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// GET chi tiết bài thi
router.get("/exam/:id", async (req, res) => {
  const studentId = req.user.userId;
  const examId = req.params.id;

  try {
    // Kiểm tra quyền làm bài
    const check = await queryDatabase(
      `SELECT 1 
       FROM Enrollments en
       JOIN Exams e ON en.subject_id = e.subject_id
       WHERE en.student_id = ? AND e.id = ? AND e.status = 'approved'`,
      [studentId, examId]
    );
    if (check.length === 0) return res.status(403).json({ message: "Không có quyền truy cập" });

    // Lấy thông tin exam
    const exam = await queryDatabase(
      "SELECT id, name, subject_id, status FROM Exams WHERE id = ?",
      [examId]
    );
    if (exam.length === 0) return res.status(404).json({ message: "Không tìm thấy bài thi" });

    // Lấy câu hỏi
    const questions = await queryDatabase(
      "SELECT id, question_text AS text, options FROM Questions WHERE exam_id = ?",
      [examId]
    );

    const formattedQuestions = questions.map(q => ({
      id: q.id,
      text: q.text,
      options: JSON.parse(q.options)
    }));

    res.status(200).json({ exam: exam[0], questions: formattedQuestions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// POST nộp bài
router.post("/exam/:id/submit", async (req, res) => {
  const studentId = req.user.userId;
  const examId = req.params.id;
  const { answers } = req.body; // { questionId: selectedOption }

  try {
    // Kiểm tra quyền làm bài
    const check = await queryDatabase(
      `SELECT 1 
       FROM Enrollments en
       JOIN Exams e ON en.subject_id = e.subject_id
       WHERE en.student_id = ? AND e.id = ? AND e.status = 'approved'`,
      [studentId, examId]
    );
    if (check.length === 0) return res.status(403).json({ message: "Không có quyền truy cập" });

    // Tạo record StudentExams
    const studentExamId = `se_${Date.now()}`;
    await queryDatabase(
      "INSERT INTO StudentExams (id, student_id, exam_id, start_time, is_submitted) VALUES (?, ?, ?, NOW(), TRUE)",
      [studentExamId, studentId, examId]
    );

    // Lưu câu trả lời
    const insertAnswers = Object.entries(answers).map(([questionId, answer]) =>
      queryDatabase(
        "INSERT INTO StudentAnswers (id, student_exam_id, question_id, student_answer) VALUES (?, ?, ?, ?)",
        [`sa_${Date.now()}_${questionId}`, studentExamId, questionId, answer]
      )
    );
    await Promise.all(insertAnswers);

    res.status(200).json({ message: "Nộp bài thành công" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
});


// ... Thêm các route cho việc LÀM BÀI THI (GET /exam/:id, POST /exam/submit) ...

module.exports = router;