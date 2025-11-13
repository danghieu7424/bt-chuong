import React, { useState, useEffect, useMemo } from 'react';
import "./style.scss"
import LoadingSpinner from "../base/LoadingSpinner"
import Modal from "../base/Modal"
import convertScore from "../utils/gradeConverter"


// --- THÀNH PHẦN SINH VIÊN ---

export default function StudentGrades({ user }) {
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fakeApi.getStudentGrades(user.id).then(data => {
      setGrades(data);
      setLoading(false);
    });
  }, [user.id]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="overflow-x-auto">
      <h3 className="text-2xl font-semibold mb-4">Bảng điểm cá nhân</h3>
      <table className="min-w-full bg-white rounded-lg shadow">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-3 text-left">Môn học</th>
            <th className="p-3 text-center">Điểm 10</th>
            <th className="p-3 text-center">Điểm 4</th>
            <th className="p-3 text-center">Điểm chữ</th>
            <th className="p-3 text-center">TB Lớp (Hệ 10)</th>
            <th className="p-3 text-center">So sánh</th>
          </tr>
        </thead>
        <tbody>
          {grades.map(grade => {
            const { score4, scoreLetter } = convertScore(grade.score10);
            const comparison = grade.score10 - grade.classAverage;
            return (
              <tr key={grade.id} className="border-b hover:bg-gray-50">
                <td className="p-3 font-medium">{grade.subjectName}</td>
                <td className="p-3 text-center font-bold text-blue-600">{grade.score10.toFixed(1)}</td>
                <td className="p-3 text-center">{score4}</td>
                <td className="p-3 text-center">{scoreLetter}</td>
                <td className="p-3 text-center text-gray-600">{grade.classAverage.toFixed(1)}</td>
                <td className="p-3 text-center">
                  {comparison > 0 ? (
                    <span className="text-green-600 font-medium">+{comparison.toFixed(1)}</span>
                  ) : (
                    <span className="text-red-600 font-medium">{comparison.toFixed(1)}</span>
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

