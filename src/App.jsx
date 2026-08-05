import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import MainLayout from './components/layout/MainLayout';

import Auth from './pages/Auth';
import AdminPanel from './pages/AdminPanel';
import ValuationTool from './pages/ValuationTool';
import UserDashboard from './pages/UserDashboard';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/ProtectedRoute';
import ProPlan from './pages/ProPlan';
import LandingPage from './pages/LandingPage';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/auth" element={<Auth />} />
          <Route path="/" element={<LandingPage />} />

          {/* Valuation is public — auth only triggered on PDF download */}
          <Route element={<MainLayout />}>
            <Route path="/valuation" element={<ValuationTool />} />
            <Route path="/pro-plan" element={<ProPlan />} />
          </Route>

          {/* Protected Routes */}
          <Route
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/dashboard" element={<UserDashboard />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;