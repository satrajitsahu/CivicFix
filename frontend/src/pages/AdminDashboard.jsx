import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { adminService } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import {
  BarChart3,
  Users,
  CheckCircle2,
  Clock,
  Loader2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  MapPin,
  ExternalLink,
} from 'lucide-react';

export default function AdminDashboard() {
  const [statsData, setStatsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await adminService.getStatistics();
      if (res.success && res.statistics) {
        setStatsData(res.statistics);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch administrative statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <Sidebar role="admin" />

        <div className="flex-1 space-y-6">
          {/* Header */}
          <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-slate-900">
                Administrative Control Panel
              </h1>
              <p className="text-xs text-slate-500 mt-1">
                Real-time MongoDB Atlas telemetry and municipal workflow oversight
              </p>
            </div>
            <Link
              to="/admin/manage"
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded shadow-sm transition-colors shrink-0"
            >
              <span>Manage Complaints</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {loading ? (
            <div className="py-16 text-center text-slate-500 flex flex-col items-center justify-center bg-white border border-slate-200 rounded-lg">
              <Loader2 className="w-6 h-6 animate-spin text-teal-600 mb-2" />
              <p className="text-xs">Computing real-time analytics from database...</p>
            </div>
          ) : statsData ? (
            <>
              {/* Stat Cards Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-slate-500">Total Reported</span>
                    <BarChart3 className="w-4 h-4 text-slate-400" />
                  </div>
                  <p className="text-2xl font-bold text-slate-900">
                    {statsData.totalComplaints}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">Total database records</p>
                </div>

                <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-slate-500">Pending Review</span>
                    <Clock className="w-4 h-4 text-amber-500" />
                  </div>
                  <p className="text-2xl font-bold text-amber-600">
                    {statsData.pendingComplaints}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">Requires inspection</p>
                </div>

                <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-slate-500">In Progress</span>
                    <Loader2 className="w-4 h-4 text-sky-500" />
                  </div>
                  <p className="text-2xl font-bold text-sky-600">
                    {statsData.inProgressComplaints}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">Active field operations</p>
                </div>

                <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-slate-500">Resolved</span>
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  </div>
                  <p className="text-2xl font-bold text-emerald-600">
                    {statsData.resolvedComplaints}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">Work verified complete</p>
                </div>
              </div>

              {/* Extra summary row: Registered Citizens & Category Distribution */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Category Aggregation Card */}
                <div className="lg:col-span-2 bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h2 className="text-sm font-bold text-slate-900">
                      Complaints Breakdown by Category
                    </h2>
                    <span className="text-[11px] text-slate-400">Aggregation Pipeline</span>
                  </div>

                  {statsData.categoryStats?.length > 0 ? (
                    <div className="space-y-3">
                      {statsData.categoryStats.map((item) => {
                        const percentage = statsData.totalComplaints > 0
                          ? Math.round((item.count / statsData.totalComplaints) * 100)
                          : 0;
                        return (
                          <div key={item._id} className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span className="font-medium text-slate-700">{item._id}</span>
                              <span className="text-slate-500">
                                {item.count} ({percentage}%)
                              </span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                              <div
                                className="bg-teal-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${percentage}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 py-4 text-center">
                      No category metrics available yet.
                    </p>
                  )}
                </div>

                {/* Registered Citizens & Quick Actions Card */}
                <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                      <h2 className="text-sm font-bold text-slate-900">Registered Citizens</h2>
                      <Users className="w-4 h-4 text-teal-600" />
                    </div>
                    <p className="text-3xl font-bold text-slate-900">
                      {statsData.totalCitizens}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Active citizen accounts in MongoDB database
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 space-y-2">
                    <p className="text-xs font-semibold text-slate-700">Quick Actions</p>
                    <Link
                      to="/admin/manage?status=Pending"
                      className="block w-full text-center px-3 py-2 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded text-xs font-medium transition-colors"
                    >
                      Review Pending Complaints ({statsData.pendingComplaints})
                    </Link>
                    <Link
                      to="/admin/manage"
                      className="block w-full text-center px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded text-xs font-medium transition-colors"
                    >
                      View All Reports
                    </Link>
                  </div>
                </div>
              </div>

              {/* Recent Activity Section */}
              <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h2 className="text-sm font-bold text-slate-900">
                    Recent Complaint Activity
                  </h2>
                  <Link
                    to="/admin/manage"
                    className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-1"
                  >
                    <span>View all</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {statsData.recentActivity?.length > 0 ? (
                  <div className="divide-y divide-slate-100">
                    {statsData.recentActivity.map((c) => (
                      <div
                        key={c._id}
                        className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                      >
                        <div className="space-y-0.5 max-w-lg">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-slate-900">
                              {c.title}
                            </span>
                            <StatusBadge status={c.status} />
                          </div>
                          <div className="flex items-center gap-3 text-[11px] text-slate-500">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-teal-600" />
                              {c.location}
                            </span>
                            <span>•</span>
                            <span>Citizen: {c.user?.name || 'Citizen'}</span>
                            <span>•</span>
                            <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>

                        <Link
                          to={`/complaints/${c._id}`}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 hover:underline shrink-0"
                        >
                          <span>Inspect</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 py-4 text-center">
                    No recent complaint activity found.
                  </p>
                )}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
