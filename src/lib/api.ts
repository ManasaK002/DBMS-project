
// API configuration and utilities
// Update this URL to match your backend deployment
const API_BASE_URL = 'http://127.0.0.1:8000/api';

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
  signup: (data: { email: string; password: string; name: string; phone?: string }) => {
    const [firstName, ...lastNameParts] = data.name.split(' ');
    return apiRequest('/auth', {
      method: 'POST',
       body: JSON.stringify({
        action: 'register',
        first_name: firstName,
        last_name: lastNameParts.join(' ') || '',
        email: data.email,
        password: data.password,
        phone_number: data.phone,
      }),
    });
  },

  login: (data: { email: string; password: string }) =>
      apiRequest('/auth', {
      method: 'POST',
       body: JSON.stringify({
        action: 'login',
        email: data.email,
        password: data.password,
      }),
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
    const query = new URLSearchParams({ movie_id: movieId, ...params } as any).toString();
    return apiRequest(`/shows?${query}`);
  },
  getById: (id: string) => apiRequest(`/shows?show_id=${id}`),

};


// Bookings API
export const bookingsAPI = {
  create: (data: { user_id: number; showId: number; seatIds: number[]; total_amount: number }) =>
  apiRequest('/bookings', {
    method: 'POST',
    body: JSON.stringify({
      ...data,
      user_id: Number(localStorage.getItem('user_id')), 
    }),
  }),


  confirm: (bookingId: string, paymentId: string) =>
    apiRequest(`/bookings/${bookingId}/confirm`, {
      method: 'POST',
      body: JSON.stringify({ paymentId }),
    }),

  getUserBookings: async () => {
    const user = authHelpers.getUser(); // assumes your auth stores user info
    const userId = user?.id || 1; // fallback for testing
    return apiRequest(`/bookings?user_id=${userId}`);
  },

  cancel: (bookingId: string) =>
    apiRequest(`/bookings/${bookingId}`, {
      method: 'DELETE',
    }),
};

// Auth helpers
export const authHelpers = {
  getToken: () => getAuthToken(),
  setToken: (token: string) => localStorage.setItem('auth_token', token),
  removeToken: () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
  },
  isAuthenticated: () => !!getAuthToken(),
  setUser: (user: { user_id: number; first_name: string; last_name: string; email: string }) => {
    localStorage.setItem('user_data', JSON.stringify(user));
    localStorage.setItem('auth_token', 'logged_in');
  },
  getUser: () => {
    const data = localStorage.getItem('user_data');
    return data ? JSON.parse(data) : null;
  },
};
