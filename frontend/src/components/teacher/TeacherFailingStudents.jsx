import React, { useState, useEffect, useMemo } from 'react';
import "./style.scss"
import LoadingSpinner from "../base/LoadingSpinner"
import Modal from "../base/Modal"
import convertScore from "../utils/gradeConverter"

export default function TeacherFailingStudents({ user }) {
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fakeApi.getFailingStudents(user.id).then(data => {
      setGrades(data);
      setLoading(false);
    });
  }, [user.id]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="overflow-x-auto">
      <h3 className="text-2xl font-semibold mb-4">Danh sách sinh viên không đạt</h3>
      {grades.length === 0 ? (
        <p>Không có sinh viên nào không đạt.</p>
      ) : (
        <table className="min-w-full bg-white rounded-lg shadow">
          <thead className="bg-red-100">
            <tr>
              <th className="p-3 text-left">Sinh viên</th>
              <th className="p-3 text-left">Môn học</th>
              <th className="p-3 text-center">Điểm 10</th>
            </tr>
          </thead>
          <tbody>
            {grades.map(grade => (
              <tr key={grade.id} className="border-b hover:bg-gray-50">
                <td className="p-3 font-medium">{grade.studentName}</td>
                <td className="p-3">{grade.subjectName}</td>
                <td className="p-3 text-center font-bold text-red-600">{grade.score10.toFixed(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}