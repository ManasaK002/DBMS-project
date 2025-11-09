// API configuration and utilities
// Update this URL to match your backend deployment
const API_BASE_URL = "http://127.0.0.1:8000/api"

// Get auth token from localStorage
const getAuthToken = () => localStorage.getItem('auth_token');

// API request wrapper
async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const token = getAuthToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || error.message || 'Request failed');
  }

  return response.json();
}

// Auth API
export const authAPI = {
  signup: (data: { email: string; password: string; name: string; phone?: string }) =>
    apiRequest('/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  login: (data: { email: string; password: string }) =>
    apiRequest('/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// Movies API
export const moviesAPI = {
  getAll: (params?: { language?: string; genre?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return apiRequest(`/movies${query ? `?${query}` : ''}`);
  },

  getById: (id: string) => apiRequest(`/movies/${id}`),

  create: (data: {
    title: string;
    description: string;
    duration: number;
    language: string;
    genre: string;
    release_date: string;
    rating: string;
    poster_url: string;
    trailer_url?: string;
  }) =>
    apiRequest('/movies', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    apiRequest(`/movies/${id}`, {
      method: 'DELETE',
    }),
};

// Shows API
export const showsAPI = {
  getByMovie: (movieId: string, params?: { date?: string; cityId?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return apiRequest(`/movies/${movieId}/shows${query ? `?${query}` : ''}`);
  },

  getById: (id: string) => apiRequest(`/shows/${id}`),
};

// Bookings API
export const bookingsAPI = {
  create: (data: { showId: number; seatIds: number[] }) =>
    apiRequest('/bookings', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  confirm: (bookingId: string, paymentId: string) =>
    apiRequest(`/bookings/${bookingId}/confirm`, {
      method: 'POST',
      body: JSON.stringify({ paymentId }),
    }),

  getUserBookings: () => apiRequest('/bookings'),

  cancel: (bookingId: string) =>
    apiRequest(`/bookings/${bookingId}`, {
      method: 'DELETE',
    }),
};

// Auth helpers
export const authHelpers = {
  setToken: (token: string) => localStorage.setItem('auth_token', token),
  removeToken: () => localStorage.removeItem('auth_token'),
  isAuthenticated: () => !!getAuthToken(),
};
