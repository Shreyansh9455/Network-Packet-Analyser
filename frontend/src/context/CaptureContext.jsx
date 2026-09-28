import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import packetApi from '../api/packetApi';
import socket from '../api/socket';
import { useToast } from './ToastContext';

const CaptureContext = createContext(null);

export function CaptureProvider({ children }) {
  const { showToast } = useToast();
  const [isCapturing, setIsCapturing] = useState(false);
  const [activeSession, setActiveSession] = useState(null);
  const [stats, setStats] = useState(null);
  const [socketConnected, setSocketConnected] = useState(socket.connected);
  const [backendAvailable, setBackendAvailable] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch capture status and aggregated stats from backend
  const refreshCaptureState = useCallback(async () => {
    try {
      const [statusRes, statsRes] = await Promise.all([
        packetApi.getCaptureStatus(),
        packetApi.getPacketStats(),
      ]);

      if (statusRes.success) {
        setIsCapturing(statusRes.isRunning);
        setActiveSession(statusRes.activeSession);
      }

      if (statsRes.success) {
        setStats(statsRes.stats);
      }

      setBackendAvailable(true);
    } catch (err) {
      console.warn('Backend sync error:', err.message);
      setBackendAvailable(false);
    }
  }, []);

  // Socket.IO event synchronization
  useEffect(() => {
    refreshCaptureState();

    const onConnect = () => {
      setSocketConnected(true);
      setBackendAvailable(true);
      showToast('Connected to real-time packet stream', 'success', 3000);
      refreshCaptureState();
    };

    const onDisconnect = () => {
      setSocketConnected(false);
      showToast('Disconnected from server stream. Attempting reconnect...', 'warning', 4000);
    };

    const onCaptureStatus = (data) => {
      setIsCapturing(data.isRunning);
      setActiveSession(data.session);
      if (data.isRunning) {
        showToast('Packet capture session initiated!', 'info', 3000);
      } else {
        showToast('Packet capture session stopped.', 'info', 3000);
      }
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('capture-status', onCaptureStatus);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('capture-status', onCaptureStatus);
    };
  }, [refreshCaptureState, showToast]);

  // Start capture action
  const startCaptureSession = async () => {
    setActionLoading(true);
    try {
      const res = await packetApi.startCapture();
      if (res.success) {
        setIsCapturing(true);
        setActiveSession(res.session);
        showToast('Packet capture started successfully', 'success');
        refreshCaptureState();
      }
      return res;
    } catch (err) {
      showToast(err.message || 'Failed to start packet capture', 'error');
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  // Stop capture action
  const stopCaptureSession = async () => {
    setActionLoading(true);
    try {
      const res = await packetApi.stopCapture();
      if (res.success) {
        setIsCapturing(false);
        setActiveSession(res.session);
        showToast('Packet capture stopped successfully', 'success');
        refreshCaptureState();
      }
      return res;
    } catch (err) {
      showToast(err.message || 'Failed to stop packet capture', 'error');
      throw err;
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <CaptureContext.Provider
      value={{
        isCapturing,
        activeSession,
        stats,
        socketConnected,
        backendAvailable,
        actionLoading,
        startCaptureSession,
        stopCaptureSession,
        refreshCaptureState,
      }}
    >
      {children}
    </CaptureContext.Provider>
  );
}

export const useCapture = () => {
  const context = useContext(CaptureContext);
  if (!context) {
    throw new Error('useCapture must be used within a CaptureProvider');
  }
  return context;
};
