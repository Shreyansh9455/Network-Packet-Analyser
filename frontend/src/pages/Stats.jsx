import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
} from 'recharts';
import StatCard from '../components/StatCard';
import packetApi from '../api/packetApi';
import {
  BarChart3,
  PieChart as PieIcon,
  TrendingUp,
  HardDrive,
  Database,
  Layers,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';

const PROTO_COLORS = {
  TCP: '#38bdf8',   // Blue / Cyan
  UDP: '#10b981',   // Green / Emerald
  HTTP: '#8b5cf6',  // Purple / Indigo
  HTTPS: '#a855f7', // Violet
  DNS: '#f59e0b',   // Yellow / Amber
  ICMP: '#f43f5e',  // Orange / Rose
  ARP: '#06b6d4',   // Teal
};

// Custom Tooltip for charts matching modern dark theme
const CustomTooltip = ({ active, payload, label, unit = '' }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="chart-custom-tooltip">
        <div className="tooltip-title">{label || data.name}</div>
        <div className="tooltip-value" style={{ color: data.color || data.payload?.fill || '#38bdf8' }}>
          {typeof data.value === 'number' ? data.value.toLocaleString() : data.value} {unit}
        </div>
      </div>
    );
  }
  return null;
};

export default function Stats() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await packetApi.getPacketStats();
      if (res.success) {
        setStats(res.stats);
      }
    } catch (err) {
      console.error('Error fetching statistics:', err);
      setError(err.message || 'Failed to retrieve aggregated analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const totalPackets = stats?.totalPackets || 0;
  const totalBytesFormatted = stats?.totalBytesFormatted || '0 Bytes';
  const protocolStats = stats?.protocolStats || [];
  const packetsTimeline = stats?.packetsPerMinute || [];

  // Format data for Recharts Pie
  const pieData = protocolStats.map((item) => ({
    name: item.protocol,
    value: item.count,
    color: PROTO_COLORS[item.protocol] || '#9ca3af',
  }));

  // Format data for Recharts Bar (Bytes per Protocol in KB)
  const barData = protocolStats.map((item) => ({
    protocol: item.protocol,
    volumeKB: parseFloat(((item.totalBytes || 0) / 1024).toFixed(2)),
    bytes: item.totalBytes || 0,
    fill: PROTO_COLORS[item.protocol] || '#38bdf8',
  }));

  return (
    <div className="page-container">
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Network Analytics & Metrics</h1>
          <p className="page-subtitle">
            Visual aggregation of protocol distributions, throughput timeline, and bandwidth consumption
          </p>
        </div>

        <button className="btn btn-secondary btn-sm" onClick={loadStats} disabled={loading}>
          <RefreshCw size={14} className={loading ? 'spin' : ''} />
          <span>Refresh Analytics</span>
        </button>
      </div>

      {/* Error Alert Box with Retry */}
      {error && (
        <div className="error-alert-banner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <AlertTriangle size={20} color="#f43f5e" />
            <div>
              <strong>Failed to Load Analytics: </strong>
              <span>{error}</span>
            </div>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={loadStats}>
            Retry
          </button>
        </div>
      )}

      {/* Top Stat Cards */}
      <div className="stats-grid">
        <StatCard
          title="Total Packets"
          value={totalPackets.toLocaleString()}
          icon={Database}
          subtitle="Processed packets"
          loading={loading}
          color="cyan"
        />
        <StatCard
          title="Total Volume"
          value={totalBytesFormatted}
          icon={HardDrive}
          subtitle="Network traffic analyzed"
          loading={loading}
          color="purple"
        />
        <StatCard
          title="Protocol Diversity"
          value={`${protocolStats.length} Protocols`}
          icon={Layers}
          subtitle="Types identified"
          loading={loading}
          color="amber"
        />
        <StatCard
          title="Average Packet Size"
          value={
            totalPackets > 0
              ? `${Math.round((stats?.totalBytes || 0) / totalPackets)} Bytes`
              : '0 Bytes'
          }
          icon={TrendingUp}
          subtitle="Mean frame payload"
          loading={loading}
          color="emerald"
        />
      </div>

      {/* Charts Grid */}
      <div className="charts-grid" style={{ marginTop: '1.5rem' }}>
        {/* Chart 1: Donut Chart - Protocol Breakdown */}
        <div className="glass-card chart-card">
          <div className="chart-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <PieIcon size={18} color="var(--accent-cyan)" />
              <h3 className="section-heading">Protocol Distribution</h3>
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>By packet count</span>
          </div>

          <div style={{ height: 300, width: '100%' }}>
            {pieData.length === 0 ? (
              <div className="chart-empty">No protocol data available</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} stroke="rgba(0,0,0,0.5)" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip unit="packets" />} />
                  <Legend
                    wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }}
                    formatter={(val) => <span style={{ color: 'var(--text-main)' }}>{val}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Chart 2: Bar Chart - Bandwidth by Protocol */}
        <div className="glass-card chart-card">
          <div className="chart-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <HardDrive size={18} color="var(--accent-purple)" />
              <h3 className="section-heading">Bandwidth Volume by Protocol</h3>
            </div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Volume in Kilobytes (KB)</span>
          </div>

          <div style={{ height: 300, width: '100%' }}>
            {barData.length === 0 ? (
              <div className="chart-empty">No bandwidth data available</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 15, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="protocol" stroke="var(--text-muted)" fontSize={12} />
                  <YAxis stroke="var(--text-muted)" fontSize={12} unit=" KB" />
                  <Tooltip content={<CustomTooltip unit="KB" />} />
                  <Bar dataKey="volumeKB" radius={[6, 6, 0, 0]}>
                    {barData.map((entry) => (
                      <Cell key={entry.protocol} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Chart 3: Line Chart - Packets per Minute Timeline */}
      <div className="glass-card chart-card" style={{ marginTop: '1.5rem' }}>
        <div className="chart-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={18} color="var(--accent-emerald)" />
            <h3 className="section-heading">Packets Captured Per Minute (Last 1 Hour)</h3>
          </div>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Timeline trend</span>
        </div>

        <div style={{ height: 260, width: '100%' }}>
          {packetsTimeline.length === 0 ? (
            <div className="chart-empty">
              No recent packets recorded in the past hour. Start capture to observe timeline spikes.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={packetsTimeline} margin={{ top: 15, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="minute" stroke="var(--text-muted)" fontSize={12} />
                <YAxis stroke="var(--text-muted)" fontSize={12} />
                <Tooltip content={<CustomTooltip unit="packets" />} />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ r: 4, fill: '#10b981' }}
                  activeDot={{ r: 6, fill: '#34d399' }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
