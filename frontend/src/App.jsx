import React, { Suspense, lazy, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Loader from './components/Loader/Loader';
import { isAuthenticated } from './services/authService';

// Lazy loading pages for better performance
const Dashboard = lazy(() => import('./pages/Dashboard/Dashboard'));
const GenerateSummary = lazy(() => import('./pages/GenerateSummary/GenerateSummary'));
const History = lazy(() => import('./pages/History/History'));
const Analytics = lazy(() => import('./pages/Analytics/Analytics'));
const Templates = lazy(() => import('./pages/Templates/Templates'));
const Settings = lazy(() => import('./pages/Settings/Settings'));
const Drivers = lazy(() => import('./pages/Drivers/Drivers'));
const Vehicles = lazy(() => import('./pages/Vehicles/Vehicles'));
const Login = lazy(() => import('./pages/Login/Login'));

// Protected Route wrapper component ensuring authentication
const ProtectedRoute = ({ children }) => {
  const [authed, setAuthed] = useState(() => isAuthenticated());

  useEffect(() => {
    const handleAuthChange = () => setAuthed(isAuthenticated());
    window.addEventListener('authChanged', handleAuthChange);
    return () => window.removeEventListener('authChanged', handleAuthChange);
  }, []);

  if (!authed) {
    return <Navigate to="/login" replace />;
  }

  return <Layout>{children}</Layout>;
};

function App() {
  const [authed, setAuthed] = useState(() => isAuthenticated());

  useEffect(() => {
    const handleAuthChange = () => setAuthed(isAuthenticated());
    window.addEventListener('authChanged', handleAuthChange);
    return () => window.removeEventListener('authChanged', handleAuthChange);
  }, []);

  return (
    <Router>
      <Suspense fallback={<Loader />}>
        <Routes>
          {/* Login Route: Always stays on login page when loaded */}
          <Route path="/login" element={<Login />} />
          
          {/* Root Route: Redirects based on auth status */}
          <Route 
            path="/" 
            element={authed ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} 
          />

          {/* Protected Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/generate" element={<ProtectedRoute><GenerateSummary /></ProtectedRoute>} />
          <Route path="/generate-summary" element={<ProtectedRoute><GenerateSummary /></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
          <Route path="/templates" element={<ProtectedRoute><Templates /></ProtectedRoute>} />
          <Route path="/drivers" element={<ProtectedRoute><Drivers /></ProtectedRoute>} />
          <Route path="/vehicles" element={<ProtectedRoute><Vehicles /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

          {/* Catch-all fallback */}
          <Route 
            path="*" 
            element={authed ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} 
          />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
