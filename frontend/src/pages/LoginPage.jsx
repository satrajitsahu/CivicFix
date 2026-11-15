import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, AlertTriangle, Loader2, ArrowRight, KeyRound } from 'lucide-react';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [formErrors, setFormErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const validate = () => {
    const errors = {};
    if (!formData.email.trim()) {
      errors.email = 'Email address is required';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email.trim())) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    if (!validate()) return;

    setLoading(true);

    try {
      const res = await login(formData.email.trim(), formData.password);

      if (res.success && res.user) {
        // Redirect according to user role
        if (res.user.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          const destination = location.state?.from?.pathname || '/citizen/dashboard';
          navigate(destination);
        }
      }
    } catch (err) {
      setServerError(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Helper for quick filling admin credentials in demo/evaluation mode
  const fillDemoAdmin = () => {
    setFormData({
      email: 'admin@civicfix.local',
      password: 'Admin@12345',
    });
    setFormErrors({});
  };

  return (
    <div className="max-w-md mx-auto my-8 px-4 sm:px-6">
      <div className="bg-white border border-slate-200 rounded-lg p-6 sm:p-8 shadow-sm">
        <div className="text-center mb-6">
          <div className="w-10 h-10 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold mx-auto mb-3 shadow-sm">
            <ShieldAlert className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Sign In to CivicFix</h2>
          <p className="text-xs text-slate-500 mt-1">
            Access your citizen complaint portal or administrative panel
          </p>
        </div>

        {serverError && (
          <div className="mb-4 p-3 rounded bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="e.g. citizen@example.com"
              className={`w-full px-3 py-2 border rounded text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                formErrors.email ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
              }`}
            />
            {formErrors.email && (
              <p className="mt-1 text-xs text-rose-600">{formErrors.email}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Password <span className="text-rose-500">*</span>
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className={`w-full px-3 py-2 border rounded text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                formErrors.password ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
              }`}
            />
            {formErrors.password && (
              <p className="mt-1 text-xs text-rose-600">{formErrors.password}</p>
            )}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-medium text-sm rounded shadow-sm transition-colors disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Demo Administrator Shortcut for CA-3 Viva / Evaluation */}
        <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded text-xs text-slate-600 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <KeyRound className="w-3.5 h-3.5 text-slate-500" />
            <span>Admin account demo:</span>
          </div>
          <button
            type="button"
            onClick={fillDemoAdmin}
            className="text-teal-700 font-semibold hover:underline text-xs"
          >
            Auto-fill Admin
          </button>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-600">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-semibold text-teal-600 hover:text-teal-700">
              Register as Citizen
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
