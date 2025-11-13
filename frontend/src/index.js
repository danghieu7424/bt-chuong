import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router } from "react-router-dom";
import { StoreProvider, useStore } from "./store";

// import MainContent from "./main.jsx";

// ------------ CSS ---------------
import "./components/base/js/toast.js";
import "./components/base/js/loader.js";
import "./access/css/base.css";
import "./components/base/css/style.css";
import "./access/fonts/fonts_css/fonts.css";
// --------------------------------

import LoginScreen from "./components/auth/LoginScreen.jsx";
import Dashboard from "./components/common/Dashboard.jsx";

// Component chính
// function App() {

//   return (
//     <StoreProvider>
//       <Router>
//         <MainContent />
//       </Router>
//     </StoreProvider>
//   );
// }

export default function App() {
  const [state, dispatch] = useStore();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Kiểm tra session khi load trang
    fetch(`${state.domain}/api/auth/me`, {
      method: "GET",
      credentials: "include", // gửi cookie
      headers: { "Content-Type": "application/json" },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Not logged in");
        return res.json();
      })
      .then((data) => {
        setUser(data); // data là thông tin user từ backend
      })
      .catch(() => {
        setUser(null); // chưa login hoặc cookie hết hạn
      });
    // .finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    try {
      const res = await fetch(`${state.domain}/api/auth/logout`, {
        method: "POST",
        credentials: "include", // gửi cookie
        headers: { "Content-Type": "application/json" },
      });
      if (!res.ok) throw new Error("Logout failed");
      setUser(null); // Xóa user trong state
    } catch (err) {
      console.error(err);
      alert("Đăng xuất thất bại");
    }
  };

  if (!user) {
    return <LoginScreen onLogin={setUser} />;
  }

  return <Dashboard user={user} onLogout={handleLogout} />;
}

// Render ứng dụng React vào phần tử có id 'root'
ReactDOM.render(
  <StoreProvider>
    <App />
  </StoreProvider>,
  document.getElementById("root")
);
