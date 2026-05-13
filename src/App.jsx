import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

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
  const [authState, setAuthState] = useState({
    isLoggedIn: !!localStorage.getItem('token'),
    userRole: localStorage.getItem('role') || 'TOURIST',
    userName: localStorage.getItem('name') || 'User',
    unreadNotifications: 0
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const name = localStorage.getItem('name');
    if (token) {
      setAuthState(prev => ({ ...prev, isLoggedIn: true, userRole: role, userName: name }));
    }
  }, []);

  return (
    <Router>
      <div className="relative min-h-screen bg-[#FFFDF7]">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home isLoggedIn={authState.isLoggedIn} userRole={authState.userRole} />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/reports" element={<PrivateRoute><ReportPage isLoggedIn={authState.isLoggedIn} userRole={authState.userRole} /></PrivateRoute>} />
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
    </Router>
  );
}

export default App;