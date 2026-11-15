import React from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import { SERVER_BASE_URL } from '../services/api';
import { MapPin, Calendar, Trash2, ExternalLink, AlertCircle } from 'lucide-react';

export default function ComplaintCard({ complaint, onDelete, isDeleting, showActions = true, currentRole = 'citizen' }) {
  const canDelete =
    currentRole === 'admin' ||
    (currentRole === 'citizen' && complaint.status === 'Pending');

  // Format date
  const formattedDate = new Date(complaint.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="bg-white rounded-lg border border-slate-200 hover:border-slate-300 transition-shadow p-5 flex flex-col justify-between shadow-sm">
      <div>
        <div className="flex items-start justify-between gap-3 mb-2">
          <span className="text-xs font-medium px-2 py-0.5 rounded bg-slate-100 text-slate-700">
            {complaint.category}
          </span>
          <StatusBadge status={complaint.status} />
        </div>

        <h3 className="text-base font-semibold text-slate-900 mb-1 line-clamp-1 hover:text-teal-700">
          <Link to={`/complaints/${complaint._id}`}>{complaint.title}</Link>
        </h3>

        <p className="text-xs text-slate-600 mb-3 line-clamp-2">
          {complaint.description}
        </p>

        {complaint.image && (
          <div className="mb-3 rounded overflow-hidden bg-slate-100 max-h-36 flex items-center justify-center border border-slate-100">
            <img
              src={`${SERVER_BASE_URL}${complaint.image}`}
              alt={complaint.title}
              className="w-full h-36 object-cover hover:scale-105 transition-transform duration-200"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
        )}
      </div>

      <div className="pt-3 border-t border-slate-100 space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1 line-clamp-1 max-w-[65%]" title={complaint.location}>
            <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
            <span className="truncate">{complaint.location}</span>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Calendar className="w-3.5 h-3.5" />
            <span>{formattedDate}</span>
          </div>
        </div>

        {showActions && (
          <div className="flex items-center justify-between pt-1 gap-2">
            <Link
              to={`/complaints/${complaint._id}`}
              className="inline-flex items-center gap-1 text-xs font-medium text-teal-700 hover:text-teal-800 hover:underline"
            >
              <span>View Details</span>
              <ExternalLink className="w-3 h-3" />
            </Link>

            {canDelete && onDelete && (
              <button
                onClick={() => onDelete(complaint._id)}
                disabled={isDeleting}
                className="inline-flex items-center gap-1 text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2 py-1 rounded transition-colors"
                title={
                  complaint.status !== 'Pending' && currentRole === 'citizen'
                    ? 'Only pending complaints can be deleted'
                    : 'Delete complaint'
                }
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
