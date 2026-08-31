import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Loader from './components/Loader/Loader';

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

function App() {
  return (
    <Router>
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route 
            path="/*" 
            element={
              <Layout>
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/generate" element={<GenerateSummary />} />
                  <Route path="/history" element={<History />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/templates" element={<Templates />} />
                  <Route path="/drivers" element={<Drivers />} />
                  <Route path="/vehicles" element={<Vehicles />} />
                  <Route path="/settings" element={<Settings />} />
                </Routes>
              </Layout>
            } 
          />
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
