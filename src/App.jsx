import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// --- COMPONENTS ---
import Navbar from './components/Navbar';

// --- PAGES ---
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard'; 
import ReportPage from './pages/ReportPage';
import NotificationsPage from './pages/NotificationsPage'; // NEW: Module 8
import TouristHeritageSites from './pages/TouristHeritageSites'; // ADDED
import HeritageSiteDetails from './pages/HeritageSiteDetails';   // ADDED

function App() {
  // --- SYNC STATE WITH LOCALSTORAGE ---
  // This ensures the login "sticks" even after a page refresh
  const [authState, setAuthState] = useState({
    isLoggedIn: !!localStorage.getItem('token'), 
    userRole: localStorage.getItem('role') || "TOURIST", 
    userName: localStorage.getItem('name') || "User",
    unreadNotifications: 3
  });

  // Listen for changes (Useful for your Login.jsx reload logic)
  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    const name = localStorage.getItem('name');
    
    if (token) {
      setAuthState(prev => ({
        ...prev,
        isLoggedIn: true,
        userRole: role,
        userName: name
      }));
    }
  }, []);

  return (
    <Router>
      <div className="relative min-h-screen bg-[#FFFDF7]">
        
        {/* NAVBAR: Pass real state to show/hide Dashboard, Reports, and Bell */}
        <Navbar 
          isLoggedIn={authState.isLoggedIn} 
          userRole={authState.userRole} 
          unreadNotifications={authState.unreadNotifications} 
        />

        <Routes>
          {/* Public Routes */}
          <Route path="/" element={
            <Home isLoggedIn={authState.isLoggedIn} userRole={authState.userRole} />
          } />
          
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* DASHBOARD ROUTE: Uses role from localStorage to call DashboardServiceImpl */}
          <Route path="/dashboard" element={
            authState.isLoggedIn ? (
              <Dashboard 
                role={authState.userRole} 
                userName={authState.userName} 
              />
            ) : (
              <Navigate to="/login" />
            )
          } />

          {/* REPORTS ROUTE (Module 7): Validates role before loading ReportPage */}
          <Route path="/reports" element={
            authState.isLoggedIn ? (
              <ReportPage 
                isLoggedIn={authState.isLoggedIn} 
                userRole={authState.userRole} 
              />
            ) : (
              <Navigate to="/login" />
            )
          } />

          {/* NOTIFICATIONS ROUTE (Module 8): Maps to NotificationServiceImpl */}
          <Route path="/notifications" element={
            authState.isLoggedIn ? (
              <NotificationsPage />
            ) : (
              <Navigate to="/login" />
            )
          } />

          {/* HERITAGE SITES ROUTE */}
          <Route path="/sites" element={
            authState.isLoggedIn ? (
              <TouristHeritageSites />
            ) : (
              <Navigate to="/login" />
            )
          } />

          {/* HERITAGE DETAILS & PRESERVATION ROUTE */}
          <Route path="/tourist/sites/:siteId" element={
            authState.isLoggedIn ? (
              <HeritageSiteDetails />
            ) : (
              <Navigate to="/login" />
            )
          } />

          {/* Fallback Catch-all */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;