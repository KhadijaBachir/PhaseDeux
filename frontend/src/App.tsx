import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import RegisterPage from "./pages/RegisterPage";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from './pages/ResetPassword';
import Dashboard from "./pages/Dashboard";
import List from "./pages/List";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        {/* Page de connexion */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />

        {/* Page d'inscription */}
        <Route
          path="/register"
          element={<RegisterPage onSwitchToLogin={() => {}} />}
        />

        {/* Mot de passe oublié */}
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* La réinitialisation du mot de passe */}
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Dashboard après connexion */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Listes des hotels*/}
        <Route path="/List" element={<List/>} />


      </Routes>
    </Router>
  );
};

export default App;
