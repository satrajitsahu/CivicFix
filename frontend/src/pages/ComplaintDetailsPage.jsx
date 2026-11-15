import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { complaintService, adminService, SERVER_BASE_URL } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/StatusBadge';
import ComplaintForm from '../components/ComplaintForm';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Clock,
  User,
  Trash2,
  Edit,
  Loader2,
  AlertTriangle,
  CheckCircle,
  ShieldCheck,
} from 'lucide-react';

export default function ComplaintDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin, isCitizen } = useAuth();

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Admin status update state
  const [selectedStatus, setSelectedStatus] = useState('');
  const [statusSuccess, setStatusSuccess] = useState('');

  const fetchComplaint = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await complaintService.getComplaintById(id);
      if (res.success && res.complaint) {
        setComplaint(res.complaint);
        setSelectedStatus(res.complaint.status);
      }
    } catch (err) {
      setError(err.message || 'Failed to load complaint details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaint();
  }, [id]);

  const handleDelete = async () => {
    const confirmMessage = isAdmin
      ? 'Are you sure you want to delete this complaint as administrator?'
      : 'Are you sure you want to delete your pending complaint?';

    if (!window.confirm(confirmMessage)) return;

    try {
      setActionLoading(true);
      const res = await complaintService.deleteComplaint(id);
      if (res.success) {
        alert('Complaint deleted successfully.');
        if (isAdmin) {
          navigate('/admin/manage');
        } else {
          navigate('/my-complaints');
        }
      }
    } catch (err) {
      alert(err.message || 'Failed to delete complaint.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAdminStatusChange = async (e) => {
    e.preventDefault();
    setStatusSuccess('');
    try {
      setActionLoading(true);
      const res = await adminService.updateStatus(id, selectedStatus);
      if (res.success) {
        setComplaint(res.complaint);
        setStatusSuccess(`Status successfully updated to ${selectedStatus}!`);
        setTimeout(() => setStatusSuccess(''), 4000);
      }
    } catch (err) {
      alert(err.message || 'Failed to update status.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600 mx-auto mb-2" />
        <p className="text-sm">Loading complaint details...</p>
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded">
          <AlertTriangle className="w-6 h-6 text-rose-600 mx-auto mb-2" />
          <p>{error || 'Complaint not found.'}</p>
        </div>
        <Link
          to={isAdmin ? '/admin/manage' : '/my-complaints'}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Complaints
        </Link>
      </div>
    );
  }

  const isOwner = isCitizen && complaint.user?._id === user?._id;
  const canEdit = isOwner && complaint.status === 'Pending';
  const canDelete = isAdmin || (isOwner && complaint.status === 'Pending');

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Top back navigation */}
      <div className="flex items-center justify-between">
        <Link
          to={isAdmin ? '/admin/manage' : '/my-complaints'}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to {isAdmin ? 'Admin Management' : 'My Complaints'}</span>
        </Link>

        <div className="flex items-center gap-2">
          {canEdit && !isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-teal-700 bg-teal-50 border border-teal-200 rounded hover:bg-teal-100 transition-colors"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Edit Report</span>
            </button>
          )}

          {canDelete && (
            <button
              onClick={handleDelete}
              disabled={actionLoading}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 rounded hover:bg-rose-100 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          )}
        </div>
      </div>

      {isEditing ? (
        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
            <h2 className="text-lg font-bold text-slate-900">Edit Complaint Details</h2>
            <button
              onClick={() => setIsEditing(false)}
              className="text-xs text-slate-500 hover:text-slate-800"
            >
              Cancel Edit
            </button>
          </div>
          <ComplaintForm
            initialData={complaint}
            isEditing={true}
            onSubmitSuccess={(updated) => {
              setComplaint(updated);
              setIsEditing(false);
            }}
          />
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-lg p-6 sm:p-8 shadow-sm space-y-6">
          {/* Header */}
          <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="space-y-1">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-slate-100 text-slate-700">
                {complaint.category}
              </span>
              <h1 className="text-2xl font-bold text-slate-900 pt-1">
                {complaint.title}
              </h1>
            </div>
            <StatusBadge status={complaint.status} />
          </div>

          {/* Metadata Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-xs text-slate-600 bg-slate-50 p-4 rounded-md border border-slate-100">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-teal-600 shrink-0" />
              <div>
                <span className="block font-semibold text-slate-800">Location</span>
                <span>{complaint.location}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
              <div>
                <span className="block font-semibold text-slate-800">Reported On</span>
                <span>{new Date(complaint.createdAt).toLocaleString()}</span>
              </div>
            </div>

            {complaint.user && (
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <span className="block font-semibold text-slate-800">Reported By</span>
                  <span>{complaint.user.name} ({complaint.user.email})</span>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
              Detailed Description
            </h3>
            <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed bg-white border border-slate-100 p-4 rounded">
              {complaint.description}
            </p>
          </div>

          {/* Photo */}
          {complaint.image && (
            <div className="space-y-2">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                Attached Photograph
              </h3>
              <div className="rounded-lg overflow-hidden border border-slate-200 bg-slate-100 max-w-xl">
                <img
                  src={`${SERVER_BASE_URL}${complaint.image}`}
                  alt={complaint.title}
                  className="w-full h-auto max-h-96 object-contain"
                />
              </div>
            </div>
          )}

          {/* Administrator Action Panel */}
          {isAdmin && (
            <div className="pt-6 border-t border-slate-200 bg-slate-50 -mx-6 -mb-6 sm:-mx-8 sm:-mb-8 p-6 sm:p-8 rounded-b-lg space-y-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-teal-700" />
                <h3 className="text-sm font-bold text-slate-900">
                  Administrator Status Control
                </h3>
              </div>

              {statusSuccess && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  <span>{statusSuccess}</span>
                </div>
              )}

              <form onSubmit={handleAdminStatusChange} className="flex flex-wrap items-center gap-3">
                <label className="text-xs font-semibold text-slate-700">
                  Change Status to:
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="text-xs border border-slate-300 rounded px-3 py-1.5 bg-white font-medium focus:ring-2 focus:ring-teal-500"
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Rejected">Rejected</option>
                </select>

                <button
                  type="submit"
                  disabled={actionLoading || selectedStatus === complaint.status}
                  className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded text-xs font-semibold shadow-sm disabled:opacity-50 transition-colors"
                >
                  {actionLoading ? 'Updating...' : 'Save Status'}
                </button>
              </form>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
