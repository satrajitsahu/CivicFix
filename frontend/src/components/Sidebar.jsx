import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  PlusCircle,
  FileText,
  ShieldCheck,
  BarChart3,
  User,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ role = 'citizen' }) {
  const { user } = useAuth();

  const citizenLinks = [
    { to: '/citizen/dashboard', label: 'Overview', icon: LayoutDashboard },
    { to: '/report', label: 'Report Issue', icon: PlusCircle },
    { to: '/my-complaints', label: 'My Complaints', icon: FileText },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Dashboard Stats', icon: BarChart3 },
    { to: '/admin/manage', label: 'Manage Complaints', icon: ShieldCheck },
  ];

  const links = role === 'admin' ? adminLinks : citizenLinks;

  return (
    <aside className="w-full md:w-64 bg-white border border-slate-200 rounded-lg p-4 h-fit shrink-0">
      <div className="flex items-center gap-3 pb-4 mb-4 border-b border-slate-100">
        <div className="w-10 h-10 rounded-full bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700 font-semibold">
          {user?.name?.charAt(0).toUpperCase() || <User className="w-5 h-5" />}
        </div>
        <div className="overflow-hidden">
          <p className="text-sm font-semibold text-slate-800 truncate">{user?.name}</p>
          <p className="text-xs text-slate-500 capitalize">{user?.role} Portal</p>
        </div>
      </div>

      <nav className="space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              end
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-teal-50 text-teal-700 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
