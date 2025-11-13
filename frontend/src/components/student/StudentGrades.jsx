import React, { useState, useEffect, useMemo } from "react";
import "./style.scss";
import LoadingSpinner from "../base/LoadingSpinner";
import Modal from "../base/Modal";
import convertScore from "../utils/gradeConverter.js";
import { useStore } from "../../store";
// --- THÀNH PHẦN SINH VIÊN ---

export default function StudentGrades({ user }) {
  const [state, dispatch] = useStore();
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true; // flag kiểm tra component còn mount hay không
    setLoading(true);

    fetch(`${state.domain}/api/students/grades`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (isMounted) {
          setGrades(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error(err);
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false; // cleanup khi unmount
    };
  }, [user.id]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="student-grades">
      <h3 className="title">Bảng điểm cá nhân</h3>
      <table className="grades-table">
        <thead>
          <tr>
            <th>Môn học</th>
            <th>Điểm 10</th>
            <th>Điểm 4</th>
            <th>Điểm chữ</th>
            <th>TB Lớp (Hệ 10)</th>
            <th>So sánh</th>
          </tr>
        </thead>
        <tbody>
          {grades.map((grade) => {
            const score10 = Number(grade.score_10);
            const classAvg = Number(grade.class_average);
            const { score4, scoreLetter } = convertScore(score10);
            const comparison = score10 - classAvg;

            return (
              <tr key={grade.id}>
                <td className="subject">{grade.subject_name}</td>
                <td className="score_10">
                  {!isNaN(score10) ? score10.toFixed(1) : "N/A"}
                </td>
                <td className="score-4">{score4}</td>
                <td className="score-letter">{scoreLetter}</td>
                <td className="class-average">
                  {!isNaN(classAvg) ? classAvg.toFixed(1) : "N/A"}
                </td>
                <td className="comparison">
                  {!isNaN(comparison) ? (
                    comparison > 0 ? (
                      <span className="positive">+{comparison.toFixed(1)}</span>
                    ) : (
                      <span className="negative">{comparison.toFixed(1)}</span>
                    )
                  ) : (
                    "N/A"
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
