import React, { useState, useEffect, useMemo } from 'react';
import "./style.scss"
import LoadingSpinner from "../base/LoadingSpinner"
import Modal from "../base/Modal"
import convertScore from "../utils/gradeConverter"

export default function AdminUserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);

  const loadUsers = () => {
    setLoading(true);
    fakeApi.getAllUsers().then(data => {
      setUsers(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadUsers();
  }, []);
  
  const handleUpdate = async (profile) => {
    await fakeApi.updateProfile(editingUser.id, profile);
    setEditingUser(null);
    loadUsers();
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="overflow-x-auto">
      <h3 className="text-2xl font-semibold mb-4">Quản lý người dùng</h3>
      <table className="min-w-full bg-white rounded-lg shadow">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-3 text-left">Họ tên</th>
            <th className="p-3 text-left">Username</th>
            <th className="p-3 text-left">Vai trò</th>
            <th className="p-3 text-center">Hành động</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id} className="border-b hover:bg-gray-50">
              <td className="p-3 font-medium">{user.fullName}</td>
              <td className="p-3">{user.username}</td>
              <td className="p-3">
                 <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                   user.role === 'admin' ? 'bg-red-100 text-red-800' :
                   user.role === 'teacher' ? 'bg-blue-100 text-blue-800' :
                   'bg-green-100 text-green-800'
                 }`}>
                   {user.role}
                 </span>
              </td>
              <td className="p-3 text-center">
                <button
                  onClick={() => setEditingUser(user)}
                  className="text-blue-600 hover:underline"
                >
                  Sửa
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {editingUser && (
        <Modal title={`Sửa thông tin: ${editingUser.fullName}`} onClose={() => setEditingUser(null)}>
          <ProfileEditor
            user={editingUser}
            onSave={handleUpdate}
            isAdmin={true} // Cho phép Admin sửa vai trò
          />
        </Modal>
      )}
    </div>
  );
}