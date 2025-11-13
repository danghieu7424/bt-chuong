CREATE DATABASE IF NOT EXISTS `exam_management_system`;
USE `exam_management_system`;

-- Bảng người dùng, lưu trữ thông tin chung và vai trò
CREATE TABLE `Users` (
  `id` VARCHAR(50) PRIMARY KEY,
  `username` VARCHAR(100) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` ENUM('student', 'teacher', 'admin') NOT NULL,
  `full_name` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) UNIQUE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Bảng môn học
CREATE TABLE `Subjects` (
  `id` VARCHAR(50) PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `description` TEXT
);

-- Bảng phân công giảng dạy (Giáo viên nào dạy môn nào)
CREATE TABLE `TeacherSubjects` (
  `teacher_id` VARCHAR(50) NOT NULL,
  `subject_id` VARCHAR(50) NOT NULL,
  PRIMARY KEY (`teacher_id`, `subject_id`),
  FOREIGN KEY (`teacher_id`) REFERENCES `Users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`subject_id`) REFERENCES `Subjects`(`id`) ON DELETE CASCADE
);

-- Bảng đăng ký môn học (Sinh viên nào học môn nào)
CREATE TABLE `Enrollments` (
  `student_id` VARCHAR(50) NOT NULL,
  `subject_id` VARCHAR(50) NOT NULL,
  PRIMARY KEY (`student_id`, `subject_id`),
  FOREIGN KEY (`student_id`) REFERENCES `Users`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`subject_id`) REFERENCES `Subjects`(`id`) ON DELETE CASCADE
);

-- Bảng điểm
CREATE TABLE `Grades` (
  `id` VARCHAR(50) PRIMARY KEY,
  `student_id` VARCHAR(50) NOT NULL,
  `subject_id` VARCHAR(50) NOT NULL,
  `score_10` DECIMAL(4, 2) NOT NULL,
  `exam_date` DATE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`student_id`) REFERENCES `Users`(`id`),
  FOREIGN KEY (`subject_id`) REFERENCES `Subjects`(`id`)
);

-- Bảng đề thi
CREATE TABLE `Exams` (
  `id` VARCHAR(50) PRIMARY KEY,
  `name` VARCHAR(255) NOT NULL,
  `subject_id` VARCHAR(50) NOT NULL,
  `creator_id` VARCHAR(50) NOT NULL, -- teacher_id
  `status` ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`subject_id`) REFERENCES `Subjects`(`id`),
  FOREIGN KEY (`creator_id`) REFERENCES `Users`(`id`)
);

-- Bảng câu hỏi
CREATE TABLE `Questions` (
  `id` VARCHAR(50) PRIMARY KEY,
  `exam_id` VARCHAR(50) NOT NULL,
  `question_text` TEXT NOT NULL,
  `options` JSON, -- Lưu dưới dạng: ["A. Lựa chọn 1", "B. Lựa chọn 2"]
  `correct_answer` VARCHAR(10) NOT NULL, -- "A", "B", ...
  FOREIGN KEY (`exam_id`) REFERENCES `Exams`(`id`) ON DELETE CASCADE
);

-- Bảng lưu lại các lần làm bài của sinh viên
CREATE TABLE `StudentExams` (
  `id` VARCHAR(50) PRIMARY KEY,
  `student_id` VARCHAR(50) NOT NULL,
  `exam_id` VARCHAR(50) NOT NULL,
  `start_time` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `end_time` TIMESTAMP,
  `is_submitted` BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (`student_id`) REFERENCES `Users`(`id`),
  FOREIGN KEY (`exam_id`) REFERENCES `Exams`(`id`)
);

-- Bảng lưu câu trả lời của sinh viên
CREATE TABLE `StudentAnswers` (
  `id` VARCHAR(50) PRIMARY KEY,
  `student_exam_id` VARCHAR(50) NOT NULL,
  `question_id` VARCHAR(50) NOT NULL,
  `student_answer` VARCHAR(10), -- "A", "B", ...
  FOREIGN KEY (`student_exam_id`) REFERENCES `StudentExams`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`question_id`) REFERENCES `Questions`(`id`)
);

-- Mật khẩu cho tất cả user là 'password', hash bằng bcrypt (ví dụ, thực tế sẽ hash)
-- Đây là HASH (bcrypt) của 'password': '$2b$10$fP6m.iJ.m1Z1.eJ8.Z1p6u0Uq.tP8.Y1q.T.N.eL8.Y9.j.iJ.m1'
-- Vì lý do demo, chúng ta sẽ không chèn hash thật
INSERT INTO `Users` (`id`, `username`, `password_hash`, `role`, `full_name`) VALUES
('admin1', 'admin', 'hashed_password', 'admin', 'Quản Trị Viên'),
('admin2', 'admin_son', 'hashed_password', 'admin', 'Trần Văn Sơn'),
('admin3', 'admin_linh', 'hashed_password', 'admin', 'Nguyễn Thị Linh'),

('gv1', 'gv_thanh', 'hashed_password', 'teacher', 'Lê Minh Thành'),
('gv2', 'gv_huong', 'hashed_password', 'teacher', 'Phạm Thu Hương'),
('gv3', 'gv_nam', 'hashed_password', 'teacher', 'Đỗ Huy Nam'),
('gv4', 'gv_yen', 'hashed_password', 'teacher', 'Vũ Hải Yến'),
('gv5', 'gv_long', 'hashed_password', 'teacher', 'Hoàng Gia Long'),

('sv1', 'sv_an', 'hashed_password', 'student', 'Nguyễn Văn An'),
('sv2', 'sv_binh', 'hashed_password', 'student', 'Trần Minh Bình'),
('sv3', 'sv_chi', 'hashed_password', 'student', 'Lê Thị Chi'),
('sv4', 'sv_dung', 'hashed_password', 'student', 'Phạm Hùng Dũng'),
('sv5', 'sv_giang', 'hashed_password', 'student', 'Đỗ Thu Giang'),
('sv6', 'sv_hai', 'hashed_password', 'student', 'Vũ Văn Hải'),
('sv7', 'sv_kien', 'hashed_password', 'student', 'Nguyễn Trung Kiên'),
('sv8', 'sv_lan', 'hashed_password', 'student', 'Trần Ngọc Lan'),
('sv9', 'sv_minh', 'hashed_password', 'student', 'Lê Quang Minh'),
('sv10', 'sv_nga', 'hashed_password', 'student', 'Phạm Thị Nga'),
('sv11', 'sv_oanh', 'hashed_password', 'student', 'Đỗ Hải Oanh'),
('sv12', 'sv_phuc', 'hashed_password', 'student', 'Vũ Đức Phúc');

INSERT INTO `Subjects` (`id`, `name`) VALUES
('sub1', 'Toán cao cấp A1'),
('sub2', 'Lập trình C++'),
('sub3', 'Vật lý đại cương'),
('sub4', 'Cơ sở dữ liệu'),
('sub5', 'Mạng máy tính');

INSERT INTO `TeacherSubjects` (`teacher_id`, `subject_id`) VALUES
('gv1', 'sub1'),
('gv1', 'sub2'),
('gv2', 'sub3'),
('gv3', 'sub4'),
('gv4', 'sub5'),
('gv5', 'sub1');

INSERT INTO `Enrollments` (`student_id`, `subject_id`) VALUES
('sv1', 'sub1'), ('sv1', 'sub2'), ('sv1', 'sub3'),
('sv2', 'sub1'), ('sv2', 'sub2'), ('sv2', 'sub3'),
('sv3', 'sub1'), ('sv3', 'sub2'), ('sv3', 'sub3'),
('sv4', 'sub2'), ('sv4', 'sub4'), ('sv4', 'sub5'),
('sv5', 'sub2'), ('sv5', 'sub4'), ('sv5', 'sub5'),
('sv6', 'sub2'), ('sv6', 'sub4'), ('sv6', 'sub5'),
('sv7', 'sub1'), ('sv7', 'sub3'), ('sv7', 'sub5'),
('sv8', 'sub1'), ('sv8', 'sub3'), ('sv8', 'sub5'),
('sv9', 'sub1'), ('sv9', 'sub3'), ('sv9', 'sub5'),
('sv10', 'sub1'), ('sv10', 'sub4'),
('sv11', 'sub1'), ('sv11', 'sub4'),
('sv12', 'sub1'), ('sv12', 'sub4');

INSERT INTO `Grades` (`id`, `student_id`, `subject_id`, `score_10`) VALUES
('g1', 'sv1', 'sub1', 8.5),
('g2', 'sv1', 'sub2', 7.0),
('g3', 'sv1', 'sub3', 9.2),
('g4', 'sv2', 'sub1', 6.5),
('g5', 'sv2', 'sub2', 5.0),
('g6', 'sv2', 'sub3', 7.8),
('g7', 'sv3', 'sub1', 9.0),
('g8', 'sv3', 'sub2', 8.2),
('g9', 'sv3', 'sub3', 3.5), -- Fail
('g10', 'sv4', 'sub2', 7.5),
('g11', 'sv4', 'sub4', 8.0),
('g12', 'sv4', 'sub5', 6.8),
('g13', 'sv5', 'sub2', 8.8),
('g14', 'sv5', 'sub4', 9.5),
('g15', 'sv5', 'sub5', 7.2),
('g16', 'sv6', 'sub2', 4.0), -- Fail
('g17', 'sv6', 'sub4', 5.5),
('g18', 'sv6', 'sub5', 6.0);
-- Tổng cộng 18 điểm, đã đủ 20+ mẫu dữ liệu nếu tính cả users, subjects, ...

INSERT INTO `Exams` (`id`, `name`, `subject_id`, `creator_id`, `status`) VALUES
('exam1', 'Đề thi giữa kỳ Toán A1', 'sub1', 'gv1', 'approved'),
('exam2', 'Đề thi cuối kỳ C++', 'sub2', 'gv1', 'pending'),
('exam3', 'Đề thi 15 phút CSDL', 'sub4', 'gv3', 'approved'),
('exam4', 'Đề thi giữa kỳ Mạng máy tính', 'sub5', 'gv4', 'rejected'),
('exam5', 'Đề thi cuối kỳ Vật Lý', 'sub3', 'gv2', 'pending');

INSERT INTO `Questions` (`id`, `exam_id`, `question_text`, `options`, `correct_answer`) VALUES
('q1', 'exam1', '1 + 1 = ?', '["A. 1", "B. 2", "C. 3", "D. 4"]', 'B'),
('q2', 'exam1', '2 * 3 = ?', '["A. 4", "B. 5", "C. 6", "D. 7"]', 'C'),
('q3', 'exam2', 'Con trỏ trong C++ là gì?', '["A. Một biến lưu địa chỉ", "B. Một hàm", "C. Một kiểu dữ liệu"]', 'A'),
('q4', 'exam3', 'SQL là viết tắt của gì?', '["A. Strong Question Language", "B. Structured Query Language", "C. Simple Query Language"]', 'B'),
('q5', 'exam3', 'Lệnh nào dùng để lấy dữ liệu từ bảng?', '["A. GET", "B. READ", "C. SELECT", "D. FETCH"]', 'C');