import React from 'react';
import { Activity, Database, HardDrive, Cpu, ArrowUpRight, TrendingUp } from 'lucide-react';

export default function StatsCards({ stats, isCapturing, livePps = 0 }) {
  const totalPackets = stats?.totalPackets || 0;
  const totalBytesFormatted = stats?.totalBytesFormatted || '0 Bytes';
  const protocolCount = stats?.protocolStats?.length || 0;
  const topProtocol = stats?.protocolStats?.[0]?.protocol || 'N/A';
  const topProtocolPct = stats?.protocolStats?.[0]?.percentage || '0';

  return (
    <div className="stats-grid">
      {/* Total Packets Card */}
      <div className="glass-card stat-card">
        <div className="stat-header">
          <span className="stat-label">Total Packets</span>
          <div className="stat-icon" style={{ color: '#38bdf8' }}>
            <Database size={18} />
          </div>
        </div>
        <div className="stat-value">{totalPackets.toLocaleString()}</div>
        <div className="stat-footer">
          <TrendingUp size={14} color="#10b981" />
          <span>Across all capture sessions</span>
        </div>
      </div>

      {/* Live Capture Rate / Status */}
      <div className="glass-card stat-card">
        <div className="stat-header">
          <span className="stat-label">Capture Engine</span>
          <div className="stat-icon" style={{ color: isCapturing ? '#10b981' : '#f43f5e' }}>
            <Activity size={18} />
          </div>
        </div>
        <div className="stat-value" style={{ color: isCapturing ? '#10b981' : '#9ca3af' }}>
          {isCapturing ? 'STREAMING' : 'IDLE'}
        </div>
        <div className="stat-footer">
          <span className={`status-dot ${isCapturing ? 'active' : 'stopped'}`} style={{ width: 6, height: 6 }} />
          <span>{isCapturing ? '300-800ms packet interval' : 'Click Start Capture to sniff'}</span>
        </div>
      </div>

      {/* Total Traffic Volume */}
      <div className="glass-card stat-card">
        <div className="stat-header">
          <span className="stat-label">Total Bandwidth</span>
          <div className="stat-icon" style={{ color: '#a855f7' }}>
            <HardDrive size={18} />
          </div>
        </div>
        <div className="stat-value">{totalBytesFormatted}</div>
        <div className="stat-footer">
          <span>Aggregated payload & headers</span>
        </div>
      </div>

      {/* Top Protocol */}
      <div className="glass-card stat-card">
        <div className="stat-header">
          <span className="stat-label">Dominant Protocol</span>
          <div className="stat-icon" style={{ color: '#f59e0b' }}>
            <Cpu size={18} />
          </div>
        </div>
        <div className="stat-value" style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
          <span>{topProtocol}</span>
          <span style={{ fontSize: '1rem', color: '#9ca3af', fontWeight: 500 }}>({topProtocolPct}%)</span>
        </div>
        <div className="stat-footer">
          <span>{protocolCount} protocols observed</span>
        </div>
      </div>
    </div>
  );
}
