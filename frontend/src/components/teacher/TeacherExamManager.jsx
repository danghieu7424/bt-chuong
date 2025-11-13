import React, { useState, useEffect, useMemo } from "react";
import "./style.scss";
import LoadingSpinner from "../base/LoadingSpinner";
import Modal from "../base/Modal";
import { useStore } from "../../store";
import ExamCreateForm from "./ExamCreateForm";

export default function TeacherExamManager({ user }) {
  const [state] = useStore();
  const [myExams, setMyExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const loadExams = () => {
    setLoading(true);
    fetch(`${state.domain}/api/teachers/exams`, {
      method: "GET",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => res.json())
      .then((data) => {
        setMyExams(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  const teacherSubjects = useMemo(() => {
    // Lấy danh sách môn mà giáo viên này dạy từ myExams
    const subjectsMap = {};
    myExams.forEach((exam) => {
      subjectsMap[exam.subject_id] = {
        id: exam.subject_id,
        name: exam.subject_name,
      };
    });
    return Object.values(subjectsMap);
  }, [myExams]);

  useEffect(() => {
    loadExams();
  }, [user.id, state.domain]);

  const handleExamCreated = () => {
    setShowCreateModal(false);
    loadExams(); // Tải lại danh sách
  };

  const statusColor = (status) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="teacher-exam-manager">
      <div className="header">
        <h3 className="title">Quản lý đề thi</h3>
        <button className="btn-create" onClick={() => setShowCreateModal(true)}>
          + Tạo đề thi mới
        </button>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="exam-list">
          {myExams.map((exam) => (
            <div key={exam.id} className="exam-card">
              <div>
                <h4 className="exam-name">{exam.name}</h4>
                <p className="subject-name">{exam.subject_name}</p>
              </div>
              <span className={`status ${statusColor(exam.status)}`}>
                {exam.status.toUpperCase()}
              </span>
            </div>
          ))}
        </div>
      )}

      {showCreateModal && (
        <Modal title="Tạo đề thi mới" onClose={() => setShowCreateModal(false)}>
          <ExamCreateForm
            teacherId={user.id}
            subjects={teacherSubjects || []}
            onSuccess={handleExamCreated}
          />
        </Modal>
      )}
    </div>
  );
}
