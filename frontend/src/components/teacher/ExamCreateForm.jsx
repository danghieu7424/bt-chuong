import React, { useState, useRef, useEffect } from "react";
import { useStore } from "../../store";
import "./style.scss";

export default function ExamCreateForm({ teacherId, subjects, onSuccess }) {
  const [state] = useStore();
  const [name, setName] = useState("");
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || "");
  const [questions, setQuestions] = useState([
    { text: "", options: ["", "", "", ""], answer: "A" },
  ]);
  const [submitting, setSubmitting] = useState(false);
  const isMounted = useRef(true); // ✅ giữ trạng thái mount

  useEffect(() => {
    return () => {
      isMounted.current = false; // cleanup khi unmount
    };
  }, []);

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
    setQuestions([
      ...questions,
      { text: "", options: ["", "", "", ""], answer: "A" },
    ]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const formattedQuestions = questions.map((q) => ({
      text: q.text,
      options: q.options.map(
        (opt, i) => `${String.fromCharCode(65 + i)}. ${opt}`
      ),
      answer: q.answer,
    }));

    try {
      const res = await fetch(`${state.domain}/api/teachers/exams`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, subjectId, questions }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Tạo đề thi thất bại");
      }

      onSuccess(); // sẽ làm component bị unmount
    } catch (err) {
      if (isMounted.current) {
        console.error(err);
        alert(err.message);
      }
    } finally {
      if (isMounted.current) setSubmitting(false); // ✅ chỉ cập nhật nếu còn mounted
    }
  };

  if (!subjects.length) {
    return (
      <p className="text-red-600">
        Bạn không được phân công môn học nào để tạo đề thi.
      </p>
    );
  }

  return (
    <form className="exam-create-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Tên đề thi</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label>Môn học</label>
        <select
          value={subjectId}
          onChange={(e) => setSubjectId(e.target.value)}
          required
        >
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      <h4 className="section-title">Câu hỏi</h4>

      {questions.map((q, qIndex) => (
        <div key={qIndex} className="question-card">
          <label>Câu {qIndex + 1}</label>
          <textarea
            value={q.text}
            onChange={(e) =>
              handleQuestionChange(qIndex, "text", e.target.value)
            }
            rows="2"
            required
          />

          {q.options.map((opt, oIndex) => (
            <input
              key={oIndex}
              type="text"
              value={opt}
              onChange={(e) =>
                handleOptionChange(qIndex, oIndex, e.target.value)
              }
              placeholder={`Lựa chọn ${String.fromCharCode(65 + oIndex)}`}
              required
            />
          ))}

          <label>Đáp án đúng</label>
          <select
            value={q.answer}
            onChange={(e) =>
              handleQuestionChange(qIndex, "answer", e.target.value)
            }
          >
            {["A", "B", "C", "D"].map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </div>
      ))}

      <button type="button" onClick={addQuestion}>
        + Thêm câu hỏi
      </button>
      <button type="submit" disabled={submitting}>
        {submitting ? "Đang lưu..." : "Gửi đi chờ duyệt"}
      </button>
    </form>
  );
}
