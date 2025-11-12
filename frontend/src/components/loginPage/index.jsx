import React, { useState, useEffect, useRef } from "react";
import { useHistory } from "react-router-dom";
import { useStore, actions } from "../../store";
import "./style.scss";

export default function Login() {
  const [state, dispatch] = useStore();
  const history = useHistory();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Ref để kiểm tra component còn mounted không
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleLogin = async () => {
    if (isLoading) return;

    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
        credentials: "include", // quan trọng!
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Đăng nhập thất bại");

      if (isMounted.current) {
        dispatch(actions.set_user_info(data));
        history.push("/");
      }
    } catch (err) {
      if (isMounted.current) setError(err.message);
    } finally {
      if (isMounted.current) setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleLogin();
  };

  return (
    <div className="login-overlay">
      <div className="login-page">
        <h2>Đăng nhập</h2>
        <div className="login-content">
          <input
            type="text"
            placeholder="Tài khoản"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={isLoading}
          />
          <input
            type="password"
            placeholder="Mật khẩu"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={isLoading}
          />
          <button onClick={handleLogin} disabled={isLoading}>
            {isLoading ? "Đang xử lý..." : "Đăng nhập"}
          </button>
        </div>
        {error && <p className="error-message">{error}</p>}
      </div>
    </div>
  );
}
