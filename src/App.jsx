import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LoadingProvider } from './components/LoadingProvider';
import useAuthStore from './store/authStore';

// Components
import Home from './pages/Home';
import StationLogin from './pages/StationLogin';
import EmployeeLogin from './pages/EmployeeLogin';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Messages from './pages/Messages';
import Journals from './pages/Journals';
import DispatcherPanel from './pages/DispatcherPanel';
import Archive from './pages/Archive';
import DashboardLayout from './components/DashboardLayout';
import { Toaster } from 'react-hot-toast';

const App = () => {
  const { station, employee, theme } = useAuthStore();

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Apply distance theme
    const distanceThemes = ['theme-chilonzor', 'theme-ozbekiston', 'theme-yunusobod', 'theme-halqa'];
    distanceThemes.forEach(t => document.documentElement.classList.remove(t));
    if (station?.distance) {
      document.documentElement.classList.add(`theme-${station.distance}`);
    }
  }, [theme, station]);

  // Protected route wrapper
  const ProtectedRoute = ({ children }) => {
    if (!employee) return <Navigate to="/employee-login" />;
    return children;
  };

  return (
    <LoadingProvider>
      <Toaster position="top-center" reverseOrder={false} />
      <Router>
        <div className={`min-h-screen bg-[var(--metro-background)] text-[var(--metro-foreground)] transition-colors duration-500 overflow-hidden ${station?.distance ? `distance-glow-${station.distance}` : ''}`}>
        <AnimatePresence mode="wait">
          <Routes>
            {/* Landing Page */}
            <Route path="/" element={<Home />} />

            {/* Step 1: Station Login */}
            <Route 
              path="/station-login" 
              element={!station ? <StationLogin /> : <Navigate to="/employee-login" />} 
            />

            {/* Step 2: Employee Login */}
            <Route 
              path="/employee-login" 
              element={station && !employee ? <EmployeeLogin /> : (employee ? <Navigate to="/dashboard" /> : <Navigate to="/station-login" />)} 
            />

            {/* Main Application */}
            <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/dashboard/profile" element={<Profile />} />
              <Route path="/dashboard/messages" element={<Messages />} />
              <Route path="/dashboard/journals/*" element={<Journals />} />
              <Route path="/dashboard/archive" element={<Archive />} />
              <Route path="/dashboard/dispatcher" element={<DispatcherPanel />} />
            </Route>

            {/* 404 Route */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </AnimatePresence>
        </div>
      </Router>
    </LoadingProvider>
  );
};

export default App;
