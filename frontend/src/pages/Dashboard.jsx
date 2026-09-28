import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import StatCard from '../components/StatCard';
import PacketTable from '../components/PacketTable';
import PacketDetailsModal from '../components/PacketDetailsModal';
import packetApi from '../api/packetApi';
import { useCapture } from '../context/CaptureContext';
import {
  Database,
  HardDrive,
  Activity,
  Layers,
  ArrowRight,
  AlertTriangle,
  RefreshCw,
  Radio,
} from 'lucide-react';

export default function Dashboard() {
  const navigate = useNavigate();
  const { isCapturing, stats, refreshCaptureState } = useCapture();

  const [recentPackets, setRecentPackets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPacket, setSelectedPacket] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch 10 most recent packets
      const packetsRes = await packetApi.getPackets({ limit: 10, page: 1 });
      if (packetsRes.success) {
        setRecentPackets(packetsRes.packets);
      }
      await refreshCaptureState();
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError(err.message || 'Failed to communicate with backend server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const totalPackets = stats?.totalPackets || 0;
  const totalBytesFormatted = stats?.totalBytesFormatted || '0 Bytes';
  const protocolCount = stats?.protocolStats?.length || 0;
  const topProtocol = stats?.protocolStats?.[0]?.protocol || 'N/A';

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Network Overview Dashboard</h1>
          <p className="page-subtitle">
            Real-time packet capture status, core performance telemetry, and traffic distribution
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary btn-sm" onClick={fetchDashboardData} disabled={loading}>
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            <span>Refresh</span>
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/live')}>
            <Radio size={14} />
            <span>Open Live Stream</span>
          </button>
        </div>
      </div>

      {/* Error Alert Box with Retry */}
      {error && (
        <div className="error-alert-banner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <AlertTriangle size={20} color="#f43f5e" />
            <div>
              <strong>Error Loading Data: </strong>
              <span>{error}</span>
            </div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={fetchDashboardData}>
            Retry Connection
          </button>
        </div>
      )}

      {/* StatCards Grid */}
      <div className="stats-grid">
        <StatCard
          title="Total Packets"
          value={totalPackets.toLocaleString()}
          icon={Database}
          subtitle="Captured across all sessions"
          loading={loading}
          color="cyan"
        />

        <StatCard
          title="Total Traffic Volume"
          value={totalBytesFormatted}
          icon={HardDrive}
          subtitle="Aggregated frame payloads"
          loading={loading}
          color="purple"
        />

        <StatCard
          title="Active Protocols"
          value={protocolCount.toString()}
          icon={Layers}
          subtitle={`Primary: ${topProtocol}`}
          loading={loading}
          color="amber"
        />

        <StatCard
          title="Capture Engine Status"
          value={isCapturing ? 'STREAMING' : 'IDLE'}
          icon={Activity}
          subtitle={isCapturing ? 'Generating 300-800ms packets' : 'Ready to capture'}
          loading={loading}
          color={isCapturing ? 'emerald' : 'rose'}
        />
      </div>

      {/* Recent Packets Section */}
      <div className="glass-card" style={{ marginTop: '1.5rem' }}>
        <div className="card-header-flex">
          <div>
            <h3 className="section-heading">Recent Network Packets</h3>
            <p className="section-subheading">Displaying the 10 most recently captured frames</p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={() => navigate('/history')}>
            <span>View Full History</span>
            <ArrowRight size={14} />
          </button>
        </div>

        <PacketTable
          packets={recentPackets}
          loading={loading}
          emptyMessage="No packet records found in database. Start a capture session on the Live Stream tab or run the seed script."
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
