import React, { useState } from "react";
import { useStore, actions } from "../../store"; // Import 'actions'
import { useHistory } from "react-router-dom"; // Import 'useHistory' (cho v5)
import "./style.scss"; // Import file SCSS

export default function Admin() {
  const [state, dispatch] = useStore();
  const history = useHistory(); // Khởi tạo history

  const [form, setForm] = useState({
    id: "",
    hoTen: "",
    email: "",
    role: "",
    lop: "",
  });
  const [msg, setMsg] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Thêm trạng thái loading

  const updateUser = async () => {
    // Thêm kiểm tra ID cơ bản
    if (!form.id) {
      setMsg("Vui lòng nhập ID người dùng để cập nhật.");
      return;
    }

    setIsLoading(true);
    setMsg("");

    try {
      const res = await fetch(
        `http://localhost:5000/api/admin/updateUser/${form.id}`,
        {
          method: "PUT",
          credentials: "include",
          headers: { // <-- SỬA LỖI: Thiếu headers
            "Content-Type": "application/json",
          },
          body: JSON.stringify(form), // Gửi toàn bộ form
        }
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Cập nhật thất bại");
      setMsg("✅ Cập nhật thành công");
    } catch (err) {
      setMsg(err.message);
    } finally {
      setIsLoading(false); // Luôn tắt loading
    }
  };

  const handleLogout = () => {
    try {
      fetch("http://localhost:5000/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Lỗi khi đăng xuất:", err);
    }
    dispatch(actions.set_user_info(null)); // 'actions' đã được import
    history.push("/login"); // 'history' đã được import
  };

  return (
    <div className="admin-page"> {/* Thay style inline bằng className */}
      <div className="page-header">
        <h2>Admin Dashboard</h2>
        <button onClick={handleLogout} className="logout-button">
          Đăng xuất
        </button>
      </div>

      <div className="form-section">
        <h3>Cập nhật thông tin người dùng</h3>
        <div className="form-content">
          <input
            type="text"
            placeholder="ID người dùng (Bắt buộc)"
            value={form.id}
            onChange={(e) => setForm({ ...form, id: e.target.value })}
            disabled={isLoading}
          />
          <input
            type="text"
            placeholder="Họ tên"
            value={form.hoTen}
            onChange={(e) => setForm({ ...form, hoTen: e.target.value })}
            disabled={isLoading}
          />
          <input
            type="text" // Hoặc type="email"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            disabled={isLoading}
          />
          <input
            type="text"
            placeholder="Lớp"
            value={form.lop}
            onChange={(e) => setForm({ ...form, lop: e.target.value })}
            disabled={isLoading}
          />
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
            disabled={isLoading}
          >
            <option value="">Chọn role</option>
            <option value="sinhvien">Sinh viên</option>
            <option value="giaovien">Giảng viên</option>
            <option value="admin">Admin</option>
          </select>
          <button onClick={updateUser} disabled={isLoading}>
            {isLoading ? "Đang cập nhật..." : "Cập nhật"}
          </button>
        </div>

        {/* Phân lớp message thành công/lỗi */}
        {msg && (
          <p className={`form-message ${msg.startsWith('✅') ? 'success' : 'error'}`}>
            {msg}
          </p>
        )}
      </div>
    </div>
  );
}