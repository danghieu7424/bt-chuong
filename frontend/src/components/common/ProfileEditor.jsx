import React, { useState, useEffect } from "react";
import "./style.scss";
import LoadingSpinner from "../base/LoadingSpinner";
import { useStore } from "../../store";

const formatDate = (date) => {
  if (!date) return "";
  return new Date(date).toISOString().split("T")[0];
};

export default function ProfileEditor({user, isAdmin = false, onSaved }) {
  const [state, dispatch] = useStore();
  const [fullName, setFullName] = useState(user.fullName);
  const [role, setRole] = useState(user.role);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [birthday, setBirthday] = useState(formatDate(user.birthday) || "");
  const [address, setAddress] = useState(user.address || "");
  const [className, setClassName] = useState(user.className || "");
  const [email, setEmail] = useState(user.email || "");

  useEffect(() => {
    fetch(`${state.domain}/api/students/profile`, {
      method: "GET",
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Không thể tải hồ sơ");
        return res.json();
      })
      .then((data) => {

        console.log(data)
        // Set các field vào state
        setFullName(data.fullName || "");
        setRole(data.role || "");
        setBirthday(formatDate(data.birthday));
        setAddress(data.address || "");
        setClassName(data.className || "");
        setEmail(data.email || "");
      })
      .catch((err) => setError(err.message));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const body = {
        fullName,
        birthday,
        address,
        className,
        email,
      };

      if (isAdmin) body.role = role;

      const url = isAdmin
        ? `/api/admin/users/${user.id}`
        : `/api/students/profile`;

      const res = await fetch(`${state.domain}${url}`, {
        method: "PUT",
        credentials: "include", // gửi cookie JWT
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Lỗi khi cập nhật profile");
      }

      if (onSaved) onSaved({ ...user, fullName, role });
      alert("Cập nhật thành công!");
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="profile-editor" onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Họ tên</label>
        <input
          type="text"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label>Ngày sinh</label>
        <input
          type="date"
          value={birthday}
          onChange={(e) => setBirthday(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label>Địa chỉ</label>
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
      </div>

      {user.role === "student" && (
        <div className="form-group">
          <label>Lớp</label>
          <input
            type="text"
            value={className}
            onChange={(e) => setClassName(e.target.value)}
          />
        </div>
      )}

      <div className="form-group">
        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      {isAdmin && (
        <div className="form-group">
          <label>Vai trò</label>
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="student">Sinh viên</option>
            <option value="teacher">Giáo viên</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      )}

      {error && <p className="error-message">{error}</p>}

      <button type="submit" className="btn-submit" disabled={submitting}>
        {submitting ? "Đang lưu..." : "Lưu thay đổi"}
      </button>
    </form>
  );
}
