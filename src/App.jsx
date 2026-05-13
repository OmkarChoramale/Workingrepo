import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import { NotificationProvider } from './context/NotificationContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ReportPage from './pages/ReportPage';
import NotificationsPage from './pages/NotificationsPage';
import TouristHeritageSites from './pages/TouristHeritageSites';
import HeritageSiteDetails from './pages/HeritageSiteDetails';
import EventsPage from './pages/EventsPage';
import ProgramsPage from './pages/ProgramsPage';
import CompliancePage from './pages/CompliancePage';

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
}

function App() {
  const isLoggedIn = !!localStorage.getItem('token');
  const userRole = localStorage.getItem('role') || 'TOURIST';

  return (
    <Router>
      <NotificationProvider>
        <div className="relative min-h-screen bg-[#FFFDF7]">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home isLoggedIn={isLoggedIn} userRole={userRole} />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes */}
            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/reports" element={<PrivateRoute><ReportPage isLoggedIn={isLoggedIn} userRole={userRole} /></PrivateRoute>} />
            <Route path="/notifications" element={<PrivateRoute><NotificationsPage /></PrivateRoute>} />
            <Route path="/sites" element={<PrivateRoute><TouristHeritageSites /></PrivateRoute>} />
            <Route path="/tourist/sites/:siteId" element={<PrivateRoute><HeritageSiteDetails /></PrivateRoute>} />
            <Route path="/events" element={<PrivateRoute><EventsPage /></PrivateRoute>} />
            <Route path="/programs" element={<PrivateRoute><ProgramsPage /></PrivateRoute>} />
            <Route path="/compliance" element={<PrivateRoute><CompliancePage /></PrivateRoute>} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </NotificationProvider>
    </Router>
  );
}

export default App;