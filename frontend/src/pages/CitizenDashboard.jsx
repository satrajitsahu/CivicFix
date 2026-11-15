import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { complaintService } from '../services/api';
import Sidebar from '../components/Sidebar';
import ComplaintCard from '../components/ComplaintCard';
import {
  PlusCircle,
  Clock,
  Loader2,
  CheckCircle2,
  FileText,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

export default function CitizenDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState({
    stats: { total: 0, pending: 0, inProgress: 0, resolved: 0, rejected: 0 },
    complaints: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await complaintService.getMyComplaints();
      if (res.success) {
        setData(res);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch your complaint records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this pending complaint?')) {
      return;
    }

    try {
      setDeletingId(id);
      const res = await complaintService.deleteComplaint(id);
      if (res.success) {
        // Refresh dashboard data
        fetchDashboardData();
      }
    } catch (err) {
      alert(err.message || 'Could not delete complaint.');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Navigation Sidebar */}
        <Sidebar role="citizen" />

        {/* Main Content Area */}
        <div className="flex-1 space-y-6">
          {/* Welcome Header */}
          <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                Welcome back, {user?.name}!
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Citizen Portal • Manage your reported issues and track local municipal action
              </p>
            </div>
            <Link
              to="/report"
              className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-md shadow-sm transition-colors shrink-0"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Report New Issue</span>
            </Link>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Metric Cards (Real MongoDB Counts) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-500">Total Submitted</span>
                <FileText className="w-4 h-4 text-slate-400" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{data.stats.total}</p>
              <p className="text-[11px] text-slate-400 mt-1">All time reports</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-500">Pending</span>
                <Clock className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-2xl font-bold text-amber-600">{data.stats.pending}</p>
              <p className="text-[11px] text-slate-400 mt-1">Awaiting review</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-500">In Progress</span>
                <Loader2 className="w-4 h-4 text-sky-500" />
              </div>
              <p className="text-2xl font-bold text-sky-600">{data.stats.inProgress}</p>
              <p className="text-[11px] text-slate-400 mt-1">Assigned to team</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-slate-500">Resolved</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-2xl font-bold text-emerald-600">{data.stats.resolved}</p>
              <p className="text-[11px] text-slate-400 mt-1">Work completed</p>
            </div>
          </div>

          {/* Recent Complaints Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">Your Recent Complaints</h2>
              <Link
                to="/my-complaints"
                className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1"
              >
                <span>View all ({data.stats.total})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {loading ? (
              <div className="bg-white border border-slate-200 rounded-lg p-8 text-center text-slate-500 flex flex-col items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-teal-600 mb-2" />
                <p className="text-xs">Loading your complaints...</p>
              </div>
            ) : data.complaints.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {data.complaints.slice(0, 4).map((complaint) => (
                  <ComplaintCard
                    key={complaint._id}
                    complaint={complaint}
                    onDelete={handleDelete}
                    isDeleting={deletingId === complaint._id}
                    currentRole="citizen"
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white border border-slate-200 rounded-lg p-8 text-center space-y-3">
                <p className="text-sm text-slate-600">You haven't reported any civic complaints yet.</p>
                <Link
                  to="/report"
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 text-white rounded text-xs font-medium hover:bg-teal-700"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  Report Your First Complaint
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
