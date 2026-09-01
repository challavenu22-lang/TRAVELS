/**
 * Authentication service managing session tokens and user state.
 */

export const getAuthToken = () => {
  return localStorage.getItem('token') || sessionStorage.getItem('token');
};

export const getUser = () => {
  const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
  if (!userStr) return null;
  try {
    return JSON.parse(userStr);
  } catch (e) {
    return null;
  }
};

export const isAuthenticated = () => {
  const token = getAuthToken();
  if (!token) return false;
  
  try {
    const parts = token.split('.');
    if (parts.length === 3) {
      const payload = JSON.parse(atob(parts[1]));
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        logoutUser();
        return false;
      }
    }
  } catch (e) {
    // Keep true if token exists
  }
  return true;
};

export const loginUser = (token, user = {}, remember = true) => {
  const storage = remember ? localStorage : sessionStorage;
  
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('isAuthenticated');
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('user');
  sessionStorage.removeItem('isAuthenticated');

  if (token) {
    storage.setItem('token', token);
  }
  if (user) {
    storage.setItem('user', JSON.stringify(user));
  }
  storage.setItem('isAuthenticated', 'true');
  
  window.dispatchEvent(new Event('authChanged'));
};

export const logoutUser = async () => {
  const token = getAuthToken();
  if (token) {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (e) {
      // Ignore network failure on logout
    }
  }

  localStorage.removeItem('isAuthenticated');
  localStorage.removeItem('token');
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
  localStorage.removeItem('auth');
  localStorage.removeItem('session');
  localStorage.removeItem('isLoggedIn');
  
  sessionStorage.clear();

  if (typeof document !== 'undefined') {
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
  }

  window.dispatchEvent(new Event('authChanged'));
};

export const fetchCurrentUser = async () => {
  const token = getAuthToken();
  if (!token) return null;

  try {
    const res = await fetch('/api/auth/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      const user = await res.json();
      const remember = Boolean(localStorage.getItem('token'));
      const storage = remember ? localStorage : sessionStorage;
      storage.setItem('user', JSON.stringify(user));
      window.dispatchEvent(new Event('authChanged'));
      return user;
    } else {
      logoutUser();
      return null;
    }
  } catch (e) {
    return getUser();
  }
};
