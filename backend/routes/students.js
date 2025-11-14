const express = require("express");
const bcrypt = require("bcryptjs");
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
      "SELECT id, username, full_name as fullName, email, role, birthday, address, class_name FROM Users WHERE id = ?",
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
  const { fullName, birthday, address, className, email } = req.body;

  if (!fullName) {
    return res.status(400).json({ message: "Thiếu họ tên" });
  }

  try {
    await queryDatabase(
      `UPDATE Users SET 
        full_name = ?, 
        birthday = ?, 
        address = ?, 
        class_name = ?, 
        email = ?
       WHERE id = ?`,
      [fullName, birthday, address, className, email, userId]
    );

    res.status(200).json({ message: "Cập nhật thông tin thành công" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
});

// GET /api/students/exams - Lấy danh sách bài thi được phép làm và chưa làm
router.get("/exams", async (req, res) => {
  const studentId = req.user.userId;
  try {
    const query = `
      SELECT e.id, e.name, s.name AS subject_name
      FROM Exams e
      JOIN Subjects s ON e.subject_id = s.id
      JOIN Enrollments en ON e.subject_id = en.subject_id
      LEFT JOIN StudentExams se 
        ON se.exam_id = e.id AND se.student_id = ?
      WHERE en.student_id = ? 
        AND e.status = 'approved'
        AND se.id IS NULL  -- Chỉ lấy các bài chưa làm
    `;
    const exams = await queryDatabase(query, [studentId, studentId]);
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
    if (check.length === 0)
      return res.status(403).json({ message: "Không có quyền truy cập" });

    // Lấy thông tin exam
    const exam = await queryDatabase(
      "SELECT id, name, subject_id, status FROM Exams WHERE id = ?",
      [examId]
    );

    if (exam.length === 0)
      return res.status(404).json({ message: "Không tìm thấy bài thi" });

    // Lấy câu hỏi
    const questions = await queryDatabase(
      "SELECT id, question_text AS text, options FROM Questions WHERE exam_id = ?",
      [examId]
    );

    const formattedQuestions = questions.map((q) => ({
      id: q.id,
      text: q.text,
      options: JSON.parse(q.options),
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
    // 1. Kiểm tra quyền làm bài
    const check = await queryDatabase(
      `SELECT 1 
       FROM Enrollments en
       JOIN Exams e ON en.subject_id = e.subject_id
       WHERE en.student_id = ? AND e.id = ? AND e.status = 'approved'`,
      [studentId, examId]
    );
    if (check.length === 0)
      return res.status(403).json({ message: "Không có quyền truy cập" });

    // 2. Lưu lần làm bài
    const studentExamId = `se_${Date.now()}`;
    await queryDatabase(
      "INSERT INTO StudentExams (id, student_id, exam_id, start_time, end_time, is_submitted) VALUES (?, ?, ?, NOW(), NOW(), TRUE)",
      [studentExamId, studentId, examId]
    );

    // 3. Lấy câu hỏi + đáp án đúng
    const questions = await queryDatabase(
      `SELECT q.id AS question_id, q.correct_answer, e.subject_id
       FROM Questions q
       JOIN Exams e ON q.exam_id = e.id
       WHERE q.exam_id = ?`,
      [examId]
    );

    if (questions.length === 0)
      return res.status(400).json({ message: "Bài thi chưa có câu hỏi" });

    // 4. Tính điểm
    let score = 0;
    questions.forEach((q) => {
      if (answers[q.question_id] && answers[q.question_id] === q.correct_answer) {
        score += 10 / questions.length; // quy về thang điểm 10
      }
    });
    score = Math.round(score * 100) / 100; // làm tròn 2 chữ số

    // 5. Lưu câu trả lời chi tiết
    const insertAnswers = Object.entries(answers).map(([questionId, answer]) =>
      queryDatabase(
        "INSERT INTO StudentAnswers (id, student_exam_id, question_id, student_answer) VALUES (?, ?, ?, ?)",
        [`sa_${Date.now()}_${questionId}`, studentExamId, questionId, answer]
      )
    );
    await Promise.all(insertAnswers);

    // 6. Lưu điểm vào Grades (nếu chưa có điểm cho môn này)
    const subjectId = questions[0].subject_id;
    const existingGrade = await queryDatabase(
      "SELECT 1 FROM Grades WHERE student_id = ? AND subject_id = ?",
      [studentId, subjectId]
    );

    if (existingGrade.length === 0) {
      const gradeId = `g_${Date.now()}`;
      await queryDatabase(
        "INSERT INTO Grades (id, student_id, subject_id, score_10, exam_date) VALUES (?, ?, ?, ?, CURDATE())",
        [gradeId, studentId, subjectId, score]
      );
    } else {
      // nếu đã có điểm, cập nhật lại điểm mới (nếu muốn)
      await queryDatabase(
        "UPDATE Grades SET score_10 = ?, exam_date = CURDATE() WHERE student_id = ? AND subject_id = ?",
        [score, studentId, subjectId]
      );
    }

    res.status(200).json({ message: "Nộp bài thành công", score });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Lỗi server" });
  }
});


// ... Thêm các route cho việc LÀM BÀI THI (GET /exam/:id, POST /exam/submit) ...

module.exports = router;
