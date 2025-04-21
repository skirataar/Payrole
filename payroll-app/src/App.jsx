import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Import pages
import Dashboard from './pages/Dashboard';
import UploadExcel from './pages/UploadExcel';
import SalaryReport from './pages/SalaryReport';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';
import AdminSubscriptions from './pages/AdminSubscriptions';
import AdminAnalytics from './pages/AdminAnalytics';
import AdminSettings from './pages/AdminSettings';

// Import layouts
import Layout from './components/Layout';
import AdminLayout from './components/AdminLayout';

// Import context providers
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { CompanyProvider } from './context/CompanyContext';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CompanyProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Login />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Company Routes */}
              <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
              <Route path="/upload" element={<Layout><UploadExcel /></Layout>} />
              <Route path="/salary-report" element={<Layout><SalaryReport /></Layout>} />
              <Route path="/settings" element={<Layout><Settings /></Layout>} />

              {/* Admin Routes */}
              <Route path="/admin" element={<AdminLayout><AdminDashboard /></AdminLayout>} />
              <Route path="/admin/subscriptions" element={<AdminLayout><AdminSubscriptions /></AdminLayout>} />
              <Route path="/admin/analytics" element={<AdminLayout><AdminAnalytics /></AdminLayout>} />
              <Route path="/admin/settings" element={<AdminLayout><AdminSettings /></AdminLayout>} />

              {/* Fallback Route */}
              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          </BrowserRouter>
        </CompanyProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
