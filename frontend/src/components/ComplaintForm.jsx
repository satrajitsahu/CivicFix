import React, { useState, useEffect } from 'react';
import { complaintService, SERVER_BASE_URL } from '../services/api';
import {
  AlertTriangle,
  Upload,
  CheckCircle,
  Loader2,
  Info,
  MapPin,
  Image as ImageIcon,
} from 'lucide-react';

const CATEGORIES = [
  'Roads & Potholes',
  'Garbage Accumulation',
  'Broken Streetlights',
  'Water Leakage',
  'Drainage Problems',
  'Other Civic Issues',
];

export default function ComplaintForm({
  initialData = null,
  onSubmitSuccess,
  isEditing = false,
}) {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    category: initialData?.category || '',
    location: initialData?.location || '',
    description: initialData?.description || '',
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(
    initialData?.image ? `${SERVER_BASE_URL}${initialData.image}` : null
  );

  // Community Duplicate Alert State
  const [duplicateWarning, setDuplicateWarning] = useState(null);
  const [checkingDuplicate, setCheckingDuplicate] = useState(false);
  const [allowDuplicate, setAllowDuplicate] = useState(false);

  // Form handling state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [generalError, setGeneralError] = useState('');

  // Validate form client-side
  const validate = () => {
    const errors = {};
    if (!formData.title.trim()) {
      errors.title = 'Title is required (e.g. Broken streetlight on 4th Main Road)';
    } else if (formData.title.length < 5) {
      errors.title = 'Title should be at least 5 characters long';
    }

    if (!formData.category) {
      errors.category = 'Please select a civic category';
    }

    if (!formData.location.trim()) {
      errors.location = 'Location details are required (e.g. Near City Market, Ward 12)';
    } else if (formData.location.length < 4) {
      errors.location = 'Please provide a more descriptive location';
    }

    if (!formData.description.trim()) {
      errors.description = 'Please describe the issue in detail';
    } else if (formData.description.length < 15) {
      errors.description = 'Description should be at least 15 characters long';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Real-time / on-blur Community Duplicate Alert check
  const handleCheckDuplicate = async () => {
    if (isEditing) return; // Do not alert duplicate on edit
    if (!formData.category || !formData.location.trim() || formData.location.trim().length < 4) {
      return;
    }

    try {
      setCheckingDuplicate(true);
      const res = await complaintService.checkDuplicate(
        formData.category,
        formData.location.trim()
      );

      if (res.isDuplicate && res.existingComplaint) {
        setDuplicateWarning(res);
      } else {
        setDuplicateWarning(null);
        setAllowDuplicate(false);
      }
    } catch (err) {
      console.warn('Duplicate check skipped:', err.message);
    } finally {
      setCheckingDuplicate(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error for that field
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setFormErrors((prev) => ({
          ...prev,
          image: 'Image size exceeds 5MB. Please choose a smaller file.',
        }));
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setFormErrors((prev) => ({ ...prev, image: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');

    if (!validate()) {
      return;
    }

    // If duplicate detected and citizen hasn't confirmed submission
    if (duplicateWarning && !allowDuplicate) {
      setGeneralError(
        'Please acknowledge the duplicate complaint notice or check the box below to proceed.'
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const data = new FormData();
      data.append('title', formData.title.trim());
      data.append('category', formData.category);
      data.append('location', formData.location.trim());
      data.append('description', formData.description.trim());
      data.append('allowDuplicate', allowDuplicate);

      if (imageFile) {
        data.append('image', imageFile);
      }

      let res;
      if (isEditing) {
        res = await complaintService.updateComplaint(initialData._id, data);
      } else {
        res = await complaintService.createComplaint(data);
      }

      if (res.success) {
        if (onSubmitSuccess) {
          onSubmitSuccess(res.complaint);
        }
      }
    } catch (err) {
      console.error('Submission failed:', err);
      // Catch duplicate 409 error if returned by backend
      if (err.status === 409 && err.data?.isDuplicateWarning) {
        setDuplicateWarning(err.data);
        setGeneralError(err.data.message);
      } else {
        setGeneralError(err.message || 'Failed to submit complaint. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {generalError && (
        <div className="p-3 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-start gap-2">
          <AlertTriangle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
          <span>{generalError}</span>
        </div>
      )}

      {/* Title */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1">
          Complaint Title <span className="text-rose-500">*</span>
        </label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          placeholder="e.g. Deep pothole causing traffic slowdown near Metro Pillar 140"
          className={`w-full px-3.5 py-2 border rounded-md text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors ${
            formErrors.title ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
          }`}
        />
        {formErrors.title && (
          <p className="mt-1 text-xs text-rose-600">{formErrors.title}</p>
        )}
      </div>

      {/* Category Dropdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">
            Category <span className="text-rose-500">*</span>
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={(e) => {
              handleInputChange(e);
              // Trigger duplicate check when category changes
              setTimeout(handleCheckDuplicate, 100);
            }}
            className={`w-full px-3.5 py-2 border rounded-md text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors ${
              formErrors.category ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
            }`}
          >
            <option value="">-- Select a Category --</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          {formErrors.category && (
            <p className="mt-1 text-xs text-rose-600">{formErrors.category}</p>
          )}
        </div>

        {/* Location with onBlur duplicate check */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-semibold text-slate-700">
              Location / Landmark <span className="text-rose-500">*</span>
            </label>
            {checkingDuplicate && (
              <span className="text-[11px] text-teal-600 flex items-center gap-1">
                <Loader2 className="w-3 h-3 animate-spin" /> Checking duplicates...
              </span>
            )}
          </div>
          <div className="relative">
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              onBlur={handleCheckDuplicate}
              placeholder="e.g. 10th Cross, 2nd Main, Indiranagar"
              className={`w-full pl-9 pr-3.5 py-2 border rounded-md text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors ${
                formErrors.location ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
              }`}
            />
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>
          {formErrors.location && (
            <p className="mt-1 text-xs text-rose-600">{formErrors.location}</p>
          )}
        </div>
      </div>

      {/* Creative Feature: Community Duplicate Alert Banner */}
      {duplicateWarning && (
        <div className="p-4 rounded-lg bg-amber-50 border border-amber-300 text-amber-900 space-y-3">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-amber-900">
                Community Duplicate Alert
              </h4>
              <p className="text-xs text-amber-800 mt-0.5">
                {duplicateWarning.message}
              </p>
              {duplicateWarning.existingComplaint && (
                <div className="mt-2 p-2.5 bg-white/80 rounded border border-amber-200 text-xs text-slate-700 space-y-1">
                  <p>
                    <span className="font-semibold text-slate-900">Existing:</span>{' '}
                    {duplicateWarning.existingComplaint.title}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-900">Area:</span>{' '}
                    {duplicateWarning.existingComplaint.location} |{' '}
                    <span className="font-semibold text-slate-900">Status:</span>{' '}
                    <span className="font-medium text-amber-700">
                      {duplicateWarning.existingComplaint.status}
                    </span>
                  </p>
                </div>
              )}
            </div>
          </div>

          <label className="flex items-start gap-2 pt-2 border-t border-amber-200 text-xs text-amber-950 cursor-pointer">
            <input
              type="checkbox"
              checked={allowDuplicate}
              onChange={(e) => setAllowDuplicate(e.target.checked)}
              className="mt-0.5 rounded text-teal-600 focus:ring-teal-500 border-amber-400"
            />
            <span>
              This is a separate issue or needs independent attention. I want to submit this complaint anyway.
            </span>
          </label>
        </div>
      )}

      {/* Description */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1">
          Detailed Description <span className="text-rose-500">*</span>
        </label>
        <textarea
          name="description"
          rows={4}
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Please describe the civic problem in detail. Mention how long it has been there and how it impacts public movement or safety."
          className={`w-full px-3.5 py-2 border rounded-md text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-colors ${
            formErrors.description ? 'border-rose-400 bg-rose-50/20' : 'border-slate-300'
          }`}
        />
        {formErrors.description && (
          <p className="mt-1 text-xs text-rose-600">{formErrors.description}</p>
        )}
      </div>

      {/* Optional Photograph Upload */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-1">
          Complaint Photograph <span className="text-slate-400 font-normal">(Optional)</span>
        </label>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors shadow-sm">
            <Upload className="w-4 h-4 text-teal-600" />
            <span>{imageFile ? 'Change Photo' : 'Upload Photo'}</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </label>
          <span className="text-xs text-slate-500">
            JPG, PNG, WEBP up to 5MB. Clear photos help municipal workers identify issues faster.
          </span>
        </div>
        {formErrors.image && (
          <p className="mt-1 text-xs text-rose-600">{formErrors.image}</p>
        )}

        {/* Image Preview */}
        {imagePreview && (
          <div className="mt-3 relative w-40 h-28 rounded-md overflow-hidden border border-slate-200 bg-slate-100">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={() => {
                setImageFile(null);
                setImagePreview(null);
              }}
              className="absolute top-1 right-1 bg-black/60 text-white p-1 rounded-full text-xs hover:bg-black/80"
              title="Remove photo"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="pt-2 flex items-center gap-3">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-medium text-sm rounded-md shadow-sm transition-colors disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>{isEditing ? 'Updating...' : 'Submitting...'}</span>
            </>
          ) : (
            <span>{isEditing ? 'Save Changes' : 'Submit Complaint'}</span>
          )}
        </button>
      </div>
    </form>
  );
}
