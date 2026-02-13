import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import MainLayout from './components/layout/MainLayout';

import Auth from './pages/Auth';
import AdminPanel from './pages/AdminPanel';
import ValuationTool from './pages/ValuationTool';
import ArtistValuationDetail from './pages/ArtistValuationDetail';
import UserDashboard from './pages/UserDashboard';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/auth" element={<Auth />} />
          
          {/* Redirect root to valuation */}
          <Route path="/" element={<Navigate to="/valuation" replace />} />

          {/* Protected Routes */}
          <Route
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/valuation" element={<ValuationTool />} />
            <Route path="/valuation/detail" element={<ArtistValuationDetail />} />
            <Route path="/dashboard" element={<UserDashboard />} />
          </Route>

          {/* 404 Page */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;