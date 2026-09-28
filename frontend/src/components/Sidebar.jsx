import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Radio,
  History,
  BarChart3,
  Shield,
  Layers,
  Activity,
  X,
} from 'lucide-react';
import { useCapture } from '../context/CaptureContext';

export default function Sidebar({ isOpen, onClose }) {
  const { isCapturing, socketConnected } = useCapture();

  const navLinks = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/live', label: 'Live Capture', icon: Radio, badge: isCapturing ? 'LIVE' : null },
    { to: '/history', label: 'Packet History', icon: History },
    { to: '/stats', label: 'Analytics & Stats', icon: BarChart3 },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && <div className="sidebar-backdrop" onClick={onClose} />}

      <aside className={`app-sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        {/* Brand Header */}
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">
            <Radio size={22} color="#fff" />
          </div>
          <div className="sidebar-brand-text">
            <h2>Packet Analyser</h2>
            <span className="brand-subtitle">Network Telemetry</span>
          </div>
          <button className="sidebar-close-btn" onClick={onClose} aria-label="Close sidebar">
            <X size={18} />
          </button>
        </div>

        {/* Navigation Section */}
        <nav className="sidebar-nav">
          <div className="sidebar-nav-heading">NAVIGATION</div>
          {navLinks.map(({ to, label, icon: Icon, badge }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onClose}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} className="sidebar-link-icon" />
              <span>{label}</span>
              {badge && <span className="sidebar-live-tag">{badge}</span>}
            </NavLink>
          ))}
        </nav>

        {/* System Status Footer */}
        <div className="sidebar-footer">
          <div className="sidebar-status-card">
            <div className="status-row">
              <span className="status-label">Stream Socket</span>
              <span className={`status-badge-inline ${socketConnected ? 'online' : 'offline'}`}>
                {socketConnected ? 'Connected' : 'Offline'}
              </span>
            </div>
            <div className="status-row">
              <span className="status-label">Capture Engine</span>
              <span className={`status-badge-inline ${isCapturing ? 'running' : 'stopped'}`}>
                {isCapturing ? 'Running' : 'Stopped'}
              </span>
            </div>
          </div>
          <div className="sidebar-version-text">v1.0.0 • Full-Stack Pro</div>
        </div>
      </aside>
    </>
  );
}
