import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import ComplaintCard from '../components/ComplaintCard';
import { complaintService } from '../services/api';
import {
  Filter,
  Search,
  PlusCircle,
  Loader2,
  AlertTriangle,
  RotateCcw,
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

export default function MyComplaintsPage() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  // Filters State
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await complaintService.getMyComplaints({
        category: selectedCategory,
        status: selectedStatus,
        search: searchQuery,
      });

      if (res.success) {
        setComplaints(res.complaints);
      }
    } catch (err) {
      setError(err.message || 'Error fetching complaints.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [selectedCategory, selectedStatus]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchComplaints();
  };

  const handleResetFilters = () => {
    setSelectedCategory('All');
    setSelectedStatus('All');
    setSearchQuery('');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this pending complaint?')) {
      return;
    }

    try {
      setDeletingId(id);
      const res = await complaintService.deleteComplaint(id);
      if (res.success) {
        // Remove from state directly
        setComplaints((prev) => prev.filter((c) => c._id !== id));
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
        <Sidebar role="citizen" />

        <div className="flex-1 space-y-6">
          <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
              <div>
                <h1 className="text-xl font-bold text-slate-900">My Complaints</h1>
                <p className="text-xs text-slate-500 mt-1">
                  History and live progress of all civic issues you have reported
                </p>
              </div>

              <Link
                to="/report"
                className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded shadow-sm transition-colors shrink-0"
              >
                <PlusCircle className="w-4 h-4" />
                <span>New Complaint</span>
              </Link>
            </div>

            {/* Filter and Search Controls */}
            <div className="space-y-4 mb-6">
              <form onSubmit={handleSearchSubmit} className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search your complaints by title or location..."
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

                {(selectedCategory !== 'All' || selectedStatus !== 'All' || searchQuery) && (
                  <button
                    onClick={handleResetFilters}
                    className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-800 underline ml-auto"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Reset Filters
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

            {/* Complaints List / Grid */}
            {loading ? (
              <div className="py-12 text-center text-slate-500 flex flex-col items-center justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-teal-600 mb-2" />
                <p className="text-xs">Fetching your complaints...</p>
              </div>
            ) : complaints.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {complaints.map((complaint) => (
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
              <div className="py-12 border border-dashed border-slate-200 rounded-lg text-center space-y-2">
                <p className="text-sm font-medium text-slate-700">No complaints found</p>
                <p className="text-xs text-slate-500">
                  {searchQuery || selectedCategory !== 'All' || selectedStatus !== 'All'
                    ? 'No complaints match your active filter criteria.'
                    : 'You have not submitted any complaints yet.'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
