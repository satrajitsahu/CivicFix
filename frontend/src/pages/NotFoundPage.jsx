import React from 'react';
import { Link } from 'react-router-dom';
import { AlertCircle, ArrowLeft, Home } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
      <div className="max-w-md w-full bg-white border border-slate-200 rounded-lg p-8 text-center shadow-sm space-y-4">
        <div className="w-12 h-12 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6 text-slate-600" />
        </div>

        <h1 className="text-3xl font-extrabold text-slate-900">404</h1>
        <h2 className="text-lg font-bold text-slate-800">Page Not Found</h2>
        <p className="text-xs text-slate-500">
          The civic portal page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>

        <div className="pt-2 flex items-center justify-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded shadow-sm transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Back to Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
