import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import ComplaintForm from '../components/ComplaintForm';
import { ShieldAlert, CheckCircle2, ArrowLeft } from 'lucide-react';

export default function ReportComplaintPage() {
  const navigate = useNavigate();
  const [successComplaint, setSuccessComplaint] = useState(null);

  const handleSuccess = (complaint) => {
    setSuccessComplaint(complaint);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        <Sidebar role="citizen" />

        <div className="flex-1 space-y-6">
          <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
            {successComplaint ? (
              <div className="py-8 text-center space-y-4">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-bold text-slate-900">
                  Complaint Filed Successfully!
                </h2>
                <p className="text-xs text-slate-600 max-w-md mx-auto">
                  Your complaint <span className="font-semibold text-slate-800">"{successComplaint.title}"</span> has been logged under ID{' '}
                  <span className="font-mono bg-slate-100 px-1 py-0.5 rounded text-slate-700">
                    {successComplaint._id}
                  </span>{' '}
                  with initial status <span className="font-semibold text-amber-700">Pending</span>.
                </p>
                <div className="flex items-center justify-center gap-3 pt-3">
                  <button
                    onClick={() => setSuccessComplaint(null)}
                    className="px-4 py-2 text-xs font-semibold text-teal-700 bg-teal-50 border border-teal-200 rounded hover:bg-teal-100"
                  >
                    Report Another Issue
                  </button>
                  <button
                    onClick={() => navigate('/my-complaints')}
                    className="px-4 py-2 text-xs font-semibold text-white bg-teal-600 rounded hover:bg-teal-700 shadow-sm"
                  >
                    View My Complaints
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="mb-6 pb-4 border-b border-slate-100">
                  <h1 className="text-xl font-bold text-slate-900">
                    Report a Civic Complaint
                  </h1>
                  <p className="text-xs text-slate-500 mt-1">
                    Fill out the form below with clear location landmarks and details. Our Community Duplicate Alert will automatically check for similar reports in your locality.
                  </p>
                </div>

                <ComplaintForm onSubmitSuccess={handleSuccess} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
