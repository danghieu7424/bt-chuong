import React, { useState } from "react";
import "./style.scss";
import LoadingSpinner from "../base/LoadingSpinner";
import {useStore} from "../../store"

export default function ProfileEditor({ user, isAdmin = false, onSaved }) {
  const [state, dispatch] = useStore()
  const [fullName, setFullName] = useState(user.fullName);
  const [role, setRole] = useState(user.role);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const body = { fullName };
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
