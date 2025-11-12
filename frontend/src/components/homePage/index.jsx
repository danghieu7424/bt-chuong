import React from "react"; // Xóa các import không dùng
import { useHistory } from "react-router-dom";
import { useStore, actions } from "../../store";

import "./style.scss";

// const btn = { ... }; // <= Đã bị xóa và chuyển sang SCSS

export default function HomePage() {
  const [state, dispatch] = useStore();
  const history = useHistory();

  // Hàm đăng xuất
  const handleLogout = () => {
    try {
      fetch("http://localhost:5000/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Lỗi khi đăng xuất:", err);
    }
    dispatch(actions.set_user_info(null));
    history.push("/login");
  };

  // Thêm bảo vệ, nếu userInfo chưa kịp tải (hoặc đã logout)
  // thì không render gì cả (hoặc render loading)
  if (!state.userInfo) {
    return null; // Hoặc <p>Đang tải...</p>
  }

  return (
    <div className="home-page">
      <h1>🏫 Hệ thống Quản lý Thi</h1>
      <h3>
        Xin chào, {state.userInfo.hoTen} ({state.userInfo.role})
      </h3>

      {/* Thay div và style inline bằng className */}
      <div className="role-actions">
        {state.userInfo.role === "sinhvien" && (
          <>
            {/* Thay style={btn} bằng className="btn" */}
            <button
              onClick={() => history.push("/sinhvien")}
              className="btn"
            >
              📚 Xem điểm
            </button>
          </>
        )}

        {state.userInfo.role === "giaovien" && (
          <>
            <button
              onClick={() => history.push("/giaovien")}
              className="btn"
            >
              🧑‍🏫 Quản lý đề thi & điểm lớp
            </button>
          </>
        )}

        {state.userInfo.role === "admin" && (
          <>
            <button
              onClick={() => history.push("/admin")}
              className="btn"
            >
              ⚙️ Quản lý người dùng
            </button>
          </>
        )}
      </div>

      {/* Thay div và style inline bằng className */}
      <div className="logout-section">
        {/* Thay style override bằng 2 className */}
        <button onClick={handleLogout} className="btn btn-logout">
          🚪 Đăng xuất
        </button>
      </div>
    </div>
  );
}