import React, { useEffect, useState } from "react";
import { useStore, actions } from "../../store"; // Thêm 'actions'
import { useHistory } from "react-router-dom"; // Import useHistory (cho React Router v5)
import "./style.scss"; // Import file SCSS

export default function GiaoVien() {
  const [state, dispatch] = useStore();
  const history = useHistory(); // Khởi tạo history

  // State cho bảng điểm
  const [diemLop, setDiemLop] = useState([]);
  const [diemLoading, setDiemLoading] = useState(false);
  const [diemError, setDiemError] = useState("");

  // State cho form tạo đề
  const [form, setForm] = useState({ tieuDe: "", moTa: "", lop: "" });
  const [formLoading, setFormLoading] = useState(false);
  const [formMsg, setFormMsg] = useState(""); // Tách riêng message cho form
  const [questionForm, setQuestionForm] = useState({
    idDeThi: "",
    noiDung: "",
    dapAnA: "",
    dapAnB: "",
    dapAnC: "",
    dapAnD: "",
    dapAnDung: "A",
  });
  const [qMsg, setQMsg] = useState("");
  const [qLoading, setQLoading] = useState(false);

  // Lấy điểm của lớp
  const fetchDiemLop = async () => {
    setDiemLoading(true);
    setDiemError("");
    try {
      const res = await fetch("http://localhost:5000/api/giaovien/diemlop", {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Lỗi tải điểm lớp");
      setDiemLop(data);
    } catch (err) {
      setDiemError(err.message);
    } finally {
      setDiemLoading(false);
    }
  };

  // tạo câu hỏi
  const taoCauHoi = async () => {
    setQLoading(true);
    setQMsg("");
    try {
      const res = await fetch("http://localhost:5000/api/giaovien/cauhoi", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(questionForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setQMsg("✅ Thêm câu hỏi thành công");
      setQuestionForm({
        ...questionForm,
        noiDung: "",
        dapAnA: "",
        dapAnB: "",
        dapAnC: "",
        dapAnD: "",
      });
    } catch (err) {
      setQMsg(err.message);
    } finally {
      setQLoading(false);
    }
  };

  // Tạo đề thi
  const taoDeThi = async () => {
    setFormLoading(true);
    setFormMsg("");
    try {
      const res = await fetch("http://localhost:5000/api/giaovien/dethi", {
        method: "POST",
        credentials: "include",
        headers: {
          // <-- SỬA LỖI: Thiếu headers
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form), // <-- SỬA LỖI: Thiếu body
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Tạo đề thi thất bại");

      setFormMsg("✅ Tạo đề thi thành công");
      setForm({ tieuDe: "", moTa: "", lop: "" }); // Xóa form
      // Tùy chọn: fetch lại danh sách đề thi (nếu có)
      // fetchDeThi();
    } catch (err) {
      setFormMsg(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  // Fetch điểm lớp khi component mount
  useEffect(() => {
    fetchDiemLop();
  }, []);

  // Xử lý đăng xuất
  const handleLogout = () => {
    try {
      // "Fire and forget" request
      fetch("http://localhost:5000/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Lỗi khi gửi yêu cầu đăng xuất:", err);
    }
    // Xóa state ở client
    dispatch(actions.set_user_info(null));
    // Chuyển hướng
    history.push("/login");
  };

  // Hàm render bảng điểm (để giữ JSX gọn gàng)
  const renderDiemLopTable = () => {
    if (diemLoading)
      return <p className="loading-message">Đang tải điểm lớp...</p>;
    if (diemError) return <p className="error-message">{diemError}</p>;
    if (diemLop.length === 0)
      return <p className="empty-message">Chưa có điểm nào.</p>;

    return (
      <table className="diem-table">
        <thead>
          <tr>
            <th>Lớp</th>
            <th>Họ tên</th>
            <th>Điểm</th>
            <th>Đề thi</th>
          </tr>
        </thead>
        <tbody>
          {diemLop.map((d, i) => (
            <tr key={i}>
              {/* Nên dùng key={d.id} nếu có */}
              <td>{d.lop}</td>
              <td>{d.hoTen}</td>
              <td>{d.diem}</td>
              <td>{d.tieuDe}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div className="giaovien-page">
      <div className="page-header">
        {/* Thêm '?' để tránh lỗi khi state.userInfo là null */}
        <h2>Xin chào, {state.userInfo?.hoTen}</h2>
        <button onClick={handleLogout} className="logout-button">
          Đăng xuất
        </button>
      </div>
      <div className="form-section">
        <h3>Tạo đề thi mới</h3>
        <div className="form-content">
          <input
            type="text"
            placeholder="Tiêu đề"
            value={form.tieuDe}
            onChange={(e) => setForm({ ...form, tieuDe: e.target.value })}
            disabled={formLoading}
          />
          <input
            type="text"
            placeholder="Lớp (VD: CNTT1, KTPM2...)"
            value={form.lop}
            onChange={(e) => setForm({ ...form, lop: e.target.value })}
            disabled={formLoading}
          />
          <textarea
            placeholder="Mô tả"
            value={form.moTa}
            onChange={(e) => setForm({ ...form, moTa: e.target.value })}
            disabled={formLoading}
          />
          <button onClick={taoDeThi} disabled={formLoading}>
            {formLoading ? "Đang tạo..." : "Tạo"}
          </button>
        </div>
        {formMsg && (
          <p
            className={`form-message ${
              formMsg.startsWith("✅") ? "success" : "error"
            }`}
          >
            {formMsg}
          </p>
        )}
      </div>
      <div className="form-section">
        <h3>Thêm câu hỏi vào đề thi</h3>
        <div className="form-content">
          <input
            type="number"
            placeholder="ID đề thi"
            value={questionForm.idDeThi}
            onChange={(e) =>
              setQuestionForm({ ...questionForm, idDeThi: e.target.value })
            }
            disabled={qLoading}
          />
          <textarea
            placeholder="Nội dung câu hỏi"
            value={questionForm.noiDung}
            onChange={(e) =>
              setQuestionForm({ ...questionForm, noiDung: e.target.value })
            }
            disabled={qLoading}
          />
          <input
            type="text"
            placeholder="Đáp án A"
            value={questionForm.dapAnA}
            onChange={(e) =>
              setQuestionForm({ ...questionForm, dapAnA: e.target.value })
            }
            disabled={qLoading}
          />
          <input
            type="text"
            placeholder="Đáp án B"
            value={questionForm.dapAnB}
            onChange={(e) =>
              setQuestionForm({ ...questionForm, dapAnB: e.target.value })
            }
            disabled={qLoading}
          />
          <input
            type="text"
            placeholder="Đáp án C"
            value={questionForm.dapAnC}
            onChange={(e) =>
              setQuestionForm({ ...questionForm, dapAnC: e.target.value })
            }
            disabled={qLoading}
          />
          <input
            type="text"
            placeholder="Đáp án D"
            value={questionForm.dapAnD}
            onChange={(e) =>
              setQuestionForm({ ...questionForm, dapAnD: e.target.value })
            }
            disabled={qLoading}
          />

          <select
            value={questionForm.dapAnDung}
            onChange={(e) =>
              setQuestionForm({ ...questionForm, dapAnDung: e.target.value })
            }
            disabled={qLoading}
          >
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
            <option value="D">D</option>
          </select>

          <button onClick={taoCauHoi} disabled={qLoading}>
            {qLoading ? "Đang thêm..." : "Thêm câu hỏi"}
          </button>
        </div>
        {qMsg && (
          <p
            className={`form-message ${
              qMsg.startsWith("✅") ? "success" : "error"
            }`}
          >
            {qMsg}
          </p>
        )}
      </div>

      {/* Phần điểm lớp */}
      <div className="diemlop-section">
        <h3>Điểm lớp</h3>
        {renderDiemLopTable()}
      </div>
    </div>
  );
}
