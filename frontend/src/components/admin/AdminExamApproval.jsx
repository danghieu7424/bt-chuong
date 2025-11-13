import React, { useState, useEffect } from "react";
import "./style.scss";
import LoadingSpinner from "../base/LoadingSpinner";
import { useStore } from "../../store";

export default function AdminExamApproval() {
  const [state] = useStore();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadExams = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${state.domain}/api/admin/pending-exams`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Không thể tải danh sách đề thi");
      const data = await res.json();
      setExams(data);
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadExams();
  }, []);

  const handleApproval = async (examId, status) => {
    try {
      const res = await fetch(`${state.domain}/api/admin/exams/approve/${examId}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Cập nhật trạng thái thất bại");
      }
      loadExams();
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="exam-approval">
      <h3 className="title">Phê duyệt đề thi</h3>
      {exams.length === 0 ? (
        <p className="no-data">Không có đề thi nào chờ duyệt.</p>
      ) : (
        <div className="exam-list">
          {exams.map((exam) => (
            <div key={exam.id} className="exam-card">
              <h4 className="exam-title">{exam.name}</h4>
              <p className="exam-detail">Môn: {exam.subject_name}</p>
              <p className="exam-detail">Người tạo: {exam.creator_name}</p>
              <div className="actions">
                <button
                  onClick={() => handleApproval(exam.id, "approved")}
                  className="btn approve"
                >
                  Phê duyệt
                </button>
                <button
                  onClick={() => handleApproval(exam.id, "rejected")}
                  className="btn reject"
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
