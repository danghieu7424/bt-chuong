import React, { useEffect, useState, useRef } from "react";
import { Link, useHistory } from "react-router-dom";
import { useStore, actions } from "../../store";

import logoImg from "./assets/logo/logo.png";
import "./style.scss";

export default function Header() {
  const [state, dispatch] = useStore();
  const [showInfo, setShowInfo] = useState(false);
  const boxInfoRef = useRef(null);
  const history = useHistory();

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/auth/me", {
          method: "GET",
          credentials: "include", // rất quan trọng: gửi cookie
        });
        const data = await res.json();
        if (res.ok) {
          dispatch(actions.set_user_info(data)); // set user info
        }
      } catch (err) {
        console.log("Chưa đăng nhập");
      }
    };

    checkLogin();
  }, []);

  return (
    <div className="header">
      <div className="header-left">
        <Link to="/"><img
            // src={}
            alt="Logo"
            className="logo-img"
            style={{ width: "3rem", height: "3rem" }}
          /></Link>
      </div>
      <div className="header-center">
       
      </div>
      <div className="header-right">
        
      </div>
    </div>
  );
}
