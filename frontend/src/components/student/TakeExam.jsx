import React, { useState, useEffect } from "react";
import "./style.scss";
import LoadingSpinner from "../base/LoadingSpinner";
import { useStore } from "../../store";

export default function TakeExam({ examId, user, onBack }) {
  const [state] = useStore();
  const [examData, setExamData] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Thêm state cho countdown
  const [timeLeft, setTimeLeft] = useState(0); // giây

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    fetch(`${state.domain}/api/students/exam/${examId}`, {
      method: "GET",
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Không tải được bài thi");
        return res.json();
      })
      .then((data) => {
        if (isMounted) {
          setExamData(data);
          setLoading(false);

          // Nếu backend cung cấp thời gian làm bài, ví dụ data.exam.duration_minutes
          // Chuyển sang giây:
          setTimeLeft((data.exam.duration_minutes || 30) * 60);
        }
      })
      .catch((err) => {
        console.error(err);
        if (isMounted) setExamData(null);
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [examId, state.domain]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timer);
          handleSubmit(); // tự động nộp khi hết giờ
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleAnswerChange = (questionId, answer) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmit = async () => {
    if (!examData) return;
    if (Object.keys(answers).length !== examData.questions.length) {
      alert("Vui lòng trả lời tất cả các câu hỏi.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(
        `${state.domain}/api/students/exam/${examId}/submit`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ answers }),
        }
      );

      if (!res.ok) throw new Error("Nộp bài thất bại");
      const data = await res.json();
      alert(`Nộp bài thành công! Điểm của bạn: ${data.score}/10`);
      onBack(); // trở về danh sách hoặc xem điểm
    } catch (err) {
      console.error(err);
      alert("Có lỗi xảy ra khi nộp bài.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!examData) return <p>Không tìm thấy bài thi.</p>;

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  return (
    <div className="take-exam">
      <button className="back-btn" onClick={onBack}>
        &larr; Quay lại danh sách
      </button>

      <h2 className="exam-title">{examData.exam.name}</h2>
      <p className="exam-subject">Môn: {examData.exam.subject_name}</p>
      <p className="exam-timer">Thời gian còn lại: {formatTime(timeLeft)}</p>

      <div className="questions-list">
        {examData.questions.map((q, index) => (
          <div key={q.id} className="question-card">
            <p className="question-text">
              Câu {index + 1}: {q.text}
            </p>
            <div className="options-list">
              {q.options.map((opt, i) => (
                <label key={i} className="option-label">
                  <input
                    type="radio"
                    name={`question-${q.id}`}
                    value={opt.split(".")[0]}
                    onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                  />
                  {opt}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <button
        className="submit-btn"
        onClick={handleSubmit}
        disabled={submitting}
      >
        {submitting ? "Đang nộp bài..." : "Nộp bài"}
      </button>
    </div>
  );
}
