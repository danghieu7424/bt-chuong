import React, { useState } from "react";

export default function ChangePassword({ user, logout }) {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [msg, setMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");

    if (newPassword !== confirmPassword) {
      setMsg("Mật khẩu mới và xác nhận không khớp");
      return;
    }

    try {
      const body = { newPassword };
      if (user.role !== "admin") body.oldPassword = oldPassword;

      const res = await fetch("http://localhost:5000/api/changePassword/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Đổi mật khẩu thất bại");

      setMsg(data.message);

      // Nếu đổi thành công, gợi ý logout
      if (res.ok) {
        alert("Đổi mật khẩu thành công, vui lòng đăng nhập lại");
        logout();
      }
    } catch (err) {
      setMsg(err.message);
    }
  };

  return (
    <div style={{ width: 400, margin: "50px auto", fontFamily: "sans-serif" }}>
      <h2>Đổi mật khẩu</h2>
      <form onSubmit={handleSubmit}>
        {user.role !== "admin" && (
          <div style={{ marginBottom: 10 }}>
            <input
              type="password"
              placeholder="Mật khẩu cũ"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              style={inputStyle}
              required
            />
          </div>
        )}

        <div style={{ marginBottom: 10 }}>
          <input
            type="password"
            placeholder="Mật khẩu mới"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            style={inputStyle}
            required
          />
        </div>

        <div style={{ marginBottom: 10 }}>
          <input
            type="password"
            placeholder="Xác nhận mật khẩu"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            style={inputStyle}
            required
          />
        </div>

        <button type="submit" style={btnStyle}>
          Đổi mật khẩu
        </button>
      </form>

      {msg && <p style={{ marginTop: 20, color: "red" }}>{msg}</p>}
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "8px",
  fontSize: "14px",
  borderRadius: "4px",
  border: "1px solid #ccc"
};

const btnStyle = {
  width: "100%",
  padding: "10px",
  backgroundColor: "#3498db",
  color: "#fff",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "16px"
};
