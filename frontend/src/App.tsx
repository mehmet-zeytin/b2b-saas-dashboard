import {
  useState,
} from "react";

import {
  Navigate,
  Route,
  Routes,
  useNavigate,
} from "react-router-dom";

import Header from "./components/layout/Header";
import Sidebar from "./components/layout/Sidebar";

import CustomersPage from "./pages/CustomersPage";
import DashboardHome from "./pages/DashboardHome";
import LoginPage from "./pages/LoginPage";
import SettingsPage from "./pages/SettingsPage";
import TransactionsPage from "./pages/TransactionsPage";

export default function App() {
  const [searchTerm, setSearchTerm] =
    useState("");

  const [isAuthenticated, setIsAuthenticated] =
    useState<boolean>(
      localStorage.getItem("isAuthenticated") ===
        "true"
    );

  const navigate = useNavigate();

  function handleLoginSuccess(): void {
    setIsAuthenticated(true);
    navigate("/");
  }

  function handleLogout(): void {
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("currentUser");

    setIsAuthenticated(false);
    navigate("/login");
  }

  if (!isAuthenticated) {
    return (
      <Routes>
        <Route
          path="/login"
          element={
            <LoginPage
              onLoginSuccess={handleLoginSuccess}
            />
          }
        />

        <Route
          path="*"
          element={
            <Navigate
              to="/login"
              replace
            />
          }
        />
      </Routes>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onLogout={handleLogout}
        />

        <main className="flex-1 p-6">
          <Routes>
            <Route
              path="/"
              element={<DashboardHome />}
            />

            <Route
              path="/customers"
              element={
                <CustomersPage
                  searchTerm={searchTerm}
                />
              }
            />

            <Route
              path="/transactions"
              element={
                <TransactionsPage
                  searchTerm={searchTerm}
                />
              }
            />

            <Route
              path="/settings"
              element={<SettingsPage />}
            />

            <Route
              path="*"
              element={
                <Navigate
                  to="/"
                  replace
                />
              }
            />
          </Routes>
        </main>
      </div>
    </div>
  );
}