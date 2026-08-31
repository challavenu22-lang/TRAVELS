/**
 * Authentication service managing session tokens and login state.
 */

export const isAuthenticated = () => {
  return localStorage.getItem('isAuthenticated') === 'true' || Boolean(localStorage.getItem('token'));
};

export const loginUser = (token = 'session-active-token') => {
  localStorage.setItem('isAuthenticated', 'true');
  localStorage.setItem('token', token);
  window.dispatchEvent(new Event('authChanged'));
};

export const logoutUser = () => {
  // Clear all potential authentication keys from localStorage
  localStorage.removeItem('isAuthenticated');
  localStorage.removeItem('token');
  localStorage.removeItem('authToken');
  localStorage.removeItem('user');
  localStorage.removeItem('auth');
  localStorage.removeItem('session');
  localStorage.removeItem('isLoggedIn');
  
  // Clear sessionStorage
  sessionStorage.clear();
  
  // Clear auth cookies if present
  if (typeof document !== 'undefined') {
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
  }

  // Dispatch auth event to notify app listeners
  window.dispatchEvent(new Event('authChanged'));
};
