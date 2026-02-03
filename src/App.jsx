import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import MainLayout from './components/layout/MainLayout';

import AdminPanel from './pages/AdminPanel';
import ValuationTool from './pages/ValuationTool';
import ArtistValuationDetail from './pages/ArtistValuationDetail'; // ADDED: New import
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/valuation" replace />} />

          <Route
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
        
            <Route path="/admin" element={<AdminPanel />} />
            <Route path="/valuation" element={<ValuationTool />} />
            {/* ADDED: New route for valuation detail page */}
            <Route path="/valuation/detail" element={<ArtistValuationDetail />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;