import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';
import ToastContainer from './components/ToastContainer';
import ErrorBoundary from './components/ErrorBoundary';
import { ToastProvider } from './context/ToastContext';
import { CaptureProvider } from './context/CaptureContext';

// Pages
import Dashboard from './pages/Dashboard';
import LiveCapture from './pages/LiveCapture';
import PacketHistory from './pages/PacketHistory';
import Stats from './pages/Stats';

function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('pa_theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('pa_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <div className="app-layout-shell">
      {/* Fixed Navigation Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Viewport */}
      <div className="app-main-viewport">
        {/* Topbar with Capture Controls & Theme Switcher */}
        <Topbar
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          theme={theme}
          onToggleTheme={toggleTheme}
        />

        {/* Page Routing */}
        <main style={{ flex: 1 }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/live" element={<LiveCapture />} />
            <Route path="/history" element={<PacketHistory />} />
            <Route path="/stats" element={<Stats />} />
            {/* Fallback redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>

      {/* Application-wide Toast Alerts Container */}
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <CaptureProvider>
          <Router>
            <MainLayout />
          </Router>
        </CaptureProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}
