import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import StatusBadge from '../components/StatusBadge';
import { adminService, complaintService } from '../services/api';
import {
  Filter,
  Search,
  Loader2,
  AlertTriangle,
  RotateCcw,
  Trash2,
  ExternalLink,
  MapPin,
  CheckCircle,
} from 'lucide-react';

const CATEGORIES = [
  'All',
  'Roads & Potholes',
  'Garbage Accumulation',
  'Broken Streetlights',
  'Water Leakage',
  'Drainage Problems',
  'Other Civic Issues',
];

const STATUSES = ['All', 'Pending', 'In Progress', 'Resolved', 'Rejected'];

export default function ManageComplaintsPage() {
  const [searchParams] = useSearchParams();
  const initialStatus = searchParams.get('status') || 'All';

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState(initialStatus);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await adminService.getAllComplaints({
        category: selectedCategory,
        status: selectedStatus,
        search: searchQuery,
        sortBy,
      });

      if (res.success) {
        setComplaints(res.complaints);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch complaints list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [selectedCategory, selectedStatus, sortBy]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchComplaints();
  };

  const handleQuickStatusChange = async (id, newStatus) => {
    try {
      setActionLoadingId(id);
      const res = await adminService.updateStatus(id, newStatus);
      if (res.success) {
        // Update local complaint in state
        setComplaints((prev) =>
          prev.map((c) => (c._id === id ? { ...c, status: newStatus } : c))
        );
      }
    } catch (err) {
      alert(err.message || 'Status update failed.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('As administrator, are you sure you want to permanently delete this complaint?')) {
      return;
    }

    try {
      setActionLoadingId(id);
      const res = await complaintService.deleteComplaint(id);
      if (res.success) {
        setComplaints((prev) => prev.filter((c) => c._id !== id));
      }
    } catch (err) {
      alert(err.message || 'Failed to delete complaint.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleResetFilters = () => {
    setSelectedCategory('All');
    setSelectedStatus('All');
    setSearchQuery('');
    setSortBy('newest');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <Sidebar role="admin" />

        <div className="flex-1 space-y-6">
          <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
            {/* Header */}
            <div className="mb-6 pb-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-xl font-bold text-slate-900">
                  Manage Civic Complaints
                </h1>
                <p className="text-xs text-slate-500 mt-1">
                  Inspect, change statuses, and delete duplicate or invalid municipal reports
                </p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md self-start sm:self-auto">
                Total: {complaints.length}
              </span>
            </div>

            {/* Filter and Search Bar */}
            <div className="space-y-4 mb-6">
              <form onSubmit={handleSearchSubmit} className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search complaints by title, location or description..."
                    className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-medium rounded transition-colors"
                >
                  Search
                </button>
              </form>

              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs text-slate-600">
                  <Filter className="w-3.5 h-3.5 text-slate-400" />
                  <span>Category:</span>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-600">
                  <span>Status:</span>
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  >
                    {STATUSES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-600">
                  <span>Sort By:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="status">By Status</option>
                  </select>
                </div>

                {(selectedCategory !== 'All' || selectedStatus !== 'All' || searchQuery || sortBy !== 'newest') && (
                  <button
                    onClick={handleResetFilters}
                    className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 underline ml-auto"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset
                  </button>
                )}
              </div>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded flex items-center gap-2 mb-4">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            {/* Complaints Table */}
            {loading ? (
              <div className="py-16 text-center text-slate-500 flex flex-col items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-teal-600 mb-2" />
                <p className="text-xs">Fetching complaint records...</p>
              </div>
            ) : complaints.length > 0 ? (
              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="min-w-full divide-y divide-slate-200 text-left text-xs">
                  <thead className="bg-slate-50 text-slate-700 font-semibold">
                    <tr>
                      <th className="px-4 py-3">Complaint Details</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3">Citizen</th>
                      <th className="px-4 py-3">Current Status</th>
                      <th className="px-4 py-3">Update Status</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white text-slate-700">
                    {complaints.map((c) => (
                      <tr key={c._id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3 max-w-xs">
                          <Link
                            to={`/complaints/${c._id}`}
                            className="font-semibold text-slate-900 hover:text-teal-700 line-clamp-1"
                          >
                            {c.title}
                          </Link>
                          <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5 truncate">
                            <MapPin className="w-3 h-3 text-teal-600 shrink-0" />
                            <span className="truncate">{c.location}</span>
                          </div>
                        </td>

                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[11px]">
                            {c.category}
                          </span>
                        </td>

                        <td className="px-4 py-3 whitespace-nowrap">
                          <p className="font-medium text-slate-800">{c.user?.name || 'Citizen'}</p>
                          <p className="text-[10px] text-slate-400">{c.user?.email || '-'}</p>
                        </td>

                        <td className="px-4 py-3 whitespace-nowrap">
                          <StatusBadge status={c.status} />
                        </td>

                        <td className="px-4 py-3 whitespace-nowrap">
                          <select
                            value={c.status}
                            disabled={actionLoadingId === c._id}
                            onChange={(e) => handleQuickStatusChange(c._id, e.target.value)}
                            className="border border-slate-300 rounded px-2 py-1 text-xs text-slate-800 bg-white focus:outline-none focus:ring-1 focus:ring-teal-500"
                          >
                            <option value="Pending">Pending</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Resolved">Resolved</option>
                            <option value="Rejected">Rejected</option>
                          </select>
                        </td>

                        <td className="px-4 py-3 whitespace-nowrap text-right space-x-2">
                          <Link
                            to={`/complaints/${c._id}`}
                            className="inline-flex items-center gap-1 text-teal-700 hover:underline font-medium"
                          >
                            <span>Inspect</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>

                          <button
                            onClick={() => handleDelete(c._id)}
                            disabled={actionLoadingId === c._id}
                            className="inline-flex items-center gap-1 text-rose-600 hover:text-rose-800 p-1 rounded hover:bg-rose-50"
                            title="Delete complaint"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-12 border border-dashed border-slate-200 rounded-lg text-center space-y-2">
                <p className="text-sm font-medium text-slate-700">No complaints found</p>
                <p className="text-xs text-slate-500">
                  Try adjusting or clearing your search or filter options.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
