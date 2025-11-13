import React, { useState, useEffect } from "react";
import "./style.scss";
import LoadingSpinner from "../base/LoadingSpinner";
import convertScore from "../utils/gradeConverter";
import { useStore } from "../../store";

export default function TeacherClassGrades({ user }) {
  const [state] = useStore();
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`${state.domain}/api/teachers/class-grades`, {
      method: "GET",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => res.json())
      .then((data) => {
        setGrades(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [user.id, state.domain]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="teacher-class-grades">
      <h3 className="title">Điểm các lớp giảng dạy</h3>
      <table className="grades-table">
        <thead>
          <tr>
            <th>Sinh viên</th>
            <th>Môn học</th>
            <th>Điểm 10</th>
            <th>Điểm 4</th>
            <th>Điểm chữ</th>
          </tr>
        </thead>
        <tbody>
          {grades.map((grade) => {
            const score10 = parseFloat(grade.score_10);
            const { score4, scoreLetter } = convertScore(score10);
            return (
              <tr key={grade.id}>
                <td className="student-name">{grade.student_name}</td>
                <td className="subject-name">{grade.subject_name}</td>
                <td className="score-10">{score10.toFixed(1)}</td>
                <td className="score-4">{score4}</td>
                <td className="score-letter">{scoreLetter}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
