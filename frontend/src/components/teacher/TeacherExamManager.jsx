import React, { useState, useEffect, useMemo } from 'react';
import "./style.scss"
import LoadingSpinner from "../base/LoadingSpinner"
import Modal from "../base/Modal"
import convertScore from "../utils/gradeConverter"

export default function TeacherExamManager({ user }) {
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