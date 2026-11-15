import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600 mb-2" />
        <p className="text-sm">Verifying session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect unauthenticated users to login with state for return redirect
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If specific roles are required (e.g. 'admin' or 'citizen')
  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    // Redirect to their appropriate dashboard if role does not match
    if (user?.role === 'admin') {
      return <Navigate to="/admin/dashboard" replace />;
    } else {
      return <Navigate to="/citizen/dashboard" replace />;
    }
  }

  return children;
}
