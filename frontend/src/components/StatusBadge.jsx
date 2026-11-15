import React from 'react';
import { Clock, Loader2, CheckCircle2, XCircle } from 'lucide-react';

export default function StatusBadge({ status }) {
  const getBadgeStyle = (status) => {
    switch (status) {
      case 'Pending':
        return {
          container: 'bg-amber-50 text-amber-800 border-amber-200',
          dot: 'bg-amber-500',
          icon: Clock,
        };
      case 'In Progress':
        return {
          container: 'bg-sky-50 text-sky-800 border-sky-200',
          dot: 'bg-sky-500',
          icon: Loader2,
        };
      case 'Resolved':
        return {
          container: 'bg-emerald-50 text-emerald-800 border-emerald-200',
          dot: 'bg-emerald-500',
          icon: CheckCircle2,
        };
      case 'Rejected':
        return {
          container: 'bg-rose-50 text-rose-800 border-rose-200',
          dot: 'bg-rose-500',
          icon: XCircle,
        };
      default:
        return {
          container: 'bg-slate-100 text-slate-700 border-slate-200',
          dot: 'bg-slate-400',
          icon: Clock,
        };
    }
  };

  const config = getBadgeStyle(status);
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.container}`}
    >
      <Icon className={`w-3.5 h-3.5 ${status === 'In Progress' ? 'animate-spin' : ''}`} />
      <span>{status || 'Unknown'}</span>
    </span>
  );
}
