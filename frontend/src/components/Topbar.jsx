import React from 'react';
import { Play, Square, Menu, Moon, Sun, RefreshCw, Radio } from 'lucide-react';
import { useCapture } from '../context/CaptureContext';

export default function Topbar({ onToggleSidebar, theme, onToggleTheme }) {
  const {
    isCapturing,
    socketConnected,
    backendAvailable,
    actionLoading,
    startCaptureSession,
    stopCaptureSession,
  } = useCapture();

  const handleToggleCapture = async () => {
    if (isCapturing) {
      await stopCaptureSession();
    } else {
      await startCaptureSession();
    }
  };

  return (
    <header className="app-topbar">
      <div className="topbar-left">
        <button
          className="topbar-menu-btn"
          onClick={onToggleSidebar}
          aria-label="Toggle navigation menu"
        >
          <Menu size={20} />
        </button>

        <div className="topbar-title-area">
          <div className="status-pill-topbar">
            <span className={`status-dot ${isCapturing ? 'active' : 'stopped'}`} />
            <span className="status-text">
              {isCapturing ? 'CAPTURE ACTIVE' : 'CAPTURE IDLE'}
            </span>
          </div>

          {!backendAvailable && (
            <div className="backend-offline-badge" title="Backend server is unreachable">
              Server Disconnected
            </div>
          )}
        </div>
      </div>

      <div className="topbar-right">
        {/* Theme Toggle Button (Day 10) */}
        <button
          className="btn-icon-topbar"
          onClick={onToggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
          aria-label="Toggle Theme"
        >
          {theme === 'dark' ? <Sun size={18} color="#f59e0b" /> : <Moon size={18} color="#38bdf8" />}
        </button>

        {/* Global Start / Stop Capture Button */}
        <button
          id="btn-global-capture"
          className={`btn ${isCapturing ? 'btn-danger' : 'btn-primary'}`}
          onClick={handleToggleCapture}
          disabled={actionLoading || !backendAvailable}
        >
          {actionLoading ? (
            <>
              <RefreshCw size={15} className="spin" />
              <span>Updating...</span>
            </>
          ) : isCapturing ? (
            <>
              <Square size={15} />
              <span>Stop Capture</span>
            </>
          ) : (
            <>
              <Play size={15} />
              <span>Start Capture</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
}
