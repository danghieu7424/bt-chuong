import React, { useState, useEffect, useMemo } from 'react';
import "./style.scss"
import LoadingSpinner from "../base/LoadingSpinner"
import Modal from "../base/Modal"
import convertScore from "../utils/gradeConverter"

export default function AdminExamApproval() {
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

