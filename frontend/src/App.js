// React and Router imports
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Components imports
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import PublicRoute from "./components/PublicRoute";
import MapLoader from "./context/pages/MapLoader";
// ✅ import MapLoader

// Context import
import { AuthProvider } from "./context/AuthContext";

// Pages imports
import AdminDashboard from "./context/pages/AdminDashboard";
import AnalyticsDashboard from "./context/pages/AnalyticsDashboard";
import Dashboard from "./context/pages/Dashboard";
import Home from "./context/pages/Home";
import Login from "./context/pages/Login";
import ManageReports from "./context/pages/ManageReports";
import NotificationsPage from "./context/pages/NotificationsPage";
import Register from "./context/pages/Register";
import ReportForm from "./context/pages/ReportForm";
import ReportList from "./context/pages/ReportList";
import Reports from "./context/pages/Reports";
import Unauthorized from "./context/pages/Unauthorized";

// CSS import
import "./App.css";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <div className="app-container">
          <MapLoader> {/* ✅ Wrap routes with MapLoader */}
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route
                path="/login"
                element={
                  <PublicRoute>
                    <Login />
                  </PublicRoute>
                }
              />
              <Route
                path="/register"
                element={
                  <PublicRoute>
                    <Register />
                  </PublicRoute>
                }
              />
              <Route path="/unauthorized" element={<Unauthorized />} />

              {/* Protected Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute requiredRoles={["citizen"]}>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/submit-report"
                element={
                  <ProtectedRoute requiredRoles={["citizen", "law_enforcement", "admin"]}>
                    <ReportForm />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/reports"
                element={
                  <ProtectedRoute requiredRoles={["law_enforcement", "admin"]}>
                    <ReportList />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/all-reports"
                element={
                  <ProtectedRoute requiredRoles={["citizen", "law_enforcement", "admin"]}>
                    <Reports />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/manage-reports"
                element={
                  <ProtectedRoute requiredRoles={["law_enforcement"]}>
                    <ManageReports />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin-dashboard"
                element={
                  <ProtectedRoute requiredRoles={["admin"]}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/analytics"
                element={
                  <ProtectedRoute requiredRoles={["admin", "law_enforcement"]}>
                    <AnalyticsDashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/notifications"
                element={
                  <ProtectedRoute requiredRoles={["citizen", "law_enforcement", "admin"]}>
                    <NotificationsPage />
                  </ProtectedRoute>
                }
              />

              {/* 404 Fallback */}
              <Route path="*" element={<div>404 - Page Not Found</div>} />
            </Routes>
          </MapLoader> {/* ✅ End of MapLoader */}
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
