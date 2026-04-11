import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// Navigation Components
import Sidebar from './components/Navigation/Sidebar';
import Topbar from './components/Navigation/Topbar';

// Core Municipal Views
import Dashboard from './pages/Dashboard';
import PollutionInsights from './pages/PollutionInsights';
import TrafficAnalysis from './pages/TrafficAnalysis';
import Predictions from './pages/Predictions';
import SmartSignals from './pages/SmartSignals';
import Reports from './pages/Reports';
import About from './components/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Home from './pages/Home';
import SettingsPage from './pages/Settings';
import AdminPanel from './components/AdminPanel';
import Inbox from './pages/Inbox';
import HelpCenter from './pages/HelpCenter';
import CityPulse from './pages/CityPulse';
import SafetyHub from './pages/SafetyHub';
import {
  getCurrentRole,
  getCurrentUserName,
  getDefaultRouteForRole,
  getToken,
  hasRoleAccess,
} from './services/session';

// Protected Route Wrapper
const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = getToken();
  const role = getCurrentRole();
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  if (!hasRoleAccess(role, allowedRoles)) {
    return <Navigate to={getDefaultRouteForRole(role)} replace />;
  }
  
  return <>{children}</>;
};

function App() {
  const location = useLocation();
  const user = {
    name: getCurrentUserName(),
    role: getCurrentRole(),
  };

  // Determine if we should show navigation (Sidebar/Topbar)
  const isAuthPage = location.pathname === '/login' || location.pathname === '/';

  return (
    <div className="min-h-screen bg-surface-container-lowest text-on-surface font-body flex overflow-hidden w-full">
      {!isAuthPage && (
        <ProtectedRoute>
          <div className="w-64 flex-shrink-0">
            <Sidebar />
          </div>
        </ProtectedRoute>
      )}

      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-slate-900 transition-all">
        {!isAuthPage && (
          <ProtectedRoute>
            <Topbar user={user} />
          </ProtectedRoute>
        )}

        <main className="flex-1 overflow-y-auto overflow-x-hidden relative">
          <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />

              {/* Protected Municipal Nodes */}
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/pulse" element={<ProtectedRoute allowedRoles={['User']}><CityPulse /></ProtectedRoute>} />
              <Route path="/traffic" element={<ProtectedRoute allowedRoles={['Admin', 'Analyst', 'User']}><TrafficAnalysis /></ProtectedRoute>} />
              <Route path="/pollution" element={<ProtectedRoute allowedRoles={['Admin', 'Analyst', 'User']}><PollutionInsights /></ProtectedRoute>} />
              <Route path="/predict" element={<ProtectedRoute><Predictions /></ProtectedRoute>} />
              <Route path="/safety" element={<ProtectedRoute allowedRoles={['User']}><SafetyHub /></ProtectedRoute>} />
              <Route path="/inbox" element={<ProtectedRoute><Inbox /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute allowedRoles={['Admin']}><AdminPanel /></ProtectedRoute>} />
              <Route path="/signals" element={<ProtectedRoute allowedRoles={['Admin', 'Analyst', 'User']}><SmartSignals /></ProtectedRoute>} />
              <Route path="/reports" element={<ProtectedRoute allowedRoles={['Admin', 'Analyst', 'User']}><Reports /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
              <Route path="/about" element={<ProtectedRoute><About /></ProtectedRoute>} />
              <Route path="/help" element={<ProtectedRoute><HelpCenter /></ProtectedRoute>} />
              <Route path="/contact" element={<ProtectedRoute><Contact /></ProtectedRoute>} />

              {/* Catch-all and Fallback */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

export default App;
