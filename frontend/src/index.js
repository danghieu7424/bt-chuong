import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router } from "react-router-dom";
import { StoreProvider } from "./store";

// import MainContent from "./main.jsx";

// ------------ CSS ---------------
import "./components/base/js/toast.js";
import "./components/base/js/loader.js";
import "./access/css/base.css";
import "./components/base/css/style.css";
import "./access/fonts/fonts_css/fonts.css";
// --------------------------------

import LoginScreen from "./components/auth/LoginScreen.jsx"
import Dashboard from "./components/common/Dashboard.jsx"

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

// export default function App() {
//   const [user, setUser] = useState(null);

//   if (!user) {
//     return <LoginScreen onLogin={setUser} />;
//   }

//   return <Dashboard user={user} onLogout={() => setUser(null)} />;
// }

export default function App() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-80 p-6 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition duration-300">
        <h1 className="text-2xl font-semibold text-gray-800 mb-3 text-center">
          Tailwind + Webpack Demo
        </h1>
        <p className="text-gray-600 text-center mb-4">
          Đây là ví dụ box có bo góc, đổ bóng và hover rõ ràng.
        </p>
        <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 active:scale-95 transition">
          Click me
        </button>
      </div>
    </div>
  );
}



// Render ứng dụng React vào phần tử có id 'root'
ReactDOM.render(<App />, document.getElementById("root"));
