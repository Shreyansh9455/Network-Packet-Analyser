import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Activity, Play, Square, Radio, Layers, BarChart2, Shield } from 'lucide-react';

export default function Header({ isConnected, isCapturing, onToggleCapture, captureLoading }) {
  const location = useLocation();

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="brand-section">
          <div className="brand-icon-wrapper">
            <Radio size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span className="brand-title">PacketPulse</span>
              <span className="brand-badge">Live Analyser</span>
            </div>
          </div>
        </Link>

        <nav className="nav-links">
          <Link
            to="/"
            className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}
          >
            <Activity size={16} />
            Dashboard
          </Link>
          <Link
            to="/sessions"
            className={`nav-item ${location.pathname === '/sessions' ? 'active' : ''}`}
          >
            <Layers size={16} />
            Capture Sessions
          </Link>
          <Link
            to="/analytics"
            className={`nav-item ${location.pathname === '/analytics' ? 'active' : ''}`}
          >
            <BarChart2 size={16} />
            Protocol Analytics
          </Link>
        </nav>

        <div className="nav-actions">
          {/* Socket Connection Status */}
          <div className="status-pill" title={isConnected ? 'Connected to backend Socket.IO' : 'Disconnected from server'}>
            <span className={`status-dot ${isConnected ? 'active' : 'stopped'}`} />
            <span style={{ color: isConnected ? '#10b981' : '#f43f5e' }}>
              {isConnected ? 'LIVE FEED' : 'OFFLINE'}
            </span>
          </div>

          {/* Start / Stop Capture Control */}
          <button
            id="btn-toggle-capture"
            className={`btn ${isCapturing ? 'btn-danger' : 'btn-success'}`}
            onClick={onToggleCapture}
            disabled={captureLoading}
          >
            {captureLoading ? (
              <span>Processing...</span>
            ) : isCapturing ? (
              <>
                <Square size={16} />
                <span>Stop Capture</span>
              </>
            ) : (
              <>
                <Play size={16} />
                <span>Start Capture</span>
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
