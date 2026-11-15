import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import HomePage from './pages/HomePage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import CitizenDashboard from './pages/CitizenDashboard';
import ReportComplaintPage from './pages/ReportComplaintPage';
import MyComplaintsPage from './pages/MyComplaintsPage';
import ComplaintDetailsPage from './pages/ComplaintDetailsPage';
import AdminDashboard from './pages/AdminDashboard';
import ManageComplaintsPage from './pages/ManageComplaintsPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen bg-slate-50 text-slate-900 font-sans">
          <Navbar />

          <main className="flex-1">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<HomePage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/login" element={<LoginPage />} />

              {/* Citizen Protected Routes */}
              <Route
                path="/citizen/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['citizen']}>
                    <CitizenDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/report"
                element={
                  <ProtectedRoute allowedRoles={['citizen']}>
                    <ReportComplaintPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/my-complaints"
                element={
                  <ProtectedRoute allowedRoles={['citizen']}>
                    <MyComplaintsPage />
                  </ProtectedRoute>
                }
              />

              {/* Authenticated Shared Route (Both Citizen & Admin can view details with role-based actions) */}
              <Route
                path="/complaints/:id"
                element={
                  <ProtectedRoute>
                    <ComplaintDetailsPage />
                  </ProtectedRoute>
                }
              />

              {/* Admin Protected Routes */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/manage"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <ManageComplaintsPage />
                  </ProtectedRoute>
                }
              />

              {/* 404 Catch-All Route */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </main>

          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}
