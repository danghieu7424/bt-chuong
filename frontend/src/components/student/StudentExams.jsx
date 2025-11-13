import React, { useState, useEffect } from "react";
import "./style.scss";
import LoadingSpinner from "../base/LoadingSpinner";
import { useStore } from "../../store";

export default function StudentExams({ user, onTakeExam }) {
  const [state] = useStore();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true; // tránh setState khi unmounted
    setLoading(true);

    fetch(`${state.domain}/api/students/exams`, {
      method: "GET",
      credentials: "include", // gửi cookie để xác thực
    })
      .then((res) => {
        if (!res.ok) throw new Error("Không tải được danh sách bài thi");
        return res.json();
      })
      .then((data) => {
        if (isMounted) {
          console.log(data)
          setExams(Array.isArray(data) ? data : []);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error(err);
        if (isMounted) setExams([]); 
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [user.id, state.domain]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="student-exams">
      <h3 className="title">Các bài thi hiện có</h3>

      {exams.length === 0 ? (
        <p className="no-exams">Hiện không có bài thi nào.</p>
      ) : (
        <div className="exams-grid">
          {exams.map((exam) => (
            <div key={exam.id} className="exam-card">
              <h4 className="exam-name">{exam.name}</h4>
              <p className="exam-subject">{exam.subject_name}</p>
              <button className="btn-exam" onClick={() => onTakeExam(exam.id)}>
                Vào thi
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
