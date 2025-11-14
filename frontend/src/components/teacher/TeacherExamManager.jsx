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
        return "status-approved";
      case "pending":
        return "status-pending";
      case "rejected":
        return "status-rejected";
      default:
        return "status-default";
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
