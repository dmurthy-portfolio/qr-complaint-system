// =====================================================================
// App — top-level router.
// "/"                    → public complaint submission form (QR target)
// "/admin/login"         → admin login
// "/admin/dashboard"     → protected admin dashboard
// =====================================================================
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ComplaintForm from './pages/ComplaintForm';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ComplaintForm />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
