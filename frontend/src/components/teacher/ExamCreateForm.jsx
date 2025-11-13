import React, { useState, useEffect, useMemo } from 'react';
import "./style.scss"
import LoadingSpinner from "../base/LoadingSpinner"
import Modal from "../base/Modal"
import convertScore from "../utils/gradeConverter"

export default function ExamCreateForm({ teacherId, subjects, onSuccess }) {
  const [name, setName] = useState('');
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || '');
  const [questions, setQuestions] = useState([
    { text: '', options: ['', '', '', ''], answer: 'A' }
  ]);
  const [submitting, setSubmitting] = useState(false);

  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...questions];
    newQuestions[index][field] = value;
    setQuestions(newQuestions);
  };
  
  const handleOptionChange = (qIndex, oIndex, value) => {
     const newQuestions = [...questions];
     newQuestions[qIndex].options[oIndex] = value;
     setQuestions(newQuestions);
  };

  const addQuestion = () => {
    setQuestions([...questions, { text: '', options: ['', '', '', ''], answer: 'A' }]);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    // Format lại câu hỏi
    const formattedQuestions = questions.map(q => ({
      text: q.text,
      options: q.options.map((opt, i) => `${String.fromCharCode(65 + i)}. ${opt}`), // A. Option 1, B. Option 2...
      answer: q.answer
    }));
    
    await fakeApi.createExam({
      creatorId: teacherId,
      name,
      subjectId,
      questions: formattedQuestions
    });
    
    setSubmitting(false);
    onSuccess();
  };
  
  if (!subjects.length) {
    return <p className="text-red-600">Bạn không được phân công môn học nào để tạo đề thi.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto p-2">
      <div>
        <label className="block font-medium mb-1">Tên đề thi</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 border rounded-md"
          required
        />
      </div>
      <div>
        <label className="block font-medium mb-1">Môn học</label>
        <select
          value={subjectId}
          onChange={(e) => setSubjectId(e.target.value)}
          className="w-full p-2 border rounded-md bg-white"
          required
        >
          {subjects.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>
      
      <h4 className="text-lg font-semibold pt-4">Câu hỏi</h4>
      {questions.map((q, qIndex) => (
        <div key={qIndex} className="p-3 border rounded-lg space-y-2 bg-gray-50">
          <label className="block font-medium">Câu {qIndex + 1}</label>
          <textarea
            value={q.text}
            onChange={(e) => handleQuestionChange(qIndex, 'text', e.target.value)}
            className="w-full p-2 border rounded-md"
            placeholder="Nội dung câu hỏi"
            rows="2"
            required
          />
          {q.options.map((opt, oIndex) => (
             <input
               key={oIndex}
               type="text"
               value={opt}
               onChange={(e) => handleOptionChange(qIndex, oIndex, e.target.value)}
               className="w-full p-2 border rounded-md"
               placeholder={`Lựa chọn ${String.fromCharCode(65 + oIndex)}`} // A, B, C...
               required
             />
          ))}
          <label className="block font-medium text-sm">Đáp án đúng</label>
          <select
            value={q.answer}
            onChange={(e) => handleQuestionChange(qIndex, 'answer', e.target.value)}
            className="w-full p-2 border rounded-md bg-white"
          >
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
            <option value="D">D</option>
          </select>
        </div>
      ))}
      <button
        type="button"
        onClick={addQuestion}
        className="w-full bg-gray-200 text-gray-800 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300 transition"
      >
        + Thêm câu hỏi
      </button>
      
      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400"
      >
        {submitting ? 'Đang lưu...' : 'Gửi đi chờ duyệt'}
      </button>
    </form>
  );
}
