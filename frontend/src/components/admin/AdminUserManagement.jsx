import React, { useState, useEffect } from "react";
import "./style.scss";
import LoadingSpinner from "../base/LoadingSpinner";
import Modal from "../base/Modal";
import ProfileEditor from "../common/ProfileEditor"; // nhớ import đúng path
import { useStore } from "../../store";

export default function AdminUserManagement() {
  const [state] = useStore();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);

  // ✅ load dữ liệu thật từ backend
  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${state.domain}/api/admin/users`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Không thể tải danh sách người dùng");
      const data = await res.json();
      setUsers(data);
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // ✅ Gửi request cập nhật người dùng
  const handleUpdate = async (profile) => {
    try {
      const res = await fetch(`${state.domain}/api/admin/users/${editingUser.id}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: profile.fullName,
          email: profile.email,
          role: profile.role,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Không thể cập nhật người dùng");
      }

      alert("Cập nhật thành công");
      setEditingUser(null);
      loadUsers();
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="user-management">
      <h3 className="title">Quản lý người dùng</h3>
      <table className="table">
        <thead>
          <tr>
            <th>Họ tên</th>
            <th>Username</th>
            <th>Email</th>
            <th>Vai trò</th>
            <th className="text-center">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.full_name}</td>
              <td>{user.username}</td>
              <td>{user.email}</td>
              <td>
                <span
                  className={`role-badge ${
                    user.role === "admin"
                      ? "role-admin"
                      : user.role === "teacher"
                      ? "role-teacher"
                      : "role-student"
                  }`}
                >
                  {user.role}
                </span>
              </td>
              <td className="text-center">
                <button
                  onClick={() => setEditingUser(user)}
                  className="btn-edit"
                >
                  Sửa
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {editingUser && (
        <Modal
          title={`Sửa thông tin: ${editingUser.full_name}`}
          onClose={() => setEditingUser(null)}
        >
          <ProfileEditor
            user={editingUser}
            onSave={handleUpdate}
            isAdmin={true}
          />
        </Modal>
      )}
    </div>
  );
}
