import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, AlertTriangle, Loader2, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [formErrors, setFormErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const validate = () => {
    const errors = {};
    if (!formData.name.trim()) {
      errors.name = 'Full name is required';
    } else if (formData.name.trim().length < 3) {
      errors.name = 'Name must be at least 3 characters long';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email address is required';
    } else if (!/^\S+@\S+\.\S+$/.test(formData.email.trim())) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters long';
    }

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
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
      const res = await register(
        formData.name.trim(),
        formData.email.trim(),
        formData.password
      );

      if (res.success) {
        navigate('/citizen/dashboard');
      }
    } catch (err) {
      setServerError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-8 px-4 sm:px-6">
      <div className="bg-white border border-slate-200 rounded-lg p-6 sm:p-8 shadow-sm">
        <div className="text-center mb-6">
          <div className="w-10 h-10 rounded-lg bg-teal-600 text-white flex items-center justify-center font-bold mx-auto mb-3 shadow-sm">
            <ShieldAlert className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Create Citizen Account</h2>
          <p className="text-xs text-slate-500 mt-1">
            Register to submit, monitor and manage civic complaints
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
              Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Ramesh Kumar"
              className={`w-full px-3 py-2 border rounded text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                formErrors.name ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
              }`}
            />
            {formErrors.name && (
              <p className="mt-1 text-xs text-rose-600">{formErrors.name}</p>
            )}
          </div>

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
              Password (minimum 6 characters) <span className="text-rose-500">*</span>
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

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Confirm Password <span className="text-rose-500">*</span>
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              className={`w-full px-3 py-2 border rounded text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 ${
                formErrors.confirmPassword ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
              }`}
            />
            {formErrors.confirmPassword && (
              <p className="mt-1 text-xs text-rose-600">{formErrors.confirmPassword}</p>
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
                  <span>Registering...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-600">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-teal-600 hover:text-teal-700">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
