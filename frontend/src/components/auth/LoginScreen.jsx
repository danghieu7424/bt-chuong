import React, { useState, useEffect, useMemo } from "react";
import "./style.scss";
import LoadingSpinner from "../base/LoadingSpinner";
import Modal from "../base/Modal";
import convertScore from "../utils/gradeConverter";
import { useStore } from "../../store";

export default function LoginScreen({ onLogin }) {
  const [state, dispatch] = useStore();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    let isMounted = true;

    try {
      const res = await fetch(`${state.domain}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Đăng nhập thất bại");
      }

      // Gọi callback onLogin với thông tin user
      onLogin(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
    return () => { isMounted = false };
  };

  return (
    <div className="login-screen">
      <div className="login-box">
        <h2 className="login-title">Đăng nhập Hệ thống Quản lý Thi</h2>

        {error && <div className="error-box">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="username">Tên đăng nhập</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Mật khẩu</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" disabled={loading} className="btn-submit">
            {loading ? (
              <svg
                className="spinner"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="circle"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="path"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.3 0 0 5.3 0 12h4zm2 5.3A8 8 0 014 12H0c0 3 1.1 5.8 3 7.9l3-2.6z"
                ></path>
              </svg>
            ) : (
              "Đăng nhập"
            )}
          </button>
        </form>

        {/* <div className="demo-info">
          <p>Thông tin đăng nhập demo:</p>
          <ul>
            <li>sv_an / password (SinhVien)</li>
            <li>gv_thanh / password (GiaoVien)</li>
            <li>admin / password (Admin)</li>
          </ul>
        </div> */}
      </div>
    </div>
  );
}
