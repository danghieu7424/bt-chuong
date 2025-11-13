import React, { useState, useEffect, useMemo } from 'react';
import "./style.scss"
import LoadingSpinner from "../base/LoadingSpinner"
import Modal from "../base/Modal"
import convertScore from "../utils/gradeConverter"

export default function TakeExam({ examId, user, onBack }) {
  const [examData, setExamData] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setLoading(true);
    fakeApi.getExamQuestions(examId).then(data => {
      setExamData(data);
      setLoading(false);
    });
  }, [examId]);

  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length !== examData.questions.length) {
      alert('Vui lòng trả lời tất cả các câu hỏi.'); // Tạm thời dùng alert, nên thay bằng modal
      return;
    }
    setSubmitting(true);
    await fakeApi.submitExam(examId, user.id, answers);
    setSubmitting(false);
    alert('Nộp bài thành công!'); // Tạm thời
    onBack();
  };

  if (loading) return <LoadingSpinner />;
  if (!examData) return <p>Không tìm thấy bài thi.</p>;
  
  return (
    <div>
      <button onClick={onBack} className="mb-4 text-blue-600 hover:underline">&larr; Quay lại danh sách</button>
      <h2 className="text-3xl font-bold mb-2">{examData.exam.name}</h2>
      <p className="text-lg text-gray-700 mb-6">Môn: {examData.exam.subjectName}</p>
      
      <div className="space-y-6">
        {examData.questions.map((q, index) => (
          <div key={q.id} className="bg-white p-4 rounded-lg shadow-sm border">
            <p className="font-semibold text-lg mb-3">Câu {index + 1}: {q.text}</p>
            <div className="space-y-2">
              {q.options.map((opt, i) => (
                <label key={i} className="flex items-center p-2 rounded-md hover:bg-gray-100 cursor-pointer">
                  <input
                    type="radio"
                    name={`question-${q.id}`}
                    value={opt.split('.')[0]} // Giả sử đáp án là A, B, C...
                    onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                    className="mr-3"
                  />
                  {opt}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      <button
        onClick={handleSubmit}
        disabled={submitting}
        className="mt-8 w-full bg-green-600 text-white px-6 py-3 rounded-lg font-bold text-lg hover:bg-green-700 transition disabled:bg-gray-400"
      >
        {submitting ? 'Đang nộp bài...' : 'Nộp bài'}
      </button>
    </div>
  );
}