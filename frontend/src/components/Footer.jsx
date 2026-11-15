import React from 'react';
import { ShieldAlert, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 mt-auto py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-teal-600 text-white flex items-center justify-center font-bold text-xs">
              <ShieldAlert className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-semibold text-slate-800 text-sm">
              Civic<span className="text-teal-600">Fix</span>
            </span>
            <span className="text-slate-400 text-xs">|</span>
            <span className="text-xs text-slate-500">
              Smart Civic Complaint Reporting System
            </span>
          </div>

          <div className="text-xs text-slate-500 text-center md:text-right">
            {/* <p>
              Academic Project for Full Stack Web Development CA-3.
            </p>
            <p className="mt-0.5 text-slate-400">
              Disclaimer: Demonstrative platform only. Not officially affiliated with any government municipality.
            </p> */}
          </div>
        </div>
      </div>
    </footer>
  );
}
