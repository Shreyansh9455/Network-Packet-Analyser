import React, { useState, useEffect, useRef } from 'react';
import PacketTable from '../components/PacketTable';
import PacketDetailsModal from '../components/PacketDetailsModal';
import socket from '../api/socket';
import { useCapture } from '../context/CaptureContext';
import {
  Radio,
  Play,
  Square,
  Pause,
  PlayCircle,
  Trash2,
  Filter,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export default function LiveCapture() {
  const {
    isCapturing,
    socketConnected,
    actionLoading,
    startCaptureSession,
    stopCaptureSession,
  } = useCapture();

  const [livePackets, setLivePackets] = useState([]);
  const [isPaused, setIsPaused] = useState(false);
  const [filterProtocol, setFilterProtocol] = useState('');
  const [selectedPacket, setSelectedPacket] = useState(null);
  const [packetsReceivedCount, setPacketsReceivedCount] = useState(0);

  // Store isPaused in ref for socket event handler
  const isPausedRef = useRef(isPaused);
  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  const filterProtocolRef = useRef(filterProtocol);
  useEffect(() => {
    filterProtocolRef.current = filterProtocol;
  }, [filterProtocol]);

  // Socket.IO event subscription for real-time live packets
  useEffect(() => {
    const handleNewPacket = (packet) => {
      setPacketsReceivedCount((prev) => prev + 1);

      if (isPausedRef.current) return;

      const currentFilter = filterProtocolRef.current;
      if (currentFilter && packet.protocol !== currentFilter.toUpperCase()) {
        return;
      }

      setLivePackets((prev) => {
        // Tag with isNew for highlight animation
        const newEntry = { ...packet, isNew: true };
        const updated = [newEntry, ...prev];
        // Cap at 100 for high performance rendering
        return updated.slice(0, 100);
      });
    };

    socket.on('new-packet', handleNewPacket);

    return () => {
      socket.off('new-packet', handleNewPacket);
    };
  }, []);

  const handleClearStream = () => {
    setLivePackets([]);
  };

  const handleToggleCapture = async () => {
    if (isCapturing) {
      await stopCaptureSession();
    } else {
      await startCaptureSession();
    }
  };

  const protocolsList = ['TCP', 'UDP', 'HTTP', 'HTTPS', 'DNS', 'ICMP', 'ARP'];

  return (
    <div className="page-container">
      {/* Live Stream Header */}
      <div className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <h1 className="page-title">Real-Time Packet Stream</h1>
            <span className={`status-pill ${isCapturing ? 'status-pill-running' : 'status-pill-stopped'}`}>
              <span className={`status-dot ${isCapturing ? 'active' : 'stopped'}`} />
              <span>{isCapturing ? 'STREAMING LIVE' : 'STREAM IDLE'}</span>
            </span>
          </div>
          <p className="page-subtitle">
            Observing wire-level network frames over WebSocket. Newest packets appear on top in real-time.
          </p>
        </div>

        {/* Live Stream Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <button
            className={`btn ${isCapturing ? 'btn-danger' : 'btn-primary'}`}
            onClick={handleToggleCapture}
            disabled={actionLoading}
          >
            {isCapturing ? (
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
      </div>

      {/* Stream Metrics & Filter Toolbar */}
      <div className="glass-card" style={{ marginBottom: '1.25rem', padding: '1rem 1.25rem' }}>
        <div className="toolbar" style={{ marginBottom: 0 }}>
          {/* Protocol Filter Chips */}
          <div className="filter-group">
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>FILTER:</span>
            <button
              className={`chip-btn ${filterProtocol === '' ? 'active' : ''}`}
              onClick={() => setFilterProtocol('')}
            >
              All
            </button>
            {protocolsList.map((proto) => (
              <button
                key={proto}
                className={`chip-btn ${filterProtocol === proto ? 'active' : ''}`}
                onClick={() => setFilterProtocol(proto)}
              >
                {proto}
              </button>
            ))}
          </div>

          {/* Stream Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button
              className={`btn btn-sm ${isPaused ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => setIsPaused(!isPaused)}
              title={isPaused ? 'Resume live stream updates' : 'Pause live stream updates'}
            >
              {isPaused ? <PlayCircle size={15} /> : <Pause size={15} />}
              <span>{isPaused ? 'Resume Stream' : 'Pause Stream'}</span>
            </button>

            <button
              className="btn btn-secondary btn-sm"
              onClick={handleClearStream}
              title="Clear table view"
            >
              <Trash2 size={15} />
              <span>Clear View</span>
            </button>
          </div>
        </div>
      </div>

      {/* Live Table Card */}
      <div className="glass-card">
        <div className="card-header-flex" style={{ marginBottom: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Zap size={18} color="var(--accent-cyan)" />
            <h3 className="section-heading">Live Packet Buffer ({livePackets.length} / 100)</h3>
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            Total Frames Handled: <strong>{packetsReceivedCount}</strong>
          </span>
        </div>

        <PacketTable
          packets={livePackets}
          loading={false}
          emptyMessage={
            isCapturing
              ? 'Listening for incoming packets...'
              : 'Capture is currently idle. Click "Start Capture" to begin monitoring network frames.'
          }
          onSelectPacket={(pkt) => setSelectedPacket(pkt)}
        />
      </div>

      {/* Packet Inspection Modal */}
      {selectedPacket && (
        <PacketDetailsModal
          packet={selectedPacket}
          onClose={() => setSelectedPacket(null)}
        />
      )}
    </div>
  );
}
