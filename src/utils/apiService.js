import API_URL from './api';

// Refresh access token using the stored refresh token
export const refreshAccessToken = async () => {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) return null;

  try {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ refreshToken })
    });

    if (!response.ok) {
      // Invalidate tokens if refresh token is expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      return null;
    }

    const data = await response.json();
    localStorage.setItem('token', data.accessToken);
    if (data.refreshToken) {
      localStorage.setItem('refreshToken', data.refreshToken);
    }
    return data.accessToken;
  } catch (err) {
    console.error("Refresh token error:", err);
    return null;
  }
};

// Fetch wrapper with automatic retry on 401 (token expiration)
export const authenticatedFetch = async (url, options = {}) => {
  let token = localStorage.getItem('token');
  
  if (!options.headers) {
    options.headers = {};
  }
  
  options.credentials = 'include';
  
  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }

  let response = await fetch(url, options);

  // If unauthorized, token might have expired. Try to refresh.
  if (response.status === 401) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      options.headers['Authorization'] = `Bearer ${newToken}`;
      response = await fetch(url, options);
    } else {
      // If we couldn't refresh, redirect to login page if we are not already on it
      if (!window.location.pathname.includes('/login') && !window.location.pathname.includes('/register') && window.location.pathname !== '/') {
        window.location.href = '/login';
      }
    }
  }

  return response;
};
