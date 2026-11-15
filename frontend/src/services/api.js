// Base API service using the Native Fetch API (CA-3 Requirement 4)
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
export const SERVER_BASE_URL = API_BASE_URL.replace(/\/api\/?$/, '');

/**
 * Universal fetch wrapper for REST API communication
 * Handles JWT authentication, JSON and FormData, and centralized error parsing.
 */
export async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('civicfix_token');

  const headers = {
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Do not set Content-Type for FormData (browser will set multipart/form-data with boundary)
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const config = {
    ...options,
    headers,
  };

  try {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, config);

    const contentType = response.headers.get('content-type');
    let data = null;

    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      data = { message: text };
    }

    if (!response.ok) {
      const errorMessage = data?.message || `Request failed with status ${response.status}`;
      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    // Distinguish between network connection errors and HTTP error responses
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      console.error('[CivicFix API] Network Error:', error);
      const networkError = new Error(
        'Unable to connect to the CivicFix backend server. Please make sure the server is running on port 5000.'
      );
      networkError.isNetworkError = true;
      throw networkError;
    }
    throw error;
  }
}

// ================= Auth Endpoints =================
export const authService = {
  register: (userData) =>
    apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  login: (credentials) =>
    apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  getMe: () =>
    apiRequest('/auth/me', {
      method: 'GET',
    }),
};

// ================= Complaint Endpoints =================
export const complaintService = {
  // Public showcase
  getPublicComplaints: () =>
    apiRequest('/complaints/public', {
      method: 'GET',
    }),

  // Citizen: check potential duplicates before submission
  checkDuplicate: (category, location) => {
    const params = new URLSearchParams({ category, location }).toString();
    return apiRequest(`/complaints/check-duplicate?${params}`, {
      method: 'GET',
    });
  },

  // Citizen: create complaint (FormData for optional image)
  createComplaint: (formData) =>
    apiRequest('/complaints', {
      method: 'POST',
      body: formData,
    }),

  // Citizen: get personal complaints with optional filters
  getMyComplaints: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.category && filters.category !== 'All') params.append('category', filters.category);
    if (filters.status && filters.status !== 'All') params.append('status', filters.status);
    if (filters.search) params.append('search', filters.search);

    const queryString = params.toString() ? `?${params.toString()}` : '';
    return apiRequest(`/complaints${queryString}`, {
      method: 'GET',
    });
  },

  // Get single complaint by ID
  getComplaintById: (id) =>
    apiRequest(`/complaints/${id}`, {
      method: 'GET',
    }),

  // Citizen: update complaint (when Pending)
  updateComplaint: (id, formData) =>
    apiRequest(`/complaints/${id}`, {
      method: 'PUT',
      body: formData,
    }),

  // Citizen / Admin: delete complaint
  deleteComplaint: (id) =>
    apiRequest(`/complaints/${id}`, {
      method: 'DELETE',
    }),
};

// ================= Admin Endpoints =================
export const adminService = {
  getAllComplaints: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.category && filters.category !== 'All') params.append('category', filters.category);
    if (filters.status && filters.status !== 'All') params.append('status', filters.status);
    if (filters.search) params.append('search', filters.search);
    if (filters.sortBy) params.append('sortBy', filters.sortBy);

    const queryString = params.toString() ? `?${params.toString()}` : '';
    return apiRequest(`/admin/complaints${queryString}`, {
      method: 'GET',
    });
  },

  updateStatus: (id, status) =>
    apiRequest(`/admin/complaints/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),

  getStatistics: () =>
    apiRequest('/admin/statistics', {
      method: 'GET',
    }),
};
