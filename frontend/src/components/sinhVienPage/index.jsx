import React, { useEffect, useState } from "react";
import { useStore, actions } from "../../store";
import "./style.scss"; // Đổi tên file SCSS nếu cần

export default function SinhVien() {
  const [state, dispatch] = useStore();
  const [diem, setDiem] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Thêm trạng thái loading

  useEffect(() => {
    // Nếu không có userInfo (ví dụ: đã logout), thì không làm gì cả
    if (!state.userInfo) {
      setDiem([]); // Xóa điểm cũ (nếu có)
      return;
    }

    const fetchDiem = async () => {
      setIsLoading(true); // Bắt đầu loading
      setError("");       // Xóa lỗi cũ

      console.log("Bắt đầu tải điểm...");
      try {
        const res = await fetch("http://localhost:5000/api/sinhvien/diem", {
          method: "GET",
          credentials: "include", // Giữ nguyên, quan trọng để gửi cookie
        });
        console.log("Phản hồi từ server:", res);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Lỗi khi tải điểm");
        console.log("Dữ liệu điểm nhận được:", data);
        setDiem(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false); // Dừng loading
      }
    };

    fetchDiem();
  }, [state.userInfo]); // Chỉ fetch lại khi userInfo thay đổi (login/logout)

  const handleLogout = () => {
      // Giả sử token được lưu trong localStorage
      try {
        fetch("http://localhost:5000/api/auth/logout", {
          method: "POST",
          credentials: "include", // Gửi cookie để logout
        });
      } catch (err) {
        console.error("Lỗi khi đăng xuất:", err);
      }
      dispatch(actions.set_user_info(null));
      // (Tùy chọn: Chuyển hướng về trang đăng nhập)
      history.push("/login");
    };


  // Hiển thị nội dung dựa trên trạng thái
  const renderContent = () => {
    if (isLoading) {
      return <p className="loading-message">Đang tải danh sách điểm...</p>;
    }

    if (error) {
      return <p className="error-message">{error}</p>;
    }

    if (diem.length === 0) {
      return <p className="empty-message">Bạn chưa có điểm nào.</p>;
    }

    return (
      <table className="diem-table">
        <thead>
          <tr>
            <th>Đề thi</th>
            <th>Điểm</th>
            <th>Ngày làm</th>
          </tr>
        </thead>
        <tbody>
          {diem.map((d, i) => ( // Tạm dùng key={i}, nếu có ID thì dùng d.id
            <tr key={i}>
              <td>{d.tieuDe}</td>
              <td>{d.diem}</td>
              {/* Định dạng ngày tháng cho dễ đọc */}
              <td>{new Date(d.ngayLam).toLocaleString('vi-VN')}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  // Cần kiểm tra state.userInfo trước khi render,
  // vì sau khi logout, state.userInfo sẽ là null
  if (!state.userInfo) {
    return null; // Hoặc chuyển hướng về trang login
  }

  return (
    <div className="sinhvien-page">
      <div className="page-header">
        <h2>Xin chào, {state.userInfo.hoTen}</h2>
        <button onClick={handleLogout} className="logout-button">
          Đăng xuất
        </button>
      </div>

      <h3>Danh sách điểm của bạn</h3>
      {renderContent()}
    </div>
  );
}