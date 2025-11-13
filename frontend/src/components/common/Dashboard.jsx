import React, { useState, useEffect, useMemo } from 'react';
import "./style.scss"
import LoadingSpinner from "../base/LoadingSpinner"
import Modal from "../base/Modal"
import convertScore from "../utils/gradeConverter"

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