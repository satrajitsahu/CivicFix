import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { complaintService } from '../services/api';
import ComplaintCard from '../components/ComplaintCard';
import {
  ShieldAlert,
  ArrowRight,
  CheckCircle,
  Clock,
  MapPin,
  AlertCircle,
  FileCheck2,
  Users,
} from 'lucide-react';

export default function HomePage() {
  const { isAuthenticated, isCitizen, isAdmin } = useAuth();
  const [publicData, setPublicData] = useState({
    stats: { total: 0, resolved: 0, inProgress: 0, pending: 0 },
    complaints: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPublicData = async () => {
      try {
        const res = await complaintService.getPublicComplaints();
        if (res.success) {
          setPublicData(res);
        }
      } catch (err) {
        console.warn('Could not load public complaints:', err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPublicData();
  }, []);

  const categories = [
    {
      name: 'Roads & Potholes',
      desc: 'Cratered roads, open asphalt, dangerous potholes causing traffic slowdowns and accidents.',
    },
    {
      name: 'Garbage Accumulation',
      desc: 'Overflowing dumpsters, unattended roadside trash and hygiene hazards in residential streets.',
    },
    {
      name: 'Broken Streetlights',
      desc: 'Non-functional street lamps resulting in dark pathways and pedestrian safety risks.',
    },
    {
      name: 'Water Leakage',
      desc: 'Burst municipal supply pipelines, drinking water wastage and low-pressure issues.',
    },
    {
      name: 'Drainage Problems',
      desc: 'Clogged storm drains, stagnant water puddles and sewage overflow during rainfall.',
    },
    {
      name: 'Other Civic Issues',
      desc: 'Illegal encroachment, broken park benches, and unpruned fallen tree branches.',
    },
  ];

  return (
    <div className="space-y-12 pb-12">
      {/* Hero Section */}
      <section className="bg-white border-b border-slate-200 py-12 md:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-teal-800 text-xs font-medium">
            <ShieldAlert className="w-4 h-4 text-teal-600" />
            <span>Community Civic Action Portal</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-slate-900">
            Report Local Problems, <br className="hidden sm:inline" />
            Track Municipal Solutions.
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-600">
            CivicFix is a citizen-driven platform to report damaged roads, garbage overflow,
            broken streetlights and drainage issues directly with real-time status updates.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            {isAuthenticated ? (
              isCitizen ? (
                <Link
                  to="/report"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-teal-600 hover:bg-teal-700 text-white font-medium text-sm shadow-sm transition-colors"
                >
                  <span>Report an Issue Now</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <Link
                  to="/admin/dashboard"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-teal-600 hover:bg-teal-700 text-white font-medium text-sm shadow-sm transition-colors"
                >
                  <span>Go to Admin Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )
            ) : (
              <>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-teal-600 hover:bg-teal-700 text-white font-medium text-sm shadow-sm transition-colors"
                >
                  <span>Register as Citizen</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/login"
                  className="px-5 py-2.5 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium text-sm transition-colors"
                >
                  Citizen / Admin Login
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Real Statistics Strip (From MongoDB Atlas) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-slate-100">
            <div className="pt-2 md:pt-0">
              <p className="text-3xl font-bold text-slate-900">{publicData.stats.total}</p>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">
                Total Complaints Reported
              </p>
            </div>
            <div className="pt-2 md:pt-0">
              <p className="text-3xl font-bold text-amber-600">{publicData.stats.pending}</p>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">
                Pending Verification
              </p>
            </div>
            <div className="pt-2 md:pt-0">
              <p className="text-3xl font-bold text-sky-600">{publicData.stats.inProgress}</p>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">
                Currently In Progress
              </p>
            </div>
            <div className="pt-2 md:pt-0">
              <p className="text-3xl font-bold text-emerald-600">{publicData.stats.resolved}</p>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mt-1">
                Issues Resolved
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works / 3 Simple Steps */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-900">How CivicFix Works</h2>
          <p className="text-sm text-slate-600 mt-1">
            Simple 3-step lifecycle for transparent civic maintenance
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
            <div className="w-9 h-9 rounded-md bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-sm mb-3">
              1
            </div>
            <h3 className="text-base font-semibold text-slate-900 mb-1">Report the Issue</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Capture or enter the location, choose category, write a brief description and optionally attach a photo.
              Our Community Duplicate Alert checks if a neighbour has already reported it.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
            <div className="w-9 h-9 rounded-md bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-sm mb-3">
              2
            </div>
            <h3 className="text-base font-semibold text-slate-900 mb-1">Administrative Review</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Municipal coordinators review the submitted details, verify genuineness and update the status from Pending to In Progress.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm">
            <div className="w-9 h-9 rounded-md bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-sm mb-3">
              3
            </div>
            <h3 className="text-base font-semibold text-slate-900 mb-1">Resolution & Transparency</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Citizens receive clear status updates. Once ground work is complete, the issue is marked as Resolved with timestamps.
            </p>
          </div>
        </div>
      </section>

      {/* Civic Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-900">Common Civic Categories</h2>
          <p className="text-sm text-slate-600 mt-1">
            Common civic issues you can report on CivicFix
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div
              key={cat.name}
              className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm hover:border-teal-400 transition-colors"
            >
              <h4 className="text-sm font-semibold text-slate-900">{cat.name}</h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">{cat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Recent Community Activity */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Recent Complaints</h2>
            <p className="text-sm text-slate-600">Recently filed public issues in the neighbourhood</p>
          </div>
          {isAuthenticated && isCitizen && (
            <Link
              to="/report"
              className="text-xs font-semibold text-teal-600 hover:text-teal-700 flex items-center gap-1"
            >
              <span>Submit new report</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>

        {publicData.complaints.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {publicData.complaints.map((c) => (
              <ComplaintCard
                key={c._id}
                complaint={c}
                showActions={false}
                currentRole="citizen"
              />
            ))}
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-lg p-8 text-center text-slate-500">
            <p className="text-sm">No complaints submitted yet. Be the first citizen to report an issue!</p>
          </div>
        )}
      </section>
    </div>
  );
}
