import React, { useState } from "react";
import "./style.scss";
import LoadingSpinner from "../base/LoadingSpinner";
import { useStore } from "../../store";

export default function ChangePassword() {
  const [state] = useStore();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    const res = await fetch(`${state.domain}/api/auth/change-password`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ oldPassword, newPassword }),
    });

    const data = await res.json();
    alert(data.message);
  };

  return (
    <form className="change-password-form" onSubmit={submit}>
      <div className="form-group">
        <label>Mật khẩu cũ</label>
        <input
          type="password"
          onChange={(e) => setOldPassword(e.target.value)}
          required
        />
      </div>

      <div className="form-group">
        <label>Mật khẩu mới</label>
        <input
          type="password"
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
      </div>

      <button className="btn-submit" type="submit">
        Đổi mật khẩu
      </button>
    </form>
  );
}
