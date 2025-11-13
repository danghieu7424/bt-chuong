import React, { useState, useEffect, useMemo } from 'react';
import "./style.scss"
import LoadingSpinner from "../base/LoadingSpinner"
import Modal from "../base/Modal"
import convertScore from "../utils/gradeConverter"

// component
import StudentGrades from "../student/StudentGrades";
import StudentExams from "../student/StudentExams";
import TakeExam from "../student/TakeExam";
import TeacherClassGrades from "../teacher/TeacherClassGrades";
import TeacherFailingStudents from "../teacher/TeacherFailingStudents";
import TeacherExamManager from "../teacher/TeacherExamManager";
import AdminUserManagement from "../admin/AdminUserManagement";
import AdminExamApproval from "../admin/AdminExamApproval";
import ProfileEditor from "./ProfileEditor"

export default function Dashboard({ user, onLogout }) {
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
     <div className="dashboard">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>Hệ thống Thi cử</h2>
        </div>
        <nav className="sidebar-nav">
          {navItems[currentUser.role].map((item) => (
            <button
              key={item.id}
              onClick={() => setPage(item.id)}
              className={`nav-item ${page === item.id ? "active" : ""}`}
            >
              {item.name}
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <button className="btn-profile" onClick={() => setShowProfileModal(true)}>
            Chỉnh sửa thông tin
          </button>
          <button className="btn-logout" onClick={onLogout}>
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="main">
        <header className="main-header">
          <div className="user-info">
            <span className="user-name">{currentUser.fullName}</span>
            <span className="user-role">Vai trò: {currentUser.role}</span>
          </div>
        </header>
        <main className="main-content">{renderPage()}</main>
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