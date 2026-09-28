import React, { useState, useEffect } from 'react';
import { BarChart2, Activity, HardDrive, Cpu, RefreshCw } from 'lucide-react';
import { fetchStats } from '../api/api';
import ProtocolChart from '../components/ProtocolChart';

export default function AnalyticsPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadStats = async () => {
    setLoading(true);
    try {
      const res = await fetchStats();
      if (res.success) {
        setStats(res.stats);
      }
    } catch (err) {
      console.error('Failed to load analytics stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const formatBytes = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  return (
    <div>
      <div className="glass-card" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <BarChart2 size={20} color="#38bdf8" />
              Network Traffic Analytics
            </h2>
            <p style={{ color: '#9ca3af', fontSize: '0.875rem', marginTop: '0.25rem' }}>
              Deep aggregation metrics, protocol bandwidth utilization, and packet volume distribution
            </p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={loadStats}>
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Protocol Visual Distribution */}
      <ProtocolChart protocolStats={stats?.protocolStats || []} />

      {/* Protocol Metric Table */}
      <div className="glass-card">
        <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Cpu size={18} color="#a855f7" />
          Protocol Metric Summary
        </h3>

        <div className="table-container">
          <table className="packet-table">
            <thead>
              <tr>
                <th>Protocol</th>
                <th>Packets Count</th>
                <th>Traffic Percentage</th>
                <th>Total Volume (Bytes)</th>
                <th>Avg Packet Length</th>
              </tr>
            </thead>
            <tbody>
              {!stats?.protocolStats || stats.protocolStats.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: '#6b7280' }}>
                    No analytics available yet.
                  </td>
                </tr>
              ) : (
                stats.protocolStats.map((item) => (
                  <tr key={item.protocol}>
                    <td>
                      <span className="proto-badge proto-tcp" style={{ fontSize: '0.8rem' }}>
                        {item.protocol}
                      </span>
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                      {item.count.toLocaleString()}
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden', maxWidth: '100px' }}>
                          <div style={{ width: `${item.percentage}%`, height: '100%', background: '#38bdf8' }} />
                        </div>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: '#9ca3af' }}>
                          {item.percentage}%
                        </span>
                      </div>
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', color: '#a855f7' }}>
                      {formatBytes(item.totalBytes)}
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', color: '#9ca3af' }}>
                      {item.avgLength} Bytes
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
