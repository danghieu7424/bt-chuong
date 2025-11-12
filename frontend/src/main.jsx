import React from "react";
import { Route, Switch, useLocation } from "react-router-dom";
import { LoaderPage } from "./components/base/LoaderForm.jsx";
import { useStore } from "./store";

// ------------ Components ---------------
import Header from "./components/headerPage";
import HomePage from "./components/homePage";
import AuthPage from "./components/loginPage";

import SinhVien from "./components/sinhVienPage";
import GiaoVien from "./components/giaoVienPage";
import AdminPage from "./components/adminPage";

// ---------------------------------------

function MainContent() {
  const location = useLocation();
  // const hideHeader = location.pathname === "/auth";
  const [state, dispatch] = useStore();

  return (
    <>
      {state.isLogin && <AuthPage />}
      <Header />
      <div className="page-container">
        <Switch>
          <Route exact path="/" component={HomePage} />
          <Route exact path="/login" component={AuthPage} />
          <Route path="/sinhvien" component={SinhVien} />
          <Route path="/giaovien" component={GiaoVien} />
          <Route path="/admin" component={AdminPage} />
          <Route path="*" component={() => <div>404 Not Found</div>} /> 
        </Switch>
      </div>
    </>
  );
}

export default MainContent;
