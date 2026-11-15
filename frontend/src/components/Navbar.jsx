import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ShieldAlert,
  Menu,
  X,
  PlusCircle,
  FileText,
  LayoutDashboard,
  LogOut,
  User,
  ShieldCheck,
} from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, isCitizen, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold shadow-sm">
                <ShieldAlert className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight text-slate-900 leading-none">
                  Civic<span className="text-teal-600">Fix</span>
                </span>
                <span className="text-[10px] text-slate-500 font-medium">Smart Civic Portal</span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            <Link
              to="/"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive('/')
                  ? 'text-teal-700 bg-teal-50'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Home
            </Link>

            {/* Citizen Nav Items */}
            {isAuthenticated && isCitizen && (
              <>
                <Link
                  to="/citizen/dashboard"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    isActive('/citizen/dashboard')
                      ? 'text-teal-700 bg-teal-50'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                <Link
                  to="/report"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    isActive('/report')
                      ? 'text-teal-700 bg-teal-50'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <PlusCircle className="w-4 h-4" />
                  Report Issue
                </Link>
                <Link
                  to="/my-complaints"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    isActive('/my-complaints')
                      ? 'text-teal-700 bg-teal-50'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  My Complaints
                </Link>
              </>
            )}

            {/* Admin Nav Items */}
            {isAuthenticated && isAdmin && (
              <>
                <Link
                  to="/admin/dashboard"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    isActive('/admin/dashboard')
                      ? 'text-teal-700 bg-teal-50'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Admin Dashboard
                </Link>
                <Link
                  to="/admin/manage"
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    isActive('/admin/manage')
                      ? 'text-teal-700 bg-teal-50'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  Manage Complaints
                </Link>
              </>
            )}
          </nav>

          {/* User Auth Buttons / Profile */}
          <div className="hidden md:flex items-center space-x-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                  <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-semibold text-slate-800 leading-tight">
                      {user?.name}
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium capitalize">
                      {user?.role}
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-md transition-colors"
                  title="Sign out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-3.5 py-1.5 text-sm font-medium text-slate-700 hover:text-teal-600 hover:bg-slate-50 rounded-md transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-1.5 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-md shadow-sm transition-colors"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-4 space-y-2">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-100"
          >
            Home
          </Link>

          {isAuthenticated && isCitizen && (
            <>
              <Link
                to="/citizen/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-100"
              >
                Dashboard
              </Link>
              <Link
                to="/report"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-100"
              >
                Report Issue
              </Link>
              <Link
                to="/my-complaints"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-100"
              >
                My Complaints
              </Link>
            </>
          )}

          {isAuthenticated && isAdmin && (
            <>
              <Link
                to="/admin/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-100"
              >
                Admin Dashboard
              </Link>
              <Link
                to="/admin/manage"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-slate-700 hover:bg-slate-100"
              >
                Manage Complaints
              </Link>
            </>
          )}

          <div className="pt-3 border-t border-slate-200">
            {isAuthenticated ? (
              <div className="space-y-2">
                <div className="px-3 py-1">
                  <p className="text-sm font-semibold text-slate-800">{user?.name}</p>
                  <p className="text-xs text-slate-500 capitalize">{user?.role} ({user?.email})</p>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full text-left px-3 py-2 text-sm font-medium text-rose-600 hover:bg-rose-50 rounded-md"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center px-4 py-2 bg-teal-600 text-white rounded-md text-sm font-medium hover:bg-teal-700"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
