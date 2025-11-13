import React, { useState, useEffect, useMemo } from 'react';

// --- DỮ LIỆU GIẢ (MOCK DATA) ---
// Thường thì dữ liệu này sẽ nằm trong cơ sở dữ liệu MySQL của bạn.
// Bao gồm 20+ mẫu dữ liệu như đã yêu cầu.

const MOCK_USERS = [
  // Admins (3)
  { id: 'admin1', username: 'admin', password: 'password', role: 'admin', fullName: 'Quản Trị Viên' },
  { id: 'admin2', username: 'admin_son', password: 'password', role: 'admin', fullName: 'Trần Văn Sơn' },
  { id: 'admin3', username: 'admin_linh', password: 'password', role: 'admin', fullName: 'Nguyễn Thị Linh' },
  
  // Teachers (5)
  { id: 'gv1', username: 'gv_thanh', password: 'password', role: 'teacher', fullName: 'Lê Minh Thành', subjectIds: ['sub1', 'sub2'] },
  { id: 'gv2', username: 'gv_huong', password: 'password', role: 'teacher', fullName: 'Phạm Thu Hương', subjectIds: ['sub3'] },
  { id: 'gv3', username: 'gv_nam', password: 'password', role: 'teacher', fullName: 'Đỗ Huy Nam', subjectIds: ['sub4'] },
  { id: 'gv4', username: 'gv_yen', password: 'password', role: 'teacher', fullName: 'Vũ Hải Yến', subjectIds: ['sub5'] },
  { id: 'gv5', username: 'gv_long', password: 'password', role: 'teacher', fullName: 'Hoàng Gia Long', subjectIds: ['sub1'] },

  // Students (12)
  { id: 'sv1', username: 'sv_an', password: 'password', role: 'student', fullName: 'Nguyễn Văn An', subjectIds: ['sub1', 'sub2', 'sub3'] },
  { id: 'sv2', username: 'sv_binh', password: 'password', role: 'student', fullName: 'Trần Minh Bình', subjectIds: ['sub1', 'sub2', 'sub3'] },
  { id: 'sv3', username: 'sv_chi', password: 'password', role: 'student', fullName: 'Lê Thị Chi', subjectIds: ['sub1', 'sub2', 'sub3'] },
  { id: 'sv4', username: 'sv_dung', password: 'password', role: 'student', fullName: 'Phạm Hùng Dũng', subjectIds: ['sub2', 'sub4', 'sub5'] },
  { id: 'sv5', username: 'sv_giang', password: 'password', role: 'student', fullName: 'Đỗ Thu Giang', subjectIds: ['sub2', 'sub4', 'sub5'] },
  { id: 'sv6', username: 'sv_hai', password: 'password', role: 'student', fullName: 'Vũ Văn Hải', subjectIds: ['sub2', 'sub4', 'sub5'] },
  { id: 'sv7', username: 'sv_kien', password: 'password', role: 'student', fullName: 'Nguyễn Trung Kiên', subjectIds: ['sub1', 'sub3', 'sub5'] },
  { id: 'sv8', username: 'sv_lan', password: 'password', role: 'student', fullName: 'Trần Ngọc Lan', subjectIds: ['sub1', 'sub3', 'sub5'] },
  { id: 'sv9', username: 'sv_minh', password: 'password', role: 'student', fullName: 'Lê Quang Minh', subjectIds: ['sub1', 'sub3', 'sub5'] },
  { id: 'sv10', username: 'sv_nga', password: 'password', role: 'student', fullName: 'Phạm Thị Nga', subjectIds: ['sub1', 'sub4'] },
  { id: 'sv11', username: 'sv_oanh', password: 'password', role: 'student', fullName: 'Đỗ Hải Oanh', subjectIds: ['sub1', 'sub4'] },
  { id: 'sv12', username: 'sv_phuc', password: 'password', role: 'student', fullName: 'Vũ Đức Phúc', subjectIds: ['sub1', 'sub4'] },
];

const MOCK_SUBJECTS = [
  { id: 'sub1', name: 'Toán cao cấp A1', teacherIds: ['gv1'] },
  { id: 'sub2', name: 'Lập trình C++', teacherIds: ['gv1'] },
  { id: 'sub3', name: 'Vật lý đại cương', teacherIds: ['gv2'] },
  { id: 'sub4', name: 'Cơ sở dữ liệu', teacherIds: ['gv3'] },
  { id: 'sub5', name: 'Mạng máy tính', teacherIds: ['gv4'] },
];

let MOCK_GRADES = [
  // sv1
  { id: 'g1', studentId: 'sv1', subjectId: 'sub1', score10: 8.5 },
  { id: 'g2', studentId: 'sv1', subjectId: 'sub2', score10: 7.0 },
  { id: 'g3', studentId: 'sv1', subjectId: 'sub3', score10: 9.2 },
  // sv2
  { id: 'g4', studentId: 'sv2', subjectId: 'sub1', score10: 6.5 },
  { id: 'g5', studentId: 'sv2', subjectId: 'sub2', score10: 5.0 },
  { id: 'g6', studentId: 'sv2', subjectId: 'sub3', score10: 7.8 },
  // sv3
  { id: 'g7', studentId: 'sv3', subjectId: 'sub1', score10: 9.0 },
  { id: 'g8', studentId: 'sv3', subjectId: 'sub2', score10: 8.2 },
  { id: 'g9', studentId: 'sv3', subjectId: 'sub3', score10: 3.5 }, // Fail
  // sv4
  { id: 'g10', studentId: 'sv4', subjectId: 'sub2', score10: 7.5 },
  { id: 'g11', studentId: 'sv4', subjectId: 'sub4', score10: 8.0 },
  { id: 'g12', studentId: 'sv4', subjectId: 'sub5', score10: 6.8 },
  // ... more grades
  { id: 'g13', studentId: 'sv5', subjectId: 'sub2', score10: 8.8 },
  { id: 'g14', studentId: 'sv5', subjectId: 'sub4', score10: 9.5 },
  { id: 'g15', studentId: 'sv5', subjectId: 'sub5', score10: 7.2 },
  { id: 'g16', studentId: 'sv6', subjectId: 'sub2', score10: 4.0 }, // Fail
  { id: 'g17', studentId: 'sv6', subjectId: 'sub4', score10: 5.5 },
  { id: 'g18', studentId: 'sv6', subjectId: 'sub5', score10: 6.0 },
];

let MOCK_EXAMS = [
  { id: 'exam1', subjectId: 'sub1', creatorId: 'gv1', name: 'Đề thi giữa kỳ Toán A1', status: 'approved' },
  { id: 'exam2', subjectId: 'sub2', creatorId: 'gv1', name: 'Đề thi cuối kỳ C++', status: 'pending' },
  { id: 'exam3', subjectId: 'sub4', creatorId: 'gv3', name: 'Đề thi 15 phút CSDL', status: 'approved' },
  { id: 'exam4', subjectId: 'sub5', creatorId: 'gv4', name: 'Đề thi giữa kỳ Mạng máy tính', status: 'rejected' },
  { id: 'exam5', subjectId: 'sub3', creatorId: 'gv2', name: 'Đề thi cuối kỳ Vật Lý', status: 'pending' },
];

let MOCK_QUESTIONS = [
  { id: 'q1', examId: 'exam1', text: '1 + 1 = ?', options: ['A. 1', 'B. 2', 'C. 3', 'D. 4'], answer: 'B' },
  { id: 'q2', examId: 'exam1', text: '2 * 3 = ?', options: ['A. 4', 'B. 5', 'C. 6', 'D. 7'], answer: 'C' },
  { id: 'q3', examId: 'exam3', text: 'SQL là viết tắt của gì?', options: ['A. Strong Question Language', 'B. Structured Query Language', 'C. Simple Query Language'], answer: 'B' },
  { id: 'q4', examId: 'exam3', text: 'Lệnh nào dùng để lấy dữ liệu từ bảng?', options: ['A. GET', 'B. READ', 'C. SELECT', 'D. FETCH'], answer: 'C' },
];

// --- API GIẢ LẬP (MOCK API) ---
// Mô phỏng các cuộc gọi API Express bằng cách sử dụng setTimeout

const fakeApi = {
  login: (username, password) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const user = MOCK_USERS.find(u => u.username === username && u.password === password);
        if (user) {
          resolve({ ...user, token: `fake-token-for-${user.id}` });
        } else {
          reject(new Error('Tên đăng nhập hoặc mật khẩu không đúng'));
        }
      }, 500);
    });
  },

  getStudentGrades: (studentId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const studentGrades = MOCK_GRADES.filter(g => g.studentId === studentId);
        const subjects = MOCK_SUBJECTS;
        const allGrades = MOCK_GRADES;

        const detailedGrades = studentGrades.map(grade => {
          const subject = subjects.find(s => s.id === grade.subjectId);
          const allScoresForSubject = allGrades
            .filter(g => g.subjectId === grade.subjectId)
            .map(g => g.score10);
          const classAverage = allScoresForSubject.reduce((a, b) => a + b, 0) / allScoresForSubject.length;
          
          return {
            ...grade,
            subjectName: subject ? subject.name : 'N/A',
            classAverage: parseFloat(classAverage.toFixed(2)),
          };
        });
        resolve(detailedGrades);
      }, 500);
    });
  },
  
  updateProfile: (userId, newProfileData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const userIndex = MOCK_USERS.findIndex(u => u.id === userId);
        if (userIndex !== -1) {
          MOCK_USERS[userIndex] = { ...MOCK_USERS[userIndex], ...newProfileData };
          resolve(MOCK_USERS[userIndex]);
        }
      }, 300);
    });
  },

  getExamsForStudent: (studentId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
         const student = MOCK_USERS.find(u => u.id === studentId);
         const studentSubjectIds = student.subjectIds || [];
         const availableExams = MOCK_EXAMS.filter(e => 
           e.status === 'approved' && studentSubjectIds.includes(e.subjectId)
         ).map(e => ({
           ...e,
           subjectName: MOCK_SUBJECTS.find(s => s.id === e.subjectId)?.name
         }));
         resolve(availableExams);
      }, 500);
    });
  },
  
  getExamQuestions: (examId) => {
     return new Promise((resolve) => {
       setTimeout(() => {
         const exam = MOCK_EXAMS.find(e => e.id === examId);
         const questions = MOCK_QUESTIONS
           .filter(q => q.examId === examId)
           .map(({ answer, ...rest }) => rest); // Xóa câu trả lời đúng
         
         resolve({ exam, questions });
       }, 500);
     });
  },
  
  submitExam: (examId, studentId, answers) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Trong một ứng dụng thực, bạn sẽ chấm điểm ở đây
        console.log('Bài thi đã nộp:', { examId, studentId, answers });
        // Thêm điểm giả
        const exam = MOCK_EXAMS.find(e => e.id === examId);
        MOCK_GRADES.push({
          id: `g${MOCK_GRADES.length + 1}`,
          studentId: studentId,
          subjectId: exam.subjectId,
          score10: Math.random() * 5 + 5 // Điểm ngẫu nhiên từ 5-10
        });
        resolve({ message: 'Nộp bài thành công!' });
      }, 1000);
    });
  },
  
  getTeacherClassGrades: (teacherId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const teacher = MOCK_USERS.find(u => u.id === teacherId);
        const teacherSubjects = teacher.subjectIds || [];
        const grades = MOCK_GRADES.filter(g => teacherSubjects.includes(g.subjectId));
        
        const detailedGrades = grades.map(g => ({
          ...g,
          studentName: MOCK_USERS.find(u => u.id === g.studentId)?.fullName,
          subjectName: MOCK_SUBJECTS.find(s => s.id === g.subjectId)?.name,
        }));
        resolve(detailedGrades);
      }, 500);
    });
  },
  
  getFailingStudents: (teacherId) => {
     return new Promise((resolve) => {
        setTimeout(() => {
          const teacher = MOCK_USERS.find(u => u.id === teacherId);
          const teacherSubjects = teacher.subjectIds || [];
          const failingGrades = MOCK_GRADES.filter(g => 
            teacherSubjects.includes(g.subjectId) && g.score10 < 4.0
          );
          
          const detailedGrades = failingGrades.map(g => ({
            ...g,
            studentName: MOCK_USERS.find(u => u.id === g.studentId)?.fullName,
            subjectName: MOCK_SUBJECTS.find(s => s.id === g.subjectId)?.name,
          }));
          resolve(detailedGrades);
        }, 500);
     });
  },
  
  createExam: (examData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newExam = {
          ...examData,
          id: `exam${MOCK_EXAMS.length + 1}`,
          status: 'pending' // Luôn là pending khi mới tạo
        };
        MOCK_EXAMS.push(newExam);
        
        examData.questions.forEach((q, index) => {
          MOCK_QUESTIONS.push({
            ...q,
            id: `q${MOCK_QUESTIONS.length + 1}`,
            examId: newExam.id
          });
        });
        resolve(newExam);
      }, 500);
    });
  },
  
  getTeacherExams: (teacherId) => {
     return new Promise((resolve) => {
        setTimeout(() => {
          const exams = MOCK_EXAMS.filter(e => e.creatorId === teacherId).map(e => ({
            ...e,
            subjectName: MOCK_SUBJECTS.find(s => s.id === e.subjectId)?.name
          }));
          resolve(exams);
        }, 300);
     });
  },
  
  getAllUsers: () => {
     return new Promise((resolve) => {
       setTimeout(() => resolve(MOCK_USERS), 300);
     });
  },
  
  getPendingExams: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const exams = MOCK_EXAMS.filter(e => e.status === 'pending').map(e => ({
          ...e,
          subjectName: MOCK_SUBJECTS.find(s => s.id === e.subjectId)?.name,
          creatorName: MOCK_USERS.find(u => u.id === e.creatorId)?.fullName,
        }));
        resolve(exams);
      }, 300);
    });
  },
  
  approveExam: (examId, status) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const examIndex = MOCK_EXAMS.findIndex(e => e.id === examId);
        if (examIndex !== -1) {
          MOCK_EXAMS[examIndex].status = status;
          resolve(MOCK_EXAMS[examIndex]);
        }
      }, 300);
    });
  },
};

// --- CÁC HÀM TIỆN ÍCH ---

const convertScore = (score10) => {
  let score4, scoreLetter;
  if (score10 >= 9.0) { score4 = 4.0; scoreLetter = 'A+'; }
  else if (score10 >= 8.5) { score4 = 3.7; scoreLetter = 'A'; }
  else if (score10 >= 8.0) { score4 = 3.5; scoreLetter = 'B+'; }
  else if (score10 >= 7.0) { score4 = 3.0; scoreLetter = 'B'; }
  else if (score10 >= 6.0) { score4 = 2.5; scoreLetter = 'C+'; }
  else if (score10 >= 5.0) { score4 = 2.0; scoreLetter = 'C'; }
  else if (score10 >= 4.0) { score4 = 1.0; scoreLetter = 'D'; }
  else { score4 = 0.0; scoreLetter = 'F'; }
  return { score4: score4.toFixed(1), scoreLetter };
};

// --- CÁC THÀNH PHẦN (COMPONENTS) ---

function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center p-10">
      <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
}

function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 relative z-50">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 text-2xl"
        >
          &times;
        </button>
        <h2 className="text-2xl font-bold mb-4">{title}</h2>
        <div>{children}</div>
      </div>
    </div>
  );
}

// --- THÀNH PHẦN SINH VIÊN ---

function StudentGrades({ user }) {
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fakeApi.getStudentGrades(user.id).then(data => {
      setGrades(data);
      setLoading(false);
    });
  }, [user.id]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="overflow-x-auto">
      <h3 className="text-2xl font-semibold mb-4">Bảng điểm cá nhân</h3>
      <table className="min-w-full bg-white rounded-lg shadow">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-3 text-left">Môn học</th>
            <th className="p-3 text-center">Điểm 10</th>
            <th className="p-3 text-center">Điểm 4</th>
            <th className="p-3 text-center">Điểm chữ</th>
            <th className="p-3 text-center">TB Lớp (Hệ 10)</th>
            <th className="p-3 text-center">So sánh</th>
          </tr>
        </thead>
        <tbody>
          {grades.map(grade => {
            const { score4, scoreLetter } = convertScore(grade.score10);
            const comparison = grade.score10 - grade.classAverage;
            return (
              <tr key={grade.id} className="border-b hover:bg-gray-50">
                <td className="p-3 font-medium">{grade.subjectName}</td>
                <td className="p-3 text-center font-bold text-blue-600">{grade.score10.toFixed(1)}</td>
                <td className="p-3 text-center">{score4}</td>
                <td className="p-3 text-center">{scoreLetter}</td>
                <td className="p-3 text-center text-gray-600">{grade.classAverage.toFixed(1)}</td>
                <td className="p-3 text-center">
                  {comparison > 0 ? (
                    <span className="text-green-600 font-medium">+{comparison.toFixed(1)}</span>
                  ) : (
                    <span className="text-red-600 font-medium">{comparison.toFixed(1)}</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function StudentExams({ user, onTakeExam }) {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fakeApi.getExamsForStudent(user.id).then(data => {
      setExams(data);
      setLoading(false);
    });
  }, [user.id]);

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <h3 className="text-2xl font-semibold mb-4">Các bài thi hiện có</h3>
      {exams.length === 0 ? (
        <p className="text-gray-600">Hiện không có bài thi nào.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {exams.map(exam => (
            <div key={exam.id} className="bg-white p-4 rounded-lg shadow border border-gray-200">
              <h4 className="text-lg font-bold">{exam.name}</h4>
              <p className="text-gray-700 mb-4">{exam.subjectName}</p>
              <button
                onClick={() => onTakeExam(exam.id)}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Vào thi
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function TakeExam({ examId, user, onBack }) {
  const [examData, setExamData] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setLoading(true);
    fakeApi.getExamQuestions(examId).then(data => {
      setExamData(data);
      setLoading(false);
    });
  }, [examId]);

  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length !== examData.questions.length) {
      alert('Vui lòng trả lời tất cả các câu hỏi.'); // Tạm thời dùng alert, nên thay bằng modal
      return;
    }
    setSubmitting(true);
    await fakeApi.submitExam(examId, user.id, answers);
    setSubmitting(false);
    alert('Nộp bài thành công!'); // Tạm thời
    onBack();
  };

  if (loading) return <LoadingSpinner />;
  if (!examData) return <p>Không tìm thấy bài thi.</p>;
  
  return (
    <div>
      <button onClick={onBack} className="mb-4 text-blue-600 hover:underline">&larr; Quay lại danh sách</button>
      <h2 className="text-3xl font-bold mb-2">{examData.exam.name}</h2>
      <p className="text-lg text-gray-700 mb-6">Môn: {examData.exam.subjectName}</p>
      
      <div className="space-y-6">
        {examData.questions.map((q, index) => (
          <div key={q.id} className="bg-white p-4 rounded-lg shadow-sm border">
            <p className="font-semibold text-lg mb-3">Câu {index + 1}: {q.text}</p>
            <div className="space-y-2">
              {q.options.map((opt, i) => (
                <label key={i} className="flex items-center p-2 rounded-md hover:bg-gray-100 cursor-pointer">
                  <input
                    type="radio"
                    name={`question-${q.id}`}
                    value={opt.split('.')[0]} // Giả sử đáp án là A, B, C...
                    onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                    className="mr-3"
                  />
                  {opt}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="mt-8 w-full bg-green-600 text-white px-6 py-3 rounded-lg font-bold text-lg hover:bg-green-700 transition disabled:bg-gray-400"
      >
        {submitting ? 'Đang nộp bài...' : 'Nộp bài'}
      </button>
    </div>
  );
}

// --- THÀNH PHẦN GIÁO VIÊN ---

function TeacherClassGrades({ user }) {
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fakeApi.getTeacherClassGrades(user.id).then(data => {
      setGrades(data);
      setLoading(false);
    });
  }, [user.id]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="overflow-x-auto">
      <h3 className="text-2xl font-semibold mb-4">Điểm các lớp giảng dạy</h3>
      <table className="min-w-full bg-white rounded-lg shadow">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-3 text-left">Sinh viên</th>
            <th className="p-3 text-left">Môn học</th>
            <th className="p-3 text-center">Điểm 10</th>
            <th className="p-3 text-center">Điểm 4</th>
            <th className="p-3 text-center">Điểm chữ</th>
          </tr>
        </thead>
        <tbody>
          {grades.map(grade => {
            const { score4, scoreLetter } = convertScore(grade.score10);
            return (
              <tr key={grade.id} className="border-b hover:bg-gray-50">
                <td className="p-3 font-medium">{grade.studentName}</td>
                <td className="p-3">{grade.subjectName}</td>
                <td className="p-3 text-center font-bold text-blue-600">{grade.score10.toFixed(1)}</td>
                <td className="p-3 text-center">{score4}</td>
                <td className="p-3 text-center">{scoreLetter}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function TeacherFailingStudents({ user }) {
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fakeApi.getFailingStudents(user.id).then(data => {
      setGrades(data);
      setLoading(false);
    });
  }, [user.id]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="overflow-x-auto">
      <h3 className="text-2xl font-semibold mb-4">Danh sách sinh viên không đạt</h3>
      {grades.length === 0 ? (
        <p>Không có sinh viên nào không đạt.</p>
      ) : (
        <table className="min-w-full bg-white rounded-lg shadow">
          <thead className="bg-red-100">
            <tr>
              <th className="p-3 text-left">Sinh viên</th>
              <th className="p-3 text-left">Môn học</th>
              <th className="p-3 text-center">Điểm 10</th>
            </tr>
          </thead>
          <tbody>
            {grades.map(grade => (
              <tr key={grade.id} className="border-b hover:bg-gray-50">
                <td className="p-3 font-medium">{grade.studentName}</td>
                <td className="p-3">{grade.subjectName}</td>
                <td className="p-3 text-center font-bold text-red-600">{grade.score10.toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function TeacherExamManager({ user }) {
  const [myExams, setMyExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const teacherSubjects = useMemo(() => {
    return MOCK_SUBJECTS.filter(s => s.teacherIds.includes(user.id));
  }, [user.id]);
  
  const loadExams = () => {
     setLoading(true);
     fakeApi.getTeacherExams(user.id).then(data => {
       setMyExams(data);
       setLoading(false);
     });
  };

  useEffect(() => {
    loadExams();
  }, [user.id]);

  const handleExamCreated = () => {
    setShowCreateModal(false);
    loadExams(); // Tải lại danh sách
  };
  
  const statusColor = (status) => {
    switch(status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-2xl font-semibold">Quản lý đề thi</h3>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          + Tạo đề thi mới
        </button>
      </div>
      
      {loading ? <LoadingSpinner /> : (
        <div className="space-y-4">
          {myExams.map(exam => (
            <div key={exam.id} className="bg-white p-4 rounded-lg shadow border flex justify-between items-center">
              <div>
                <h4 className="text-lg font-bold">{exam.name}</h4>
                <p className="text-gray-700">{exam.subjectName}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColor(exam.status)}`}>
                {exam.status === 'pending' ? 'Chờ duyệt' : (exam.status === 'approved' ? 'Đã duyệt' : 'Từ chối')}
              </span>
            </div>
          ))}
        </div>
      )}
      
      {showCreateModal && (
        <Modal title="Tạo đề thi mới" onClose={() => setShowCreateModal(false)}>
          <ExamCreateForm
            teacherId={user.id}
            subjects={teacherSubjects}
            onSuccess={handleExamCreated}
          />
        </Modal>
      )}
    </div>
  );
}

function ExamCreateForm({ teacherId, subjects, onSuccess }) {
  const [name, setName] = useState('');
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || '');
  const [questions, setQuestions] = useState([
    { text: '', options: ['', '', '', ''], answer: 'A' }
  ]);
  const [submitting, setSubmitting] = useState(false);

  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...questions];
    newQuestions[index][field] = value;
    setQuestions(newQuestions);
  };
  
  const handleOptionChange = (qIndex, oIndex, value) => {
     const newQuestions = [...questions];
     newQuestions[qIndex].options[oIndex] = value;
     setQuestions(newQuestions);
  };

  const addQuestion = () => {
    setQuestions([...questions, { text: '', options: ['', '', '', ''], answer: 'A' }]);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    // Format lại câu hỏi
    const formattedQuestions = questions.map(q => ({
      text: q.text,
      options: q.options.map((opt, i) => `${String.fromCharCode(65 + i)}. ${opt}`), // A. Option 1, B. Option 2...
      answer: q.answer
    }));
    
    await fakeApi.createExam({
      creatorId: teacherId,
      name,
      subjectId,
      questions: formattedQuestions
    });
    
    setSubmitting(false);
    onSuccess();
  };
  
  if (!subjects.length) {
    return <p className="text-red-600">Bạn không được phân công môn học nào để tạo đề thi.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto p-2">
      <div>
        <label className="block font-medium mb-1">Tên đề thi</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 border rounded-md"
          required
        />
      </div>
      <div>
        <label className="block font-medium mb-1">Môn học</label>
        <select
          value={subjectId}
          onChange={(e) => setSubjectId(e.target.value)}
          className="w-full p-2 border rounded-md bg-white"
          required
        >
          {subjects.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>
      
      <h4 className="text-lg font-semibold pt-4">Câu hỏi</h4>
      {questions.map((q, qIndex) => (
        <div key={qIndex} className="p-3 border rounded-lg space-y-2 bg-gray-50">
          <label className="block font-medium">Câu {qIndex + 1}</label>
          <textarea
            value={q.text}
            onChange={(e) => handleQuestionChange(qIndex, 'text', e.target.value)}
            className="w-full p-2 border rounded-md"
            placeholder="Nội dung câu hỏi"
            rows="2"
            required
          />
          {q.options.map((opt, oIndex) => (
             <input
               key={oIndex}
               type="text"
               value={opt}
               onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
               className="w-full p-2 border rounded-md"
               placeholder={`Lựa chọn ${String.fromCharCode(65 + oIndex)}`} // A, B, C...
               required
             />
          ))}
          <label className="block font-medium text-sm">Đáp án đúng</label>
          <select
            value={q.answer}
            onChange={(e) => handleQuestionChange(qIndex, 'answer', e.target.value)}
            className="w-full p-2 border rounded-md bg-white"
          >
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
            <option value="D">D</option>
          </select>
        </div>
      ))}
      <button
        type="button"
        onClick={addQuestion}
        className="w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300 transition"
      >
        + Thêm câu hỏi
      </button>
      
      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400"
      >
        {submitting ? 'Đang lưu...' : 'Gửi đi chờ duyệt'}
      </button>
    </form>
  );
}


// --- THÀNH PHẦN ADMIN ---

function AdminUserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);

  const loadUsers = () => {
    setLoading(true);
    fakeApi.getAllUsers().then(data => {
      setUsers(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadUsers();
  }, []);
  
  const handleUpdate = async (profile) => {
    await fakeApi.updateProfile(editingUser.id, profile);
    setEditingUser(null);
    loadUsers();
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="overflow-x-auto">
      <h3 className="text-2xl font-semibold mb-4">Quản lý người dùng</h3>
      <table className="min-w-full bg-white rounded-lg shadow">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-3 text-left">Họ tên</th>
            <th className="p-3 text-left">Username</th>
            <th className="p-3 text-left">Vai trò</th>
            <th className="p-3 text-center">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id} className="border-b hover:bg-gray-50">
              <td className="p-3 font-medium">{user.fullName}</td>
              <td className="p-3">{user.username}</td>
              <td className="p-3">
                 <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                   user.role === 'admin' ? 'bg-red-100 text-red-800' :
                   user.role === 'teacher' ? 'bg-blue-100 text-blue-800' :
                   'bg-green-100 text-green-800'
                 }`}>
                   {user.role}
                 </span>
              </td>
              <td className="p-3 text-center">
                <button
                  onClick={() => setEditingUser(user)}
                  className="text-blue-600 hover:underline"
                >
                  Sửa
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {editingUser && (
        <Modal title={`Sửa thông tin: ${editingUser.fullName}`} onClose={() => setEditingUser(null)}>
          <ProfileEditor
            user={editingUser}
            onSave={handleUpdate}
            isAdmin={true} // Cho phép Admin sửa vai trò
          />
        </Modal>
      )}
    </div>
  );
}

function AdminExamApproval() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadExams = () => {
    setLoading(true);
    fakeApi.getPendingExams().then(data => {
      setExams(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadExams();
  }, []);
  
  const handleApproval = async (examId, status) => {
    await fakeApi.approveExam(examId, status);
    loadExams(); // Tải lại danh sách
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="overflow-x-auto">
      <h3 className="text-2xl font-semibold mb-4">Phê duyệt đề thi</h3>
      {exams.length === 0 ? (
        <p>Không có đề thi nào chờ duyệt.</p>
      ) : (
        <div className="space-y-4">
          {exams.map(exam => (
            <div key={exam.id} className="bg-white p-4 rounded-lg shadow border">
              <h4 className="text-lg font-bold">{exam.name}</h4>
              <p className="text-gray-700">Môn: {exam.subjectName}</p>
              <p className="text-gray-700">Người tạo: {exam.creatorName}</p>
              <div className="flex gap-4 mt-4">
                <button
                  onClick={() => handleApproval(exam.id, 'approved')}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition"
                >
                  Phê duyệt
                </button>
                <button
                  onClick={() => handleApproval(exam.id, 'rejected')}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-700 transition"
                >
                  Từ chối
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


// --- CÁC THÀNH PHẦN CHUNG ---

function ProfileEditor({ user, onSave, isAdmin = false }) {
  const [fullName, setFullName] = useState(user.fullName);
  const [role, setRole] = useState(user.role);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const updatedProfile = { fullName };
    if (isAdmin) {
      updatedProfile.role = role;
    }
    await onSave(updatedProfile);
    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block font-medium mb-1">Họ tên</label>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          className="w-full p-2 border rounded-md"
          required
        />
      </div>
      {isAdmin && (
        <div>
          <label className="block font-medium mb-1">Vai trò</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full p-2 border rounded-md bg-white"
          >
            <option value="student">Sinh viên</option>
            <option value="teacher">Giáo viên</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      )}
      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400"
      >
        {submitting ? 'Đang lưu...' : 'Lưu thay đổi'}
      </button>
    </form>
  );
}


function Dashboard({ user, onLogout }) {
  const [page, setPage] = useState('home'); // 'home', 'profile', 'take_exam'
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(user);
  
  const handleProfileUpdate = (updatedUser) => {
    setCurrentUser(updatedUser);
    setShowProfileModal(false);
  };
  
  const handleTakeExam = (examId) => {
    setPage(`take_exam_${examId}`);
  };
  
  const renderPage = () => {
    // Logic cho trang làm bài thi
    if (page.startsWith('take_exam_')) {
      const examId = page.split('take_exam_')[1];
      return <TakeExam examId={examId} user={currentUser} onBack={() => setPage('exams')} />;
    }

    // Logic cho các trang dashboard chính
    switch (currentUser.role) {
      case 'student':
        switch (page) {
          case 'home': return <StudentGrades user={currentUser} />;
          case 'exams': return <StudentExams user={currentUser} onTakeExam={handleTakeExam} />;
          default: return <StudentGrades user={currentUser} />;
        }
      case 'teacher':
        switch (page) {
          case 'home': return <TeacherClassGrades user={currentUser} />;
          case 'failing': return <TeacherFailingStudents user={currentUser} />;
          case 'exams': return <TeacherExamManager user={currentUser} />;
          default: return <TeacherClassGrades user={currentUser} />;
        }
      case 'admin':
         switch (page) {
          case 'home': return <AdminUserManagement />;
          case 'exams': return <AdminExamApproval />;
          default: return <AdminUserManagement />;
        }
      default:
        return null;
    }
  };
  
  const navItems = {
    student: [
      { id: 'home', name: 'Xem điểm' },
      { id: 'exams', name: 'Làm bài thi' },
    ],
    teacher: [
      { id: 'home', name: 'Xem điểm lớp' },
      { id: 'failing', name: 'DS không đạt' },
      { id: 'exams', name: 'Quản lý đề thi' },
    ],
    admin: [
       { id: 'home', name: 'Quản lý người dùng' },
       { id: 'exams', name: 'Duyệt đề thi' },
    ],
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-md flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold text-blue-600">Hệ thống Thi cử</h2>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          {navItems[currentUser.role].map(item => (
            <button
              key={item.id}
              onClick={() => setPage(item.id)}
              className={`w-full text-left px-4 py-2 rounded-lg ${
                page === item.id 
                ? 'bg-blue-100 text-blue-700 font-semibold' 
                : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {item.name}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t">
          <button
            onClick={() => setShowProfileModal(true)}
            className="w-full text-left text-gray-700 hover:bg-gray-100 px-4 py-2 rounded-lg"
          >
            Chỉnh sửa thông tin
          </button>
          <button
            onClick={onLogout}
            className="w-full text-left text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg mt-2"
          >
            Đăng xuất
          </button>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm p-4 border-b flex justify-end">
          <div className="text-right">
            <span className="font-semibold">{currentUser.fullName}</span>
            <span className="text-sm text-gray-600 block">Vai trò: {currentUser.role}</span>
          </div>
        </header>
        <main className="flex-1 p-6 overflow-y-auto">
          {renderPage()}
        </main>
      </div>
      
      {/* Profile Modal */}
      {showProfileModal && (
         <Modal title="Chỉnh sửa thông tin cá nhân" onClose={() => setShowProfileModal(false)}>
           <ProfileEditor user={currentUser} onSave={handleProfileUpdate} />
         </Modal>
      )}
    </div>
  );
}

function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const user = await fakeApi.login(username, password);
      onLogin(user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md bg-white rounded-lg shadow-xl p-8">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
          Đăng nhập Hệ thống Quản lý Thi
        </h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label 
              htmlFor="username"
              className="block text-sm font-medium text-gray-700"
            >
              Tên đăng nhập
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label 
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Mật khẩu
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 transition"
          >
            {loading ? (
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            ) : (
              'Đăng nhập'
            )}
          </button>
        </form>
        
        <div className="mt-6">
          <p className="text-center text-sm text-gray-600 mb-2">Thông tin đăng nhập demo:</p>
          <ul className="text-xs text-gray-500 list-disc list-inside">
            <li>sv_an / password (SinhVien)</li>
            <li>gv_thanh / password (GiaoVien)</li>
            <li>admin / password (Admin)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// --- THÀNH PHẦN APP CHÍNH ---

export default function App() {
  const [user, setUser] = useState(null);

  if (!user) {
    return <LoginScreen onLogin={setUser} />;
  }

  return <Dashboard user={user} onLogout={() => setUser(null)} />;
}