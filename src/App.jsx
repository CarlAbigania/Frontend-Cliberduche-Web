import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Homepage from "./pages/public/Homepage";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Profile from "./pages/auth/Profile";
import AdminDashboard from "./pages/admin/AdminDashboard";
import ClientManagement from "./pages/admin/ClientManagement";
import AdminAppointments from "./pages/admin/Appointments";
import ScheduleManagement from "./pages/admin/ScheduleManagement";   // <-- new import
import ProjectManagement from "./pages/admin/ProjectManagement";
import ClientDashboard from "./pages/client/ClientDashboard";
import ClientAppointments from "./pages/client/Appointments";
import ClientProjects from "./pages/client/Projects";
import Notifications from "./pages/common/Notifications";
import ActivityHistory from "./pages/common/ActivityHistory";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";

import PublicRoute from "./components/routes/PublicRoute";
import ProtectedLayout from "./components/routes/ProtectedLayout";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="grid-bg bg-white dark:bg-gray-900" />

          <Routes>
            {/* ===== PUBLIC ROUTES ===== */}
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

            <Route path="/*" element={<Homepage />} />

            {/* ===== ROUTES FOR ANY AUTHENTICATED USER (admin + client) ===== */}
            <Route element={<ProtectedLayout allowedRoles={['admin', 'client']} />}>
              <Route path="/profile" element={<Profile />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/activity-history" element={<ActivityHistory />} />
            </Route>

            {/* ===== CLIENT-ONLY ROUTES ===== */}
            <Route element={<ProtectedLayout allowedRoles={['client']} />}>
              <Route path="/client" element={<ClientDashboard />} />
              <Route path="/client/appointments" element={<ClientAppointments />} />
              <Route path="/client/projects" element={<ClientProjects />} />
            </Route>

            {/* ===== ADMIN-ONLY ROUTES ===== */}
            <Route element={<ProtectedLayout allowedRoles={['admin']} />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/clients" element={<ClientManagement />} />
              <Route path="/admin/appointments" element={<AdminAppointments />} />
              <Route path="/admin/schedules" element={<ScheduleManagement />} />   {/* <-- new route */}
              <Route path="/admin/projects" element={<ProjectManagement />} />
            </Route>

            {/* ===== FALLBACK ===== */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;