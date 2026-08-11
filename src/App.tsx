import { Routes, Route, Navigate } from "react-router-dom";
import Transfer from "./pages/Transfer";
import History from "./pages/History";
import Api from "./pages/Api";
import TransactionStatus from "./pages/TransactionStatus";
import Login from "./pages/Login";
import LandingPage from "./pages/LandingPage";
import Loading from "./components/myComponents/Loading";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import { useAuthStore } from "./stores/auth-store";
import { useEffect } from "react";

const App = () => {
  const { user, checkAuth, isCheckingAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const hasAuthCandidate =
    Boolean(localStorage.getItem("accessToken")) ||
    Boolean(localStorage.getItem("refreshToken")) ||
    Boolean(user);

  // Only block rendering when there is a real auth candidate to verify.
  if (isCheckingAuth && hasAuthCandidate) return <Loading />;

  return (
    <Routes>
      {/* Public Routes (Only accessible to guests) */}
      <Route
        path="/"
        element={!user ? <LandingPage /> : <Navigate to="/transfer" replace />}
      />
      <Route
        path="/login"
        element={!user ? <Login /> : <Navigate to="/transfer" replace />}
      />
      <Route
        path="/register"
        element={!user ? <Register /> : <Navigate to="/transfer" replace />}
      />
      <Route
        path="/forgot-password"
        element={!user ? <ForgotPassword /> : <Navigate to="/transfer" replace />}
      />
      <Route
        path="/reset-password/:token"
        element={!user ? <ResetPassword /> : <Navigate to="/transfer" replace />}
      />

      {/* Protected Routes (Only accessible to logged-in users) */}
      <Route
        path="/transfer"
        element={user ? <Transfer /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/history"
        element={user ? <History /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/api"
        element={user ? <Api /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/dashboard"
        element={user ? <Dashboard /> : <Navigate to="/login" replace />}
      />
      <Route
        path="/status/:transactionId"
        element={user ? <TransactionStatus /> : <Navigate to="/login" replace />}
      />

      {/* Fallback Route for undefined URLs */}
      <Route
        path="*"
        element={<Navigate to={user ? "/transfer" : "/"} replace />}
      />
    </Routes>
  );
};

export default App;
