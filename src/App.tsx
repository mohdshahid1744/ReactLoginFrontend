import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import LoginRegister from "./Component/Login";
import Home from "./Component/Home";
import PublicRouterUser from "./RouteUser/PublicRoute";
import PrivateRoute from "./RouteUser/PrivateRoute";

const App: React.FC = () => {
  const isLoggedIn = (): boolean => {
    return localStorage.getItem('jwt') !== null;
  };

  return (
    <div className="App">
      <Router>
        <Routes>
          <Route element={<PublicRouterUser />}>
            <Route
              path="/"
              element={isLoggedIn() ? <Navigate to="/home" /> : <LoginRegister />}
            />
          </Route>
          <Route element={<PrivateRoute />}>
            <Route path='/home' element={<Home />} />
          </Route>
        </Routes>
      </Router>
    </div>
  );
}

export default App;

